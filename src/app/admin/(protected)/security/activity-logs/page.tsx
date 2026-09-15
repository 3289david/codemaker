import { requireAdmin } from "@/lib/actions/adminAuth";
import { prisma } from "@/lib/prisma";
import { SecurityTabs } from "@/components/admin/SecurityTabs";

export const dynamic = "force-dynamic";

export default async function ActivityLogsPage() {
  await requireAdmin();
  const logs = await prisma.adminActivityLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { admin: true } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">관리자 보안</h1>
      <SecurityTabs active="/admin/security/activity-logs" />
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr><th className="px-4 py-3">관리자</th><th className="px-4 py-3">액션</th><th className="px-4 py-3">대상</th><th className="px-4 py-3">상세</th><th className="px-4 py-3">시각</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">{l.admin.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                <td className="px-4 py-3 text-neutral-500">{l.target ?? "-"}</td>
                <td className="px-4 py-3 text-neutral-500">{l.detail ?? "-"}</td>
                <td className="px-4 py-3 text-neutral-400">{l.createdAt.toLocaleString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
