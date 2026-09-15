import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, getCurrentUser } from "@/lib/session";

export const SUPPORT_GUEST_COOKIE = "sc_guest";

export type SupportActor =
  | { kind: "ADMIN"; adminId: string }
  | { kind: "USER"; userId: string }
  | { kind: "GUEST"; guestToken: string };

// 주문과 무관한 일반 1:1 상담 채팅의 접근 주체를 판별한다.
// 순서: 관리자 세션 > 회원 세션 > 게스트 쿠키(sc_guest).
export async function getSupportActor(): Promise<SupportActor | null> {
  const admin = await getCurrentAdmin();
  if (admin) return { kind: "ADMIN", adminId: admin.id };

  const user = await getCurrentUser();
  if (user) return { kind: "USER", userId: user.id };

  const store = await cookies();
  const token = store.get(SUPPORT_GUEST_COOKIE)?.value;
  if (token) return { kind: "GUEST", guestToken: token };

  return null;
}

export async function canAccessSupportThread(actor: SupportActor, threadId: string): Promise<boolean> {
  if (actor.kind === "ADMIN") return true;
  const thread = await prisma.supportThread.findUnique({ where: { id: threadId } });
  if (!thread) return false;
  if (actor.kind === "USER") return thread.userId === actor.userId;
  return thread.guestToken === actor.guestToken;
}
