import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionTitle } from "@/components/ui";
import { NOTICE_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const notices = await prisma.notice.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] });
  const labelOf = (k: string) => NOTICE_CATEGORIES.find((c) => c.key === k)?.label ?? k;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <SectionTitle eyebrow="NOTICE" title="공지사항" />
      <div className="divide-y divide-neutral-200 border-y border-neutral-200">
        {notices.map((n) => (
          <Link key={n.id} href={`/notices/${n.id}`} className="flex items-center justify-between py-4 hover:bg-neutral-50 px-2">
            <div className="flex items-center gap-3">
              {n.pinned && <span className="text-xs bg-red-100 text-red-600 rounded px-1.5 py-0.5">고정</span>}
              <span className="text-xs text-neutral-400">{labelOf(n.category)}</span>
              <span className="font-medium">{n.title}</span>
            </div>
            <span className="text-xs text-neutral-400">{n.createdAt.toLocaleDateString("ko-KR")}</span>
          </Link>
        ))}
        {notices.length === 0 && <p className="text-neutral-400 py-6">등록된 공지사항이 없습니다.</p>}
      </div>
    </div>
  );
}
