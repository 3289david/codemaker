import { requireAdmin } from "@/lib/actions/adminAuth";
import { prisma } from "@/lib/prisma";
import { SecurityTabs } from "@/components/admin/SecurityTabs";

export const dynamic = "force-dynamic";

export default async function LoginLogsPage() {
  await requireAdmin();
  const logs = await prisma.adminLoginLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">관리자 보안</h1>
      <SecurityTabs active="/admin/security/login-logs" />
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr><th className="px-4 py-3">아이디</th><th className="px-4 py-3">결과</th><th className="px-4 py-3">사유</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">시각</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">{l.loginId}</td>
                <td className="px-4 py-3">{l.success ? <span className="text-emerald-600">성공</span> : <span className="text-red-600">실패</span>}</td>
                <td className="px-4 py-3 text-neutral-500">{l.reason ?? "-"}</td>
                <td className="px-4 py-3 text-neutral-400">{l.ip}</td>
                <td className="px-4 py-3 text-neutral-400">{l.createdAt.toLocaleString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
