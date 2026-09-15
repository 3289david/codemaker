import { prisma } from "@/lib/prisma";
import { SectionTitle, Stars } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <SectionTitle eyebrow="REVIEWS" title="고객 후기" desc={`평균 평점 ${avg.toFixed(1)} / 5 (${reviews.length}건)`} />
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <Stars rating={r.rating} />
              <span className="text-xs text-neutral-400">{r.createdAt.toLocaleDateString("ko-KR")}</span>
            </div>
            <p className="text-sm text-neutral-600 mt-3">{r.content}</p>
            <p className="text-xs text-neutral-400 mt-3">{r.user.nickname}</p>
            {r.adminReply && (
              <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-indigo-600">CodeMaker 답글</p>
                <p className="text-sm text-neutral-600 mt-1">{r.adminReply}</p>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-neutral-400">아직 등록된 리뷰가 없습니다.</p>}
      </div>
    </div>
  );
}
