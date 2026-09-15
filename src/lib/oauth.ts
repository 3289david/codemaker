import "server-only";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getAppOrigin } from "@/lib/appUrl";
import { createAdminSession, getClientInfo } from "@/lib/session";

export function googleRedirectUri() {
  return `${getAppOrigin()}/api/auth/google/callback`;
}

export function githubRedirectUri() {
  return `${getAppOrigin()}/api/auth/github/callback`;
}

export function discordRedirectUri() {
  return `${getAppOrigin()}/api/auth/discord/callback`;
}

// ── Google ───────────────────────────────────────────────────

export async function getGoogleAuthUrl(state: string) {
  const settings = await getSettings();
  const params = new URLSearchParams({
    client_id: settings.googleClientId,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  const settings = await getSettings();
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: settings.googleClientId,
      client_secret: settings.googleClientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) throw new Error(`google token exchange failed: ${await tokenRes.text()}`);
  const tokenData: { access_token?: string } = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("google token exchange returned no access_token");

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userRes.ok) throw new Error("google userinfo request failed");
  const profile: { email?: string; sub: string; name?: string; picture?: string } = await userRes.json();
  return profile;
}

// ── GitHub ───────────────────────────────────────────────────

export async function getGithubAuthUrl(state: string) {
  const settings = await getSettings();
  const params = new URLSearchParams({
    client_id: settings.githubClientId,
    redirect_uri: githubRedirectUri(),
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGithubCode(code: string) {
  const settings = await getSettings();
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      code,
      client_id: settings.githubClientId,
      client_secret: settings.githubClientSecret,
      redirect_uri: githubRedirectUri(),
    }),
  });
  if (!tokenRes.ok) throw new Error(`github token exchange failed: ${await tokenRes.text()}`);
  const tokenData: { access_token?: string; error?: string } = await tokenRes.json();
  if (!tokenData.access_token) throw new Error(`github token exchange failed: ${tokenData.error || "unknown"}`);

  const headers = {
    Authorization: `Bearer ${tokenData.access_token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "CodeMaker-App",
  };
  const userRes = await fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) throw new Error("github user request failed");
  const profile: { id: number; email: string | null; name: string | null; login: string; avatar_url?: string } =
    await userRes.json();

  let email = profile.email ?? undefined;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
    if (emailsRes.ok) {
      const emails: { email: string; primary: boolean; verified: boolean }[] = await emailsRes.json();
      const best = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
      email = best?.email;
    }
  }

  return { email, id: String(profile.id), name: profile.name || profile.login, picture: profile.avatar_url };
}

// ── Discord ──────────────────────────────────────────────────

export async function getDiscordAuthUrl(state: string) {
  const settings = await getSettings();
  // Discord는 봇과 OAuth 클라이언트가 같은 애플리케이션 ID를 공유한다.
  const clientId = process.env.DISCORD_OAUTH_CLIENT_ID || process.env.DISCORD_CLIENT_ID || "";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: discordRedirectUri(),
    response_type: "code",
    scope: "identify email",
    state,
  });
  void settings; // 예약: 추후 DB에서 client_id를 override할 경우를 대비
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export async function exchangeDiscordCode(code: string) {
  const clientId = process.env.DISCORD_OAUTH_CLIENT_ID || process.env.DISCORD_CLIENT_ID || "";
  const clientSecret = process.env.DISCORD_OAUTH_CLIENT_SECRET || "";

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: discordRedirectUri(),
    }),
  });
  if (!tokenRes.ok) throw new Error(`discord token exchange failed: ${await tokenRes.text()}`);
  const tokenData: { access_token?: string } = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("discord token exchange returned no access_token");

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userRes.ok) throw new Error("discord user request failed");
  const profile: { id: string; email?: string | null; username: string; global_name?: string | null; avatar?: string | null } =
    await userRes.json();

  const picture = profile.avatar
    ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
    : undefined;

  return { email: profile.email ?? undefined, id: profile.id, name: profile.global_name || profile.username, picture };
}

// ── 고객 계정: 이메일 기준 find-or-create, provider id 연결 ────

export async function findOrCreateOAuthUser(params: {
  email: string;
  name?: string;
  provider: "google" | "github" | "discord";
  providerId: string;
  picture?: string;
}) {
  const { provider, providerId, name, picture } = params;
  const email = params.email.toLowerCase();

  const providerField =
    provider === "google" ? "googleId" : provider === "github" ? "githubId" : "discordOAuthId";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing[providerField]) return existing;
    return prisma.user.update({
      where: { id: existing.id },
      data: { [providerField]: providerId },
    });
  }

  return prisma.user.create({
    data: {
      email,
      nickname: name || email.split("@")[0],
      profileImage: picture || null,
      emailVerified: true,
      [providerField]: providerId,
    },
  });
}

// ── 관리자: Google 이메일이 AdminUser.email과 일치할 때만 세션 발급 ──
// 일치하는 관리자가 없으면 세션을 발급하지 않고 null을 반환한다 (임의 계정 자동 생성 금지).
export async function adminGoogleLogin(email: string) {
  const normalized = email.toLowerCase();
  const admin = await prisma.adminUser.findFirst({
    where: { email: { equals: normalized } },
  });
  const { ip, userAgent } = await getClientInfo();

  if (!admin || admin.status !== "ACTIVE") {
    await prisma.adminLoginLog.create({
      data: {
        adminId: admin?.id ?? null,
        loginId: admin?.loginId ?? normalized,
        ip,
        userAgent,
        success: false,
        reason: admin ? "DISABLED" : "NO_MATCHING_ADMIN_EMAIL",
      },
    });
    return null;
  }

  await prisma.adminLoginLog.create({
    data: { adminId: admin.id, loginId: admin.loginId, ip, userAgent, success: true, reason: "google-oauth" },
  });
  await createAdminSession(admin.id);
  return admin;
}
