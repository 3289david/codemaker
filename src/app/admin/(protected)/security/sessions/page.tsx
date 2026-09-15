import { requireAdmin } from "@/lib/actions/adminAuth";
import { prisma } from "@/lib/prisma";
import { SecurityTabs } from "@/components/admin/SecurityTabs";
import { revokeAdminSessionAction, revokeAllOtherSessionsAction } from "@/lib/actions/adminSecurity";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const admin = await requireAdmin();
  const sessions = await prisma.adminSession.findMany({ where: { adminId: admin.id }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">관리자 보안</h1>
      <SecurityTabs active="/admin/security/sessions" />
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr><th className="px-4 py-3">IP</th><th className="px-4 py-3">기기</th><th className="px-4 py-3">생성일</th><th className="px-4 py-3">만료일</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">{s.ip}</td>
                <td className="px-4 py-3 text-neutral-500 truncate max-w-xs">{s.userAgent}</td>
                <td className="px-4 py-3 text-neutral-400">{s.createdAt.toLocaleString("ko-KR")}</td>
                <td className="px-4 py-3 text-neutral-400">{s.expiresAt.toLocaleString("ko-KR")}</td>
                <td className="px-4 py-3">
                  <form action={revokeAdminSessionAction}>
                    <input type="hidden" name="sessionId" value={s.id} />
                    <button className="text-red-500 text-xs hover:underline">해제</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={revokeAllOtherSessionsAction} className="mt-4">
        <button className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50">
          내 모든 세션 로그아웃
        </button>
      </form>
    </div>
  );
}
