import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, findOrCreateOAuthUser, adminGoogleLogin } from "@/lib/oauth";
import { createUserSession } from "@/lib/session";
import { getAppOrigin } from "@/lib/appUrl";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const stateParam = req.nextUrl.searchParams.get("state");
  const cookieRaw = req.cookies.get("oauth_state")?.value;
  const origin = getAppOrigin();

  let saved: { state?: string; intent?: string; provider?: string } = {};
  try {
    saved = cookieRaw ? JSON.parse(cookieRaw) : {};
  } catch {
    saved = {};
  }
  const intent: "admin" | "login" = saved.intent === "admin" ? "admin" : "login";
  const loginPage = intent === "admin" ? `${origin}/admin/login` : `${origin}/login`;

  function fail(reason: string) {
    const res = NextResponse.redirect(`${loginPage}?error=${reason}`);
    res.cookies.delete("oauth_state");
    return res;
  }

  if (!code || !stateParam || saved.provider !== "google" || saved.state !== stateParam) {
    return fail("oauth_state");
  }

  try {
    const profile = await exchangeGoogleCode(code);
    if (!profile.email) return fail("no_email");

    if (intent === "admin") {
      const admin = await adminGoogleLogin(profile.email);
      const res = NextResponse.redirect(admin ? `${origin}/admin` : `${origin}/admin/login?error=not_admin`);
      res.cookies.delete("oauth_state");
      return res;
    }

    const user = await findOrCreateOAuthUser({
      email: profile.email,
      name: profile.name,
      provider: "google",
      providerId: profile.sub,
      picture: profile.picture,
    });
    await createUserSession(user.id);
    const res = NextResponse.redirect(`${origin}/mypage`);
    res.cookies.delete("oauth_state");
    return res;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return fail("oauth_failed");
  }
}
