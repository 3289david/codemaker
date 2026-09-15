import { prisma } from "@/lib/prisma";

const WINDOW_MS = 10 * 60 * 1000; // 10분
const MAX_ATTEMPTS = 8;

// 단순 DB 기반 로그인 시도 제한 (Redis 불필요). scope+key 조합으로 창(window) 내
// 시도 횟수를 세어 초과 시 차단한다.
export async function isRateLimited(scope: "ADMIN" | "USER", key: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const count = await prisma.loginAttempt.count({
    where: { scope, key, createdAt: { gte: since } },
  });
  return count >= MAX_ATTEMPTS;
}

export async function recordLoginAttempt(scope: "ADMIN" | "USER", key: string) {
  await prisma.loginAttempt.create({ data: { scope, key } });
}
