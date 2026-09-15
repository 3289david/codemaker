import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { verifyPin } from "@/lib/password";
import { OrderDetailView } from "@/components/OrderDetailView";

export const dynamic = "force-dynamic";

export default async function OrderTrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNo: string }>;
  searchParams: Promise<{ pin?: string }>;
}) {
  const { orderNo } = await params;
  const { pin } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: {
      statusHistory: { orderBy: { createdAt: "asc" } },
      quote: true,
      payment: true,
      revisionRequests: { orderBy: { createdAt: "desc" } },
      deliverables: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });
  if (!order) notFound();

  const user = await getCurrentUser();
  const isOwner = user && order.userId === user.id;
  const pinOk = pin ? await verifyPin(pin, order.pinHash) : false;

  if (!isOwner && !pinOk) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="text-xl font-bold mb-2">접근 권한이 없습니다</h1>
        <p className="text-neutral-500 text-sm">주문번호와 PIN이 일치하는지 확인하거나, 로그인 후 다시 시도해주세요.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <OrderDetailView order={order} pin={pin} viewAs="USER" canReview={!!isOwner} />
    </div>
  );
}
