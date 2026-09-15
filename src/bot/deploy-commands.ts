import { REST, Routes } from "discord.js";
import { getBotConfig } from "@/bot/env";
import { commands } from "@/bot/commandRegistry";

async function main() {
  const { token, clientId, guildId } = await getBotConfig();
  if (!token) throw new Error("DISCORD_BOT_TOKEN이 설정되지 않았습니다 (관리자 설정 또는 .env 확인).");
  if (!clientId) throw new Error("DISCORD_CLIENT_ID 환경변수가 설정되지 않았습니다.");

  const rest = new REST().setToken(token);
  const body = commands.map((c) => c.data.toJSON());

  console.log(`슬래시 커맨드 ${body.length}개를 등록합니다...`);

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
    console.log(`길드(${guildId}) 전용으로 등록 완료 - 즉시 반영됩니다.`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body });
    console.log("전역 등록 완료 - 모든 서버에 반영되기까지 최대 1시간 정도 걸릴 수 있습니다.");
  }
}

main().catch((err) => {
  console.error("커맨드 등록 실패:", err);
  process.exitCode = 1;
});
