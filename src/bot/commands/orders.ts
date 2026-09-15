import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { prisma } from "@/lib/prisma";
import { requireBotAdmin } from "@/bot/discordAuth";
import { baseEmbed, errorEmbed, won } from "@/bot/format";
import { getAppOrigin } from "@/lib/appUrl";
import type { BotCommand } from "@/bot/types";

export const orderListCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("주문목록")
    .setDescription("[관리자] 최근 주문 목록을 봅니다 (기본: 진행 중인 주문).")
    .addStringOption((o) =>
      o
        .setName("상태")
        .setDescription("필터할 상태 (비워두면 취소/완료 제외 전체)")
        .addChoices(
          { name: "접수", value: "접수" },
          { name: "견적확인", value: "견적확인" },
          { name: "결제대기", value: "결제대기" },
          { name: "제작중", value: "제작중" },
          { name: "검수중", value: "검수중" },
          { name: "수정중", value: "수정중" },
          { name: "완료", value: "완료" },
          { name: "취소", value: "취소" }
        )
    ),
  async execute(interaction) {
    await requireBotAdmin(interaction);
    const status = interaction.options.getString("상태");

    const orders = await prisma.order.findMany({
      where: status ? { status } : { status: { notIn: ["완료", "취소"] } },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const embed = baseEmbed(status ? `📋 주문 목록 (${status})` : "📋 진행 중인 주문 목록");
    if (orders.length === 0) {
      embed.setDescription("해당하는 주문이 없습니다.");
    } else {
      for (const o of orders) {
        embed.addFields({
          name: `#${o.orderNo} · ${o.status}`,
          value: `${o.title} · ${o.contactEmail}${o.estimatedPriceMin ? ` · 예상 ${won(o.estimatedPriceMin)}~${won(o.estimatedPriceMax ?? o.estimatedPriceMin)}` : ""}`,
        });
      }
    }
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export const orderDetailCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("주문")
    .setDescription("[관리자] 주문 상세 정보를 봅니다.")
    .addStringOption((o) => o.setName("주문번호").setDescription("예: A-10001").setRequired(true)),
  async execute(interaction) {
    await requireBotAdmin(interaction);
    const orderNo = interaction.options.getString("주문번호", true).trim().replace(/^#/, "");

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: { quote: true, payment: true },
    });

    if (!order) {
      return interaction.reply({ embeds: [errorEmbed(`주문번호 #${orderNo}를 찾을 수 없습니다.`)], flags: MessageFlags.Ephemeral });
    }

    const embed = baseEmbed(`📦 주문 #${order.orderNo}`)
      .setDescription(order.title)
      .addFields(
        { name: "상태", value: order.status, inline: true },
        { name: "진행률", value: `${order.progress}%`, inline: true },
        { name: "유형", value: order.projectType, inline: true },
        { name: "연락처", value: order.contactEmail, inline: true },
        { name: "전화", value: order.contactPhone || "미기재", inline: true },
        { name: "Discord", value: order.contactDiscord || "미기재", inline: true }
      );

    if (order.quote) {
      embed.addFields({ name: "견적 금액", value: `${won(order.quote.amount)} (${order.quote.status})`, inline: true });
    }
    if (order.payment) {
      embed.addFields({ name: "결제 상태", value: order.payment.status, inline: true });
    }
    embed.addFields({ name: "관리자 페이지", value: `${getAppOrigin()}/admin/orders/${order.id}` });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
