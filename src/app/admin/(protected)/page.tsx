import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    todayOrders,
    inProgress,
    completed,
    completedOrders,
    thisMonthOrders,
    newMembers,
    popularType,
    openInquiries,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: { in: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.REVIEW, ORDER_STATUS.REVISION] } } }),
    prisma.order.count({ where: { status: ORDER_STATUS.DONE } }),
    prisma.order.findMany({ where: { status: ORDER_STATUS.DONE }, include: { quote: true, statusHistory: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: startOfMonth }, status: ORDER_STATUS.DONE }, include: { quote: true } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.groupBy({ by: ["projectType"], _count: { projectType: true }, orderBy: { _count: { projectType: "desc" } }, take: 1 }),
    prisma.inquiry.count({ where: { status: "WAITING" } }),
  ]);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.quote?.amount ?? 0), 0);
  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (o.quote?.amount ?? 0), 0);

  const turnaroundDays = completedOrders
    .map((o) => {
      const received = o.statusHistory.find((h) => h.status === ORDER_STATUS.RECEIVED)?.createdAt ?? o.createdAt;
      const done = o.statusHistory.find((h) => h.status === ORDER_STATUS.DONE)?.createdAt ?? o.updatedAt;
      return (done.getTime() - received.getTime()) / (1000 * 60 * 60 * 24);
    })
    .filter((d) => d >= 0);
  const avgTurnaround = turnaroundDays.length ? (turnaroundDays.reduce((a, b) => a + b, 0) / turnaroundDays.length).toFixed(1) : "-";

  const priceBands = completedOrders.map((o) => o.quote?.amount ?? 0).filter(Boolean);
  const popularBand = priceBands.length
    ? (() => {
        const buckets: Record<string, number> = {};
        for (const p of priceBands) {
          const key = `${Math.floor(p / 500000) * 50}~${Math.floor(p / 500000) * 50 + 50}만원`;
          buckets[key] = (buckets[key] ?? 0) + 1;
        }
        return Object.entries(buckets).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
      })()
    : "-";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 주문" value={`${totalOrders}건`} />
        <StatCard label="오늘 주문" value={`${todayOrders}건`} />
        <StatCard label="제작 중" value={`${inProgress}건`} />
        <StatCard label="완료" value={`${completed}건`} />
        <StatCard label="총 매출 (완료 기준)" value={`${totalRevenue.toLocaleString()}원`} />
        <StatCard label="이번 달 매출" value={`${thisMonthRevenue.toLocaleString()}원`} />
        <StatCard label="이번 달 신규 회원" value={`${newMembers}명`} />
        <StatCard label="평균 소요 기간" value={avgTurnaround === "-" ? "-" : `${avgTurnaround}일`} />
        <StatCard label="인기 서비스 유형" value={popularType[0]?.projectType ?? "-"} />
        <StatCard label="인기 가격대" value={popularBand} />
        <StatCard label="미답변 문의" value={`${openInquiries}건`} />
      </div>
    </div>
  );
}
