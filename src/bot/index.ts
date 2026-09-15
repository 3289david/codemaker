import { Client, GatewayIntentBits, Events, MessageFlags } from "discord.js";
import { getBotConfig } from "@/bot/env";
import { commandsByName } from "@/bot/commandRegistry";
import { errorEmbed } from "@/bot/format";
import { NotAllowedError } from "@/bot/discordAuth";

async function main() {
  const { token } = await getBotConfig();

  if (!token) {
    // 토큰 미설정은 정상적인 초기 상태다(관리자가 아직 Discord 봇을 연결하지 않음).
    // PM2가 무한 재시작 루프에 빠지지 않도록 에러 없이 종료한다.
    console.log(
      "Discord bot disabled: no token configured (set DISCORD_BOT_TOKEN in .env or 관리자 설정 > Discord 봇 토큰)."
    );
    return;
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, (c) => {
    console.log(`✅ CodeMaker 봇 로그인 완료: ${c.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commandsByName.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      const message =
        err instanceof NotAllowedError
          ? err.message
          : err instanceof Error
            ? err.message
            : "처리 중 오류가 발생했습니다.";
      if (!(err instanceof NotAllowedError)) console.error(`명령어 처리 중 오류 (${interaction.commandName}):`, err);

      const payload = { embeds: [errorEmbed(message)], flags: MessageFlags.Ephemeral } as const;
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [errorEmbed(message)] }).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  });

  await client.login(token);
}

main().catch((err) => {
  console.error("봇 실행 중 치명적 오류:", err);
  process.exit(1);
});
