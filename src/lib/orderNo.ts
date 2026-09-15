import { prisma } from "@/lib/prisma";

// 주문번호 형식: #A-10291 (사람이 읽기 쉬운 짧은 형식)
export async function generateOrderNo(): Promise<string> {
  const total = await prisma.order.count();
  for (let attempt = 0; attempt < 8; attempt++) {
    const seq = 10000 + total + attempt;
    const candidate = `A-${seq}`;
    const exists = await prisma.order.findUnique({ where: { orderNo: candidate } });
    if (!exists) return candidate;
  }
  return `A-${Date.now().toString().slice(-6)}`;
}
