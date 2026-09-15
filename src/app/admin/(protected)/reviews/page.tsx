import { prisma } from "@/lib/prisma";
import { Badge, Stars } from "@/components/ui";
import { setReviewStatusAction, deleteReviewAction, replyReviewAction } from "@/lib/actions/adminContent";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, include: { user: true, order: true } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">리뷰 관리</h1>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <Stars rating={r.rating} />
                <span className="text-sm text-neutral-500 ml-2">{r.user.nickname}</span>
                {r.order && <span className="text-xs text-neutral-400 ml-2">#{r.order.orderNo}</span>}
              </div>
              <Badge className={r.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : r.status === "HIDDEN" ? "bg-neutral-200 text-neutral-500" : "bg-amber-100 text-amber-700"}>
                {r.status}
              </Badge>
            </div>
            <p className="text-sm text-neutral-600 mt-2">{r.content}</p>
            <div className="flex gap-2 mt-3">
              <form action={setReviewStatusAction}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="status" value="APPROVED" />
                <button className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">승인</button>
              </form>
              <form action={setReviewStatusAction}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="status" value="HIDDEN" />
                <button className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">숨김</button>
              </form>
              <form action={deleteReviewAction}>
                <input type="hidden" name="id" value={r.id} />
                <button className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">삭제</button>
              </form>
            </div>
            <form
              action={async (formData: FormData) => {
                "use server";
                await replyReviewAction(undefined, formData);
              }}
              className="flex gap-2 mt-3"
            >
              <input type="hidden" name="id" value={r.id} />
              <input name="adminReply" defaultValue={r.adminReply ?? ""} placeholder="답글 작성" className="flex-1 border border-neutral-300 rounded-md px-3 py-1.5 text-sm" />
              <button className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-md">답글 저장</button>
            </form>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-neutral-400">등록된 리뷰가 없습니다.</p>}
      </div>
    </div>
  );
}
