import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/session";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const threads = await prisma.supportThread.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      user: { select: { nickname: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json({
    threads: threads.map((t) => ({
      id: t.id,
      label: t.user?.nickname ?? `게스트 (${(t.guestToken ?? "").slice(0, 8)})`,
      status: t.status,
      unreadByAdmin: t.unreadByAdmin,
      lastMessageAt: t.lastMessageAt.toISOString(),
      preview: t.messages[0]?.content?.slice(0, 60) ?? "",
    })),
  });
}
