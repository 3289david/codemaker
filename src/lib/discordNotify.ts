import "server-only";
import { getSettings } from "@/lib/settings";

// Discord 알림은 웹훅(설정 URL) 또는 봇 토큰+채널ID REST 호출 중 설정된 쪽을 사용한다.
// 실패하거나 미설정이어도 주문 자체(핵심 트랜잭션)에는 절대 영향을 주지 않도록 항상 조용히 무시한다.

async function sendEmbed(embed: Record<string, unknown>) {
  const settings = await getSettings();
  if (!settings.discordNotifyEnabled) return;

  try {
    if (settings.discordWebhookUrl) {
      await fetch(settings.discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });
      return;
    }

    if (settings.discordBotToken && settings.discordNotifyChannelId) {
      await fetch(`https://discord.com/api/v10/channels/${settings.discordNotifyChannelId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${settings.discordBotToken}`,
        },
        body: JSON.stringify({ embeds: [embed] }),
      });
    }
  } catch {
    // 네트워크 오류는 무시 - 알림은 부가 기능이다.
  }
}

export async function notifyDiscordNewOrder(params: {
  orderNo: string;
  title: string;
  projectType: string;
  contactEmail: string;
  budget?: string | null;
}) {
  await sendEmbed({
    title: `🆕 새 주문 접수 - #${params.orderNo}`,
    color: 0x6366f1,
    fields: [
      { name: "제목", value: params.title },
      { name: "유형", value: params.projectType, inline: true },
      { name: "연락처", value: params.contactEmail, inline: true },
      { name: "예산", value: params.budget || "미기재", inline: true },
    ],
    timestamp: new Date().toISOString(),
  });
}
