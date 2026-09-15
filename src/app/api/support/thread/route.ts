import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, getCurrentUser } from "@/lib/session";
import { SUPPORT_GUEST_COOKIE } from "@/lib/supportAccess";

// 방문자(회원/비회원)가 상담 채팅을 열 때 자신의 스레드를 찾거나 새로 만든다.
export async function POST() {
  const admin = await getCurrentAdmin();
  if (admin) return NextResponse.json({ error: "admin_not_allowed" }, { status: 400 });

  const user = await getCurrentUser();
  if (user) {
    let thread = await prisma.supportThread.findFirst({
      where: { userId: user.id, status: "OPEN" },
      orderBy: { createdAt: "desc" },
    });
    if (!thread) thread = await prisma.supportThread.create({ data: { userId: user.id } });
    return NextResponse.json({ threadId: thread.id });
  }

  const store = await cookies();
  const existingToken = store.get(SUPPORT_GUEST_COOKIE)?.value;
  const token = existingToken || randomUUID();

  let thread = await prisma.supportThread.findFirst({ where: { guestToken: token, status: "OPEN" } });
  if (!thread) thread = await prisma.supportThread.create({ data: { guestToken: token } });

  const res = NextResponse.json({ threadId: thread.id });
  if (!existingToken) {
    res.cookies.set(SUPPORT_GUEST_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}
