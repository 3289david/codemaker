import Link from "next/link";
import { requireUser } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";
import { statusBadgeColor } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">주문 내역</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/mypage/orders/${o.id}`} className="flex items-center justify-between border border-neutral-200 rounded-xl p-4 hover:border-indigo-300">
            <div>
              <p className="text-xs text-neutral-400">#{o.orderNo}</p>
              <p className="font-medium">{o.title}</p>
              <p className="text-xs text-neutral-400 mt-1">{o.createdAt.toLocaleDateString("ko-KR")}</p>
            </div>
            <Badge className={statusBadgeColor(o.status)}>{o.status}</Badge>
          </Link>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-16 text-neutral-400">
            <p>아직 주문 내역이 없습니다.</p>
            <Link href="/order/new" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
              첫 주문 신청하기 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
