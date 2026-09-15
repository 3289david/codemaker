import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getGoogleAuthUrl } from "@/lib/oauth";

// /api/auth/google?intent=login|admin
// intent=admin 은 /admin/login 의 "Google로 관리자 로그인" 버튼에서만 사용한다.
export async function GET(req: NextRequest) {
  const intent = req.nextUrl.searchParams.get("intent") === "admin" ? "admin" : "login";
  const state = randomUUID();
  const authUrl = await getGoogleAuthUrl(state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("oauth_state", JSON.stringify({ provider: "google", state, intent }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
