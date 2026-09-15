import { ORDER_STATUS, ORDER_STATUS_FLOW, statusBadgeColor } from "@/lib/constants";
import { Badge } from "@/components/ui";
import { OrderChat } from "@/components/OrderChat";
import { RevisionForm } from "@/components/RevisionForm";
import { ReviewForm } from "@/components/ReviewForm";
import { approveQuoteAction, notifyPaymentSentAction } from "@/lib/actions/orders";
import { SubmitButton } from "@/components/SubmitButton";
import type {
  Order,
  OrderStatusHistory,
  Quote,
  Payment,
  RevisionRequest,
  Deliverable,
  Review,
} from "@prisma/client";

type FullOrder = Order & {
  statusHistory: OrderStatusHistory[];
  quote: Quote | null;
  payment: Payment | null;
  revisionRequests: RevisionRequest[];
  deliverables: Deliverable[];
  review: Review | null;
};

export function OrderDetailView({
  order,
  pin,
  viewAs,
  canReview,
}: {
  order: FullOrder;
  pin?: string;
  viewAs: "USER" | "ADMIN";
  canReview: boolean;
}) {
  const includedFeatures: string[] = order.quote ? JSON.parse(order.quote.includedFeatures || "[]") : [];
  const referenceUrls: string[] = order.referenceUrls ? JSON.parse(order.referenceUrls) : [];
  const attachments: { key: string; name: string }[] = order.attachments ? JSON.parse(order.attachments) : [];
  const referenceImages: { key: string; name: string }[] = order.referenceImages ? JSON.parse(order.referenceImages) : [];
  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(order.status as (typeof ORDER_STATUS_FLOW)[number]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-400">주문번호 #{order.orderNo}</p>
          <h1 className="text-2xl font-bold mt-1">{order.title}</h1>
        </div>
        <Badge className={statusBadgeColor(order.status)}>{order.status}</Badge>
      </div>

      {/* Progress */}
      {order.status !== ORDER_STATUS.CANCELLED && (
        <div>
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>진행률</span>
            <span>{order.progress}%</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${order.progress}%` }} />
          </div>
          {order.dueDate && (
            <p className="text-xs text-neutral-400 mt-2">예상 완료일: {order.dueDate.toLocaleDateString("ko-KR")}</p>
          )}
        </div>
      )}

      {/* Status timeline */}
      <div className="border border-neutral-200 rounded-xl p-5">
        <p className="font-semibold mb-4">진행 현황</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {ORDER_STATUS_FLOW.map((s, i) => (
            <span
              key={s}
              className={`text-xs px-2.5 py-1 rounded-full ${
                i <= currentStepIndex ? "bg-indigo-600 text-white" : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
        <ul className="space-y-3">
          {order.statusHistory
            .slice()
            .reverse()
            .map((h) => (
              <li key={h.id} className="text-sm flex gap-3">
                <span className="text-neutral-400 shrink-0 w-36">{h.createdAt.toLocaleString("ko-KR")}</span>
                <div>
                  <span className="font-medium">{h.status}</span>
                  {h.note && <span className="text-neutral-500"> — {h.note}</span>}
                </div>
              </li>
            ))}
        </ul>
      </div>

      {/* Quote card */}
      {order.quote && (
        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-5">
          <p className="font-semibold mb-3">견적서</p>
          <p className="text-2xl font-bold text-indigo-700">{order.quote.amount.toLocaleString()}원</p>
          <p className="text-sm text-neutral-500 mt-1">예상 기간 {order.quote.estimatedDays}일</p>
          {includedFeatures.length > 0 && (
            <ul className="mt-3 text-sm text-neutral-600 list-disc list-inside space-y-0.5">
              {includedFeatures.map((f) => <li key={f}>{f}</li>)}
            </ul>
          )}
          {order.quote.memo && <p className="text-sm text-neutral-500 mt-3 whitespace-pre-line">{order.quote.memo}</p>}
          {order.quote.status === "SENT" && viewAs === "USER" && (
            <form action={approveQuoteAction} className="mt-4">
              <input type="hidden" name="orderId" value={order.id} />
              <SubmitButton className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700">
                견적 승인
              </SubmitButton>
            </form>
          )}
          {order.quote.status === "APPROVED" && <p className="text-sm text-emerald-600 mt-3">✓ 승인된 견적입니다.</p>}
        </div>
      )}

      {/* Payment card */}
      {order.payment && (
        <div className="border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">결제 (무통장입금)</p>
          <p className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2 mb-3">
            ※ 예시 계좌입니다 — 실제 서비스 운영 시 관리자 설정에서 실제 계좌로 교체해야 합니다.
          </p>
          <p className="text-lg font-bold">{order.payment.amount.toLocaleString()}원</p>
          <p className="text-sm text-neutral-500 mt-2">상태: {order.payment.status}</p>
          {order.payment.status === "PENDING" && viewAs === "USER" && (
            <form action={notifyPaymentSentAction} className="mt-4 flex flex-wrap gap-2 items-center">
              <input type="hidden" name="orderId" value={order.id} />
              <input name="depositorName" placeholder="입금자명" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
              <SubmitButton className="bg-neutral-900 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-neutral-700">
                입금 완료 알림
              </SubmitButton>
            </form>
          )}
          {order.payment.status === "NOTIFIED" && <p className="text-sm text-amber-600 mt-3">입금 확인 대기 중입니다.</p>}
          {order.payment.status === "CONFIRMED" && (
            <p className="text-sm text-emerald-600 mt-3">✓ 입금이 확인되었습니다 ({order.payment.confirmedAt?.toLocaleString("ko-KR")})</p>
          )}
        </div>
      )}

      {/* Deliverables */}
      {order.deliverables.filter((d) => d.visible).length > 0 && (
        <div className="border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">산출물</p>
          <ul className="space-y-2">
            {order.deliverables.filter((d) => d.visible).map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm border border-neutral-100 rounded-md px-3 py-2">
                <div>
                  <span className="font-medium">{d.versionLabel}</span>
                  <span className="text-neutral-400 ml-2">{d.fileName}</span>
                  {d.note && <p className="text-xs text-neutral-400">{d.note}</p>}
                </div>
                <a
                  href={`/api/files/deliverables/${d.id}${pin ? `?pin=${pin}` : ""}`}
                  className="text-indigo-600 hover:underline text-xs font-medium"
                >
                  다운로드
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submitted files */}
      {(referenceUrls.length > 0 || attachments.length > 0 || referenceImages.length > 0) && (
        <div className="border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">제출한 참고 자료</p>
          {referenceUrls.length > 0 && (
            <ul className="text-sm text-neutral-600 list-disc list-inside mb-2">
              {referenceUrls.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{u}</a>
                </li>
              ))}
            </ul>
          )}
          {[...referenceImages, ...attachments].length > 0 && (
            <ul className="text-sm text-neutral-500 space-y-1">
              {[...referenceImages, ...attachments].map((f) => (
                <li key={f.key}>📎 {f.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Description */}
      <div className="border border-neutral-200 rounded-xl p-5">
        <p className="font-semibold mb-2">상세 요청 내용</p>
        <p className="text-sm text-neutral-600 whitespace-pre-line">{order.description}</p>
      </div>

      {/* Revision requests */}
      <div className="border border-neutral-200 rounded-xl p-5">
        <p className="font-semibold mb-3">수정 요청 내역</p>
        {order.revisionRequests.length > 0 ? (
          <ul className="space-y-3 mb-4">
            {order.revisionRequests.map((r) => (
              <li key={r.id} className="border border-neutral-100 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{r.title}</p>
                  <Badge className="bg-neutral-100 text-neutral-600">{r.status}</Badge>
                </div>
                <p className="text-sm text-neutral-500 mt-1 whitespace-pre-line">{r.description}</p>
                {r.adminNote && <p className="text-xs text-indigo-600 mt-1">담당자 메모: {r.adminNote}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400 mb-4">아직 수정 요청이 없습니다.</p>
        )}
        {viewAs === "USER" && (order.status === ORDER_STATUS.REVIEW || order.status === ORDER_STATUS.REVISION) && (
          <RevisionForm orderId={order.id} />
        )}
      </div>

      {/* Chat */}
      <div>
        <p className="font-semibold mb-3">담당자와 채팅</p>
        <OrderChat orderId={order.id} pin={pin} viewAs={viewAs} />
      </div>

      {/* Review */}
      {viewAs === "USER" && order.status === ORDER_STATUS.DONE && (
        <div className="border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">리뷰</p>
          {order.review ? (
            <p className="text-sm text-neutral-500">이미 리뷰를 작성했습니다. (상태: {order.review.status})</p>
          ) : canReview ? (
            <ReviewForm orderId={order.id} />
          ) : (
            <p className="text-sm text-neutral-400">로그인 후 리뷰를 작성할 수 있습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
