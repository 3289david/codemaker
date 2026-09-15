import { notFound } from "next/navigation";
import { requireUser } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { OrderDetailView } from "@/components/OrderDetailView";

export const dynamic = "force-dynamic";

export default async function MyOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
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
    },
  });
  if (!order || order.userId !== user.id) notFound();

  return <OrderDetailView order={order} viewAs="USER" canReview />;
}
