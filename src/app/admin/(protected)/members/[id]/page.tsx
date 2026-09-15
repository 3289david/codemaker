import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";
import { setMemberStatusAction } from "@/lib/actions/adminContent";
import { statusBadgeColor } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { payment: true } },
      inquiries: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) notFound();

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h1 className="text-xl font-bold">{user.nickname}</h1>
          <p className="text-sm text-neutral-500">{user.email} / {user.phone ?? "연락처 없음"}</p>
          <p className="text-xs text-neutral-400 mt-1">가입일 {user.createdAt.toLocaleDateString("ko-KR")}</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">주문 내역</p>
          <div className="space-y-2">
            {user.orders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between text-sm border border-neutral-100 rounded-md px-3 py-2 hover:bg-neutral-50">
                <span>#{o.orderNo} {o.title}</span>
                <Badge className={statusBadgeColor(o.status)}>{o.status}</Badge>
              </Link>
            ))}
            {user.orders.length === 0 && <p className="text-sm text-neutral-400">주문 내역이 없습니다.</p>}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">결제 내역</p>
          <div className="space-y-2">
            {user.orders.filter((o) => o.payment).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm border border-neutral-100 rounded-md px-3 py-2">
                <span>#{o.orderNo}</span>
                <span>{o.payment?.amount.toLocaleString()}원 ({o.payment?.status})</span>
              </div>
            ))}
            {user.orders.filter((o) => o.payment).length === 0 && <p className="text-sm text-neutral-400">결제 내역이 없습니다.</p>}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="font-semibold mb-3">문의 내역</p>
          <div className="space-y-2">
            {user.inquiries.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm border border-neutral-100 rounded-md px-3 py-2">
                <span>{i.title}</span>
                <Badge className={i.status === "ANSWERED" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}>{i.status}</Badge>
              </div>
            ))}
            {user.inquiries.length === 0 && <p className="text-sm text-neutral-400">문의 내역이 없습니다.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 h-fit">
        <p className="font-semibold mb-3">계정 상태 관리</p>
        <form action={setMemberStatusAction} className="space-y-2">
          <input type="hidden" name="userId" value={user.id} />
          <select name="status" defaultValue={user.status} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="WITHDRAWN">WITHDRAWN</option>
          </select>
          <textarea name="suspendedReason" defaultValue={user.suspendedReason ?? ""} placeholder="정지/탈퇴 사유" rows={3} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <button className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-md w-full">저장</button>
        </form>
      </div>
    </div>
  );
}
