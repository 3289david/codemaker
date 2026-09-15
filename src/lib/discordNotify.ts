// DISCORD_WEBHOOK_URL이 설정된 경우에만 알림을 보낸다. 실패하거나 미설정이어도
// 주문 자체(핵심 트랜잭션)에는 절대 영향을 주지 않도록 항상 조용히 무시한다.

export async function notifyDiscordNewOrder(params: {
  orderNo: string;
  title: string;
  projectType: string;
  contactEmail: string;
  budget?: string | null;
}) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: `🆕 새 주문 접수 - #${params.orderNo}`,
            color: 0x6366f1,
            fields: [
              { name: "제목", value: params.title },
              { name: "유형", value: params.projectType, inline: true },
              { name: "연락처", value: params.contactEmail, inline: true },
              { name: "예산", value: params.budget || "미기재", inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch {
    // 네트워크 오류는 무시 - 알림은 부가 기능이다.
  }
}
