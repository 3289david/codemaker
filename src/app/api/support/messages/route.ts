import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupportActor, canAccessSupportThread } from "@/lib/supportAccess";

export async function GET(req: NextRequest) {
  const threadId = req.nextUrl.searchParams.get("threadId");
  if (!threadId) return NextResponse.json({ error: "threadId required" }, { status: 400 });

  const actor = await getSupportActor();
  if (!actor || !(await canAccessSupportThread(actor, threadId))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const messages = await prisma.supportMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { nickname: true } }, admin: { select: { name: true } } },
  });

  if (actor.kind === "ADMIN") {
    await prisma.supportThread.update({ where: { id: threadId }, data: { unreadByAdmin: false } });
  } else {
    await prisma.supportThread.update({ where: { id: threadId }, data: { unreadByUser: false } });
  }

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      senderName: m.senderType === "ADMIN" ? m.admin?.name ?? "상담원" : m.user?.nickname ?? "방문자",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const threadId = String(body.threadId || "");
  const content = String(body.content || "").trim();
  if (!threadId || !content) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const actor = await getSupportActor();
  if (!actor || !(await canAccessSupportThread(actor, threadId))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (actor.kind === "ADMIN") {
    await prisma.supportMessage.create({ data: { threadId, senderType: "ADMIN", adminId: actor.adminId, content } });
    await prisma.supportThread.update({ where: { id: threadId }, data: { lastMessageAt: new Date(), unreadByUser: true } });
  } else {
    await prisma.supportMessage.create({
      data: { threadId, senderType: "USER", userId: actor.kind === "USER" ? actor.userId : null, content },
    });
    await prisma.supportThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date(), unreadByAdmin: true, status: "OPEN" },
    });
  }

  return NextResponse.json({ ok: true });
}
