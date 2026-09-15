// 주의: 이 파일은 Next.js 서버 코드뿐 아니라 독립 실행되는 Discord 봇 프로세스
// (src/bot/*, tsx로 직접 실행)에서도 임포트되므로 "server-only"를 붙이지 않는다.
import { prisma } from "@/lib/prisma";

// 관리자 패널(/admin/settings)에서 편집한 값(DB)이 있으면 그것을 쓰고, 없으면(빈 값/미설정)
// 동일한 이름의 환경변수로 폴백한다. 이렇게 하면 .env만으로도 바로 동작하고,
// 운영 중에는 재배포 없이 관리자가 값을 바꿀 수 있다.

function csv(value: string | null | undefined): string[] {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type AppSettings = {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  metaDescription: string;

  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  noticeMessage: string | null;

  allowGuestOrders: boolean;
  autoApproveReviews: boolean;

  discordWebhookUrl: string;
  discordNotifyEnabled: boolean;
  discordNotifyChannelId: string;
  discordBotToken: string;
  discordGuildId: string;
  discordAdminRoleIds: string[];
  discordAdminUserIds: string[];

  googleClientId: string;
  googleClientSecret: string;
  githubClientId: string;
  githubClientSecret: string;
  discordOAuthClientId: string;
  discordOAuthClientSecret: string;
};

export async function getSettings(): Promise<AppSettings> {
  const s = await prisma.setting.findUnique({ where: { id: "singleton" } });

  return {
    companyName: s?.companyName || "CodeMaker",
    contactEmail: s?.contactEmail || process.env.CONTACT_EMAIL || "",
    contactPhone: s?.contactPhone || process.env.CONTACT_PHONE || "",
    metaDescription: s?.metaDescription || "코드 아웃소싱 / 개발 대행 플랫폼 CodeMaker",

    bankName: s?.bankName || "카카오뱅크",
    bankAccountNumber: s?.bankAccountNumber || "3333-00-1234567",
    bankAccountHolder: s?.bankAccountHolder || "코드메이커(주)",
    noticeMessage: s?.noticeMessage ?? null,

    allowGuestOrders: s?.allowGuestOrders ?? true,
    autoApproveReviews: s?.autoApproveReviews ?? false,

    discordWebhookUrl: s?.discordWebhookUrl || process.env.DISCORD_WEBHOOK_URL || "",
    discordNotifyEnabled: s?.discordNotifyEnabled ?? true,
    discordNotifyChannelId: s?.discordNotifyChannelId || process.env.DISCORD_NOTIFY_CHANNEL_ID || "",
    discordBotToken: s?.discordBotToken || process.env.DISCORD_BOT_TOKEN || "",
    discordGuildId: s?.discordGuildId || process.env.DISCORD_GUILD_ID || "",
    discordAdminRoleIds: csv(s?.discordAdminRoleIds || process.env.DISCORD_ADMIN_ROLE_IDS),
    discordAdminUserIds: csv(s?.discordAdminUserIds || process.env.DISCORD_ADMIN_USER_IDS),

    googleClientId: s?.googleClientId || process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: s?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || "",
    githubClientId: s?.githubClientId || process.env.GITHUB_CLIENT_ID || "",
    githubClientSecret: s?.githubClientSecret || process.env.GITHUB_CLIENT_SECRET || "",
    discordOAuthClientId:
      s?.discordOAuthClientId || process.env.DISCORD_OAUTH_CLIENT_ID || process.env.DISCORD_CLIENT_ID || "",
    discordOAuthClientSecret: s?.discordOAuthClientSecret || process.env.DISCORD_OAUTH_CLIENT_SECRET || "",
  };
}

// 관리자 UI에서 시크릿을 마스킹해서 보여줄 때 쓰는 헬퍼: 뒤 4자리만 노출.
export function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return "*".repeat(value.length);
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}
