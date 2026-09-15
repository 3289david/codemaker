import { requireAdmin } from "@/lib/actions/adminAuth";
import { prisma } from "@/lib/prisma";
import { SecurityTabs } from "@/components/admin/SecurityTabs";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";
import { UpdateAdminRoleForm } from "@/components/admin/UpdateAdminRoleForm";

export const dynamic = "force-dynamic";

export default async function AdminAdminsPage() {
  const me = await requireAdmin();
  const admins = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">관리자 보안</h1>
      <SecurityTabs active="/admin/security/admins" />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden h-fit">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-left">
              <tr><th className="px-4 py-3">아이디</th><th className="px-4 py-3">이름</th><th className="px-4 py-3">권한</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">2FA</th>{me.role === "SUPER" && <th className="px-4 py-3"></th>}</tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-mono text-xs">{a.loginId}</td>
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{a.role}</td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="px-4 py-3">{a.totpEnabled ? "✓" : "-"}</td>
                  {me.role === "SUPER" && (
                    <td className="px-4 py-3">
                      <UpdateAdminRoleForm adminId={a.id} role={a.role} status={a.status} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {me.role === "SUPER" && (
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <p className="font-semibold mb-3">관리자 추가</p>
            <CreateAdminForm />
          </div>
        )}
      </div>
    </div>
  );
}
