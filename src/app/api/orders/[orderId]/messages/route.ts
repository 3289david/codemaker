import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveOrderActor } from "@/lib/orderAccess";
import { createNotification } from "@/lib/notify";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const pin = req.nextUrl.searchParams.get("pin");
  const actor = await resolveOrderActor(orderId, pin);
  if (!actor) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { orderId },
    orderBy: [{ pinned: "desc" }, { createdAt: "asc" }],
    include: { user: { select: { nickname: true } }, admin: { select: { name: true } } },
  });

  // 조회 주체 기준으로 읽음 처리
  if (actor.kind === "ADMIN") {
    await prisma.message.updateMany({ where: { orderId, senderType: "USER" }, data: { readByAdmin: true } });
  } else {
    await prisma.message.updateMany({ where: { orderId, senderType: "ADMIN" }, data: { readByUser: true } });
  }

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      senderName: m.senderType === "ADMIN" ? m.admin?.name ?? "관리자" : m.user?.nickname ?? "고객",
      content: m.content,
      pinned: m.pinned,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const pin = req.nextUrl.searchParams.get("pin");
  const actor = await resolveOrderActor(orderId, pin);
  if (!actor) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const content = String(body.content || "").trim();
  if (!content) return NextResponse.json({ error: "empty" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (actor.kind === "ADMIN") {
    await prisma.message.create({
      data: { orderId, senderType: "ADMIN", adminId: actor.adminId, content, readByAdmin: true },
    });
    if (order.userId) {
      await createNotification({
        userId: order.userId,
        orderId,
        type: NOTIFICATION_TYPES.ADMIN_MESSAGE,
        title: "새 메시지가 도착했습니다",
        message: `#${order.orderNo} 담당자로부터 새 메시지가 도착했습니다.`,
      });
    }
  } else {
    await prisma.message.create({
      data: {
        orderId,
        senderType: "USER",
        userId: actor.kind === "USER" ? actor.userId : null,
        content,
        readByUser: true,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
