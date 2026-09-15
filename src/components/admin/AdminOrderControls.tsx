"use client";

import { useActionState } from "react";
import {
  updateOrderStatusAction,
  updateOrderMetaAction,
  createOrUpdateQuoteAction,
  confirmPaymentAction,
  uploadDeliverableAction,
  type ActionState,
} from "@/lib/actions/adminOrders";
import { toggleDeliverableVisibilityAction, updateRevisionStatusAction, sendAdminMessageAction } from "@/lib/actions/adminOrders";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";
import { ORDER_STATUS_FLOW, ORDER_STATUS } from "@/lib/constants";
import type { Order, Quote, Payment, RevisionRequest, Deliverable, AdminUser } from "@prisma/client";

export function StatusForm({ order }: { order: Order }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateOrderStatusAction, undefined);
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orderId" value={order.id} />
      <select name="status" defaultValue={order.status} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
        {[...ORDER_STATUS_FLOW, ORDER_STATUS.CANCELLED].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <input name="note" placeholder="상태 변경 메모 (선택)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-neutral-700 w-full">
        상태 변경
      </SubmitButton>
    </form>
  );
}

export function MetaForm({ order, admins }: { order: Order; admins: AdminUser[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateOrderMetaAction, undefined);
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orderId" value={order.id} />
      <label className="text-xs text-neutral-400">진행률 (%)</label>
      <input name="progress" type="number" min={0} max={100} defaultValue={order.progress} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <label className="text-xs text-neutral-400">완료 예정일</label>
      <input name="dueDate" type="date" defaultValue={order.dueDate ? order.dueDate.toISOString().slice(0, 10) : ""} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <label className="text-xs text-neutral-400">담당자</label>
      <select name="assignedAdminId" defaultValue={order.assignedAdminId ?? ""} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
        <option value="">미지정</option>
        {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <label className="text-xs text-neutral-400">내부 메모 (고객 비공개)</label>
      <textarea name="internalMemo" defaultValue={order.internalMemo ?? ""} rows={3} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-neutral-700 w-full">
        저장
      </SubmitButton>
    </form>
  );
}

export function QuoteForm({ order, quote }: { order: Order; quote: Quote | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createOrUpdateQuoteAction, undefined);
  const included: string[] = quote ? JSON.parse(quote.includedFeatures || "[]") : [];
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orderId" value={order.id} />
      <label className="text-xs text-neutral-400">견적 금액 (원)</label>
      <input name="amount" type="number" required defaultValue={quote?.amount ?? order.estimatedPriceMin ?? 0} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <label className="text-xs text-neutral-400">예상 기간 (일)</label>
      <input name="estimatedDays" type="number" required defaultValue={quote?.estimatedDays ?? order.estimatedDays ?? 0} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <label className="text-xs text-neutral-400">포함 기능 (줄바꿈 구분)</label>
      <textarea name="includedFeatures" rows={3} defaultValue={included.join("\n")} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <label className="text-xs text-neutral-400">메모</label>
      <textarea name="memo" rows={2} defaultValue={quote?.memo ?? ""} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 w-full">
        견적 발송
      </SubmitButton>
    </form>
  );
}

export function PaymentConfirmForm({ order, payment }: { order: Order; payment: Payment | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(confirmPaymentAction, undefined);
  if (!payment) return <p className="text-sm text-neutral-400">아직 결제 정보가 없습니다 (견적 승인 전).</p>;
  return (
    <div className="space-y-2">
      <p className="text-sm">금액: <span className="font-semibold">{payment.amount.toLocaleString()}원</span></p>
      <p className="text-sm">상태: {payment.status}</p>
      {payment.depositorName && <p className="text-sm text-neutral-500">입금자명: {payment.depositorName}</p>}
      {payment.status !== "CONFIRMED" && (
        <form action={formAction}>
          <input type="hidden" name="orderId" value={order.id} />
          <FormMessage error={state?.error} success={state?.success} />
          <SubmitButton className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-emerald-700 w-full mt-2">
            입금 확인 처리
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

export function DeliverableUploadForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(uploadDeliverableAction, undefined);
  return (
    <form action={formAction} className="space-y-2" encType="multipart/form-data">
      <input type="hidden" name="orderId" value={orderId} />
      <input name="versionLabel" required placeholder="버전 (예: v1.0, Final)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <input type="file" name="file" required className="w-full text-sm" />
      <input name="note" placeholder="메모 (선택)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-neutral-700 w-full">
        업로드
      </SubmitButton>
    </form>
  );
}

export function DeliverableList({ deliverables }: { deliverables: Deliverable[] }) {
  return (
    <ul className="space-y-2 mt-3">
      {deliverables.map((d) => (
        <li key={d.id} className="flex items-center justify-between text-sm border border-neutral-100 rounded-md px-3 py-2">
          <span>{d.versionLabel} — {d.fileName}</span>
          <form action={toggleDeliverableVisibilityAction}>
            <input type="hidden" name="id" value={d.id} />
            <button className={`text-xs px-2 py-1 rounded ${d.visible ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
              {d.visible ? "공개중" : "비공개"}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export function RevisionAdminList({ revisions }: { revisions: RevisionRequest[] }) {
  return (
    <ul className="space-y-3">
      {revisions.map((r) => (
        <li key={r.id} className="border border-neutral-100 rounded-md p-3">
          <p className="font-medium text-sm">{r.title}</p>
          <p className="text-sm text-neutral-500 mt-1">{r.description}</p>
          <form action={updateRevisionStatusAction} className="flex gap-2 mt-2">
            <input type="hidden" name="id" value={r.id} />
            <select name="status" defaultValue={r.status} className="border border-neutral-300 rounded-md px-2 py-1 text-xs">
              <option value="요청확인">요청확인</option>
              <option value="수정중">수정중</option>
              <option value="완료">완료</option>
            </select>
            <input name="adminNote" defaultValue={r.adminNote ?? ""} placeholder="메모" className="flex-1 border border-neutral-300 rounded-md px-2 py-1 text-xs" />
            <button className="bg-neutral-900 text-white text-xs px-3 py-1 rounded-md">저장</button>
          </form>
        </li>
      ))}
      {revisions.length === 0 && <p className="text-sm text-neutral-400">수정 요청이 없습니다.</p>}
    </ul>
  );
}

export function AdminMessageForm({ orderId }: { orderId: string }) {
  return (
    <form action={sendAdminMessageAction} className="flex gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <input name="content" required placeholder="빠른 메시지 전송 (채팅과 별개로 고정 메시지 발송 가능)" className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <label className="flex items-center gap-1 text-xs text-neutral-500">
        <input type="checkbox" name="pinned" /> 고정
      </label>
      <button className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md">전송</button>
    </form>
  );
}
