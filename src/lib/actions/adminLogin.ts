"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { verifyTotp } from "@/lib/totp";
import { createAdminSession, getClientInfo } from "@/lib/session";
import { isRateLimited, recordLoginAttempt } from "@/lib/rateLimit";
import { redirect } from "next/navigation";

export type AdminLoginState = { error?: string; needsTotp?: boolean; loginId?: string } | undefined;

export async function adminLoginAction(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const loginId = String(formData.get("loginId") || "").trim();
  const password = String(formData.get("password") || "");
  const totpToken = String(formData.get("totpToken") || "").trim();
  const { ip, userAgent } = await getClientInfo();

  if (await isRateLimited("ADMIN", loginId || ip)) {
    return { error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { loginId } });
  const ok = admin ? await verifyPassword(password, admin.passwordHash) : false;

  if (!admin || !ok) {
    await recordLoginAttempt("ADMIN", loginId || ip);
    await prisma.adminLoginLog.create({
      data: { adminId: admin?.id, loginId, ip, userAgent, success: false, reason: "INVALID_CREDENTIALS" },
    });
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  if (admin.status !== "ACTIVE") {
    await prisma.adminLoginLog.create({
      data: { adminId: admin.id, loginId, ip, userAgent, success: false, reason: "DISABLED" },
    });
    return { error: "비활성화된 관리자 계정입니다." };
  }

  if (admin.totpEnabled) {
    if (!totpToken) {
      return { needsTotp: true, loginId };
    }
    const validTotp = admin.totpSecret ? verifyTotp(admin.totpSecret, totpToken) : false;
    if (!validTotp) {
      await recordLoginAttempt("ADMIN", loginId);
      await prisma.adminLoginLog.create({
        data: { adminId: admin.id, loginId, ip, userAgent, success: false, reason: "INVALID_TOTP" },
      });
      return { needsTotp: true, loginId, error: "인증 코드가 올바르지 않습니다." };
    }
  }

  await prisma.adminLoginLog.create({
    data: { adminId: admin.id, loginId, ip, userAgent, success: true },
  });
  await createAdminSession(admin.id);
  redirect("/admin");
}
