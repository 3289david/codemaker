"use server";

import { prisma } from "@/lib/prisma";
import { destroyUserSession, getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export type AuthState = { error?: string; success?: string } | undefined;

// 고객 회원가입/로그인은 OAuth(Google/GitHub/Discord)로만 가능합니다.
// 이메일/비밀번호 기반 가입·로그인은 제거되었습니다 — src/lib/oauth.ts, src/app/api/auth/* 참고.

export async function logoutAction() {
  await destroyUserSession();
  redirect("/");
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function updateProfileAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await requireUser();
  const nickname = String(formData.get("nickname") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!nickname) return { error: "닉네임을 입력해주세요." };
  await prisma.user.update({ where: { id: user.id }, data: { nickname, phone: phone || null } });
  return { success: "프로필이 저장되었습니다." };
}
