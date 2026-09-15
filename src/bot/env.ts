import "dotenv/config";
import { getSettings } from "@/lib/settings";

// 봇 토큰/서버(길드) ID는 관리자 패널(Settings, DB) 값이 우선이고 없으면 .env로 폴백한다
// (src/lib/settings.ts 참고). CLIENT_ID(Discord 애플리케이션 ID)는 자주 바뀌지 않고
// 민감정보도 아니라서 환경변수로만 관리한다.
export async function getBotConfig() {
  const settings = await getSettings();
  const clientId = process.env.DISCORD_CLIENT_ID || "";
  return {
    token: settings.discordBotToken,
    clientId,
    guildId: settings.discordGuildId || undefined,
  };
}
