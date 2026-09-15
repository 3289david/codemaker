import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";
import { statusBadgeColor, ORDER_STATUS_FLOW, ORDER_STATUS } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { orderNo: { contains: q } },
      { title: { contains: q } },
      { contactEmail: { contains: q } },
    ];
  }

  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, include: { payment: true } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">주문 관리</h1>

      <form className="flex flex-wrap gap-2 mb-4">
        <input name="q" defaultValue={q} placeholder="주문번호, 제목, 이메일 검색" className="border border-neutral-300 rounded-md px-3 py-2 text-sm w-64" />
        <select name="status" defaultValue={status ?? ""} className="border border-neutral-300 rounded-md px-3 py-2 text-sm">
          <option value="">전체 상태</option>
          {[...ORDER_STATUS_FLOW, ORDER_STATUS.CANCELLED].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="bg-neutral-900 text-white text-sm px-4 py-2 rounded-md">검색</button>
      </form>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr>
              <th className="px-4 py-3">주문번호</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">결제</th>
              <th className="px-4 py-3">접수일</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-indigo-600 font-medium hover:underline">
                    #{o.orderNo}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.title}</td>
                <td className="px-4 py-3 text-neutral-500">{o.contactEmail}</td>
                <td className="px-4 py-3"><Badge className={statusBadgeColor(o.status)}>{o.status}</Badge></td>
                <td className="px-4 py-3 text-neutral-500">{o.payment?.status ?? "-"}</td>
                <td className="px-4 py-3 text-neutral-400">{o.createdAt.toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">주문이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
