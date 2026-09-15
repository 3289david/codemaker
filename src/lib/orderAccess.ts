import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, getCurrentUser } from "@/lib/session";
import { verifyPin } from "@/lib/password";

export type OrderActor =
  | { kind: "ADMIN"; adminId: string; adminName: string }
  | { kind: "USER"; userId: string }
  | { kind: "GUEST" };

// 주문에 접근 가능한 주체를 판별한다: 관리자 세션 / 주문 소유 회원 세션 / PIN이 일치하는 비회원.
export async function resolveOrderActor(orderId: string, pinFromQuery?: string | null): Promise<OrderActor | null> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  const admin = await getCurrentAdmin();
  if (admin) return { kind: "ADMIN", adminId: admin.id, adminName: admin.name };

  const user = await getCurrentUser();
  if (user && order.userId === user.id) return { kind: "USER", userId: user.id };

  if (pinFromQuery) {
    const ok = await verifyPin(pinFromQuery, order.pinHash);
    if (ok) return { kind: "GUEST" };
  }

  return null;
}

export async function findOrderByOrderNo(orderNo: string) {
  return prisma.order.findUnique({ where: { orderNo } });
}
