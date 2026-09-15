import { NextRequest, NextResponse } from "next/server";
import { exchangeGithubCode, findOrCreateOAuthUser } from "@/lib/oauth";
import { createUserSession } from "@/lib/session";
import { getAppOrigin } from "@/lib/appUrl";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const stateParam = req.nextUrl.searchParams.get("state");
  const cookieRaw = req.cookies.get("oauth_state")?.value;
  const origin = getAppOrigin();

  let saved: { state?: string; provider?: string } = {};
  try {
    saved = cookieRaw ? JSON.parse(cookieRaw) : {};
  } catch {
    saved = {};
  }

  function fail(reason: string) {
    const res = NextResponse.redirect(`${origin}/login?error=${reason}`);
    res.cookies.delete("oauth_state");
    return res;
  }

  if (!code || !stateParam || saved.provider !== "github" || saved.state !== stateParam) {
    return fail("oauth_state");
  }

  try {
    const profile = await exchangeGithubCode(code);
    if (!profile.email) return fail("no_email");

    const user = await findOrCreateOAuthUser({
      email: profile.email,
      name: profile.name,
      provider: "github",
      providerId: profile.id,
      picture: profile.picture,
    });
    await createUserSession(user.id);
    const res = NextResponse.redirect(`${origin}/mypage`);
    res.cookies.delete("oauth_state");
    return res;
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    return fail("oauth_failed");
  }
}
