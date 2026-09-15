"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createUserSession, destroyUserSession, getClientInfo, getCurrentUser } from "@/lib/session";
import { isRateLimited, recordLoginAttempt } from "@/lib/rateLimit";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

export type AuthState = { error?: string; success?: string } | undefined;

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const nickname = String(formData.get("nickname") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!email || !email.includes("@")) return { error: "올바른 이메일을 입력해주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  if (!nickname) return { error: "닉네임을 입력해주세요." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "이미 가입된 이메일입니다." };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname,
      phone: phone || null,
      emailVerifyToken: randomUUID(),
    },
  });

  await createUserSession(user.id);
  redirect("/mypage");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const { ip } = await getClientInfo();

  if (await isRateLimited("USER", email || ip)) {
    return { error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    await recordLoginAttempt("USER", email || ip);
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  if (user.status !== "ACTIVE") {
    return { error: "이용이 제한된 계정입니다. 고객센터에 문의해주세요." };
  }

  await createUserSession(user.id);
  redirect("/mypage");
}

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
