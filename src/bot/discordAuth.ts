import type { ChatInputCommandInteraction } from "discord.js";
import { getSettings } from "@/lib/settings";

// codemaker 봇의 관리자 명령어(/주문목록, /주문, /공지)는 웹 관리자 계정과 별개로,
// Settings(관리자 패널)에 등록된 Discord 유저 ID 또는 역할 ID를 가진 사람만 사용할 수 있다.
export class NotAllowedError extends Error {}

function memberRoleIds(interaction: ChatInputCommandInteraction): string[] {
  const member = interaction.member;
  if (!member) return [];
  const roles = member.roles as unknown;
  if (Array.isArray(roles)) return roles; // APIInteractionGuildMember: roles는 string[]
  if (roles && typeof roles === "object" && "cache" in (roles as Record<string, unknown>)) {
    // 캐시된 GuildMember: roles는 RoleManager(.cache가 Collection<string, Role>)
    return Array.from((roles as { cache: Map<string, unknown> }).cache.keys());
  }
  return [];
}

export async function requireBotAdmin(interaction: ChatInputCommandInteraction) {
  const settings = await getSettings();
  const { discordAdminUserIds, discordAdminRoleIds } = settings;

  if (discordAdminUserIds.length === 0 && discordAdminRoleIds.length === 0) {
    throw new NotAllowedError(
      "관리자 명령어를 사용할 수 있는 사람이 설정되어 있지 않습니다. 관리자 패널 설정에서 Discord 관리자 유저/역할 ID를 등록해주세요."
    );
  }

  if (discordAdminUserIds.includes(interaction.user.id)) return;
  if (memberRoleIds(interaction).some((r) => discordAdminRoleIds.includes(r))) return;

  throw new NotAllowedError("이 명령어를 사용할 권한이 없습니다.");
}
