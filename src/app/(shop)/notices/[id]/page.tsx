import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NOTICE_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) notFound();

  await prisma.notice.update({ where: { id }, data: { views: { increment: 1 } } });
  const label = NOTICE_CATEGORIES.find((c) => c.key === notice.category)?.label ?? notice.category;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <p className="text-xs text-indigo-600 font-semibold">{label}</p>
      <h1 className="text-2xl font-bold mt-1">{notice.title}</h1>
      <p className="text-xs text-neutral-400 mt-2">
        {notice.createdAt.toLocaleDateString("ko-KR")} · 조회 {notice.views + 1}
      </p>
      <div className="mt-6 text-neutral-600 whitespace-pre-line leading-relaxed">{notice.content}</div>
    </div>
  );
}
