import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { prisma } from "@/lib/prisma";
import { requireBotAdmin } from "@/bot/discordAuth";
import { successEmbed } from "@/bot/format";
import type { BotCommand } from "@/bot/types";

export const noticeCreateCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("공지")
    .setDescription("[관리자] 웹사이트에 공지사항을 등록합니다.")
    .addStringOption((o) => o.setName("제목").setDescription("공지 제목").setRequired(true))
    .addStringOption((o) => o.setName("내용").setDescription("공지 내용").setRequired(true))
    .addStringOption((o) =>
      o
        .setName("카테고리")
        .setDescription("공지 카테고리 (기본: 서비스 공지)")
        .addChoices(
          { name: "서비스 공지", value: "SERVICE" },
          { name: "가격변경", value: "PRICE" },
          { name: "휴무", value: "HOLIDAY" },
          { name: "이벤트", value: "EVENT" },
          { name: "점검", value: "MAINTENANCE" }
        )
    )
    .addBooleanOption((o) => o.setName("고정").setDescription("상단 고정 여부 (기본: 아니오)")),
  async execute(interaction) {
    await requireBotAdmin(interaction);
    const title = interaction.options.getString("제목", true);
    const content = interaction.options.getString("내용", true);
    const category = interaction.options.getString("카테고리") || "SERVICE";
    const pinned = interaction.options.getBoolean("고정") ?? false;

    const notice = await prisma.notice.create({ data: { title, content, category, pinned } });

    await interaction.reply({
      embeds: [successEmbed(`공지 "${notice.title}"가 등록되었습니다. (카테고리: ${category}${pinned ? ", 고정됨" : ""})`)],
      flags: MessageFlags.Ephemeral,
    });
  },
};
