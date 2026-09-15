import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDiscordAuthUrl } from "@/lib/oauth";

// Discord는 고객 로그인 전용 세 번째 옵션(관리자 로그인은 Google만 지원).
export async function GET(_req: NextRequest) {
  const state = randomUUID();
  const authUrl = await getDiscordAuthUrl(state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("oauth_state", JSON.stringify({ provider: "discord", state, intent: "login" }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
