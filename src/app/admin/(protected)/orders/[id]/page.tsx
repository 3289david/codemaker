import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderDetailView } from "@/components/OrderDetailView";
import {
  StatusForm,
  MetaForm,
  QuoteForm,
  PaymentConfirmForm,
  DeliverableUploadForm,
  DeliverableList,
  RevisionAdminList,
  AdminMessageForm,
} from "@/components/admin/AdminOrderControls";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      statusHistory: { orderBy: { createdAt: "asc" } },
      quote: true,
      payment: true,
      revisionRequests: { orderBy: { createdAt: "desc" } },
      deliverables: { orderBy: { createdAt: "desc" } },
      review: true,
      user: true,
    },
  });
  if (!order) notFound();

  const admins = await prisma.adminUser.findMany({ where: { status: "ACTIVE" } });

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <OrderDetailView order={order} viewAs="ADMIN" canReview={false} />
        <div className="mt-6 bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">고객 정보</p>
          <p className="text-sm text-neutral-600">
            {order.user ? `회원: ${order.user.nickname} (${order.user.email})` : `비회원: ${order.guestName ?? "-"} (${order.guestEmail})`}
          </p>
          <p className="text-sm text-neutral-500 mt-1">연락처: {order.contactPhone ?? "-"} / Discord: {order.contactDiscord ?? "-"}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">상태 변경</p>
          <StatusForm order={order} />
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">진행 정보</p>
          <MetaForm order={order} admins={admins} />
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">견적 작성</p>
          <QuoteForm order={order} quote={order.quote} />
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">결제 확인</p>
          <PaymentConfirmForm order={order} payment={order.payment} />
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">산출물 업로드</p>
          <DeliverableUploadForm orderId={order.id} />
          <DeliverableList deliverables={order.deliverables} />
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">수정 요청 관리</p>
          <RevisionAdminList revisions={order.revisionRequests} />
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">빠른 메시지</p>
          <AdminMessageForm orderId={order.id} />
        </div>
      </div>
    </div>
  );
}
