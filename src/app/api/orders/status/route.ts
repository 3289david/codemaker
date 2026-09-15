import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPin } from "@/lib/password";

// 공개 주문 상태 조회 API: 주문번호 + PIN으로 진행 상황을 JSON으로 확인할 수 있다.
// (예: 외부 대시보드, 슬랙/디스코드 봇 등에서 활용 가능)
export async function GET(req: NextRequest) {
  const orderNo = req.nextUrl.searchParams.get("orderNo")?.replace(/^#/, "");
  const pin = req.nextUrl.searchParams.get("pin");
  if (!orderNo || !pin) {
    return NextResponse.json({ error: "orderNo, pin 파라미터가 필요합니다." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { quote: true, payment: true },
  });
  if (!order) return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });

  const ok = await verifyPin(pin, order.pinHash);
  if (!ok) return NextResponse.json({ error: "PIN이 올바르지 않습니다." }, { status: 403 });

  return NextResponse.json({
    orderNo: order.orderNo,
    title: order.title,
    status: order.status,
    progress: order.progress,
    dueDate: order.dueDate,
    quote: order.quote ? { amount: order.quote.amount, estimatedDays: order.quote.estimatedDays, status: order.quote.status } : null,
    payment: order.payment ? { amount: order.payment.amount, status: order.payment.status } : null,
    createdAt: order.createdAt,
  });
}
