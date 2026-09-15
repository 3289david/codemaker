import { requireAdmin } from "@/lib/actions/adminAuth";
import { SecurityTabs } from "@/components/admin/SecurityTabs";
import { TotpSetup } from "@/components/admin/TotpSetup";

export const dynamic = "force-dynamic";

export default async function Admin2faPage() {
  const admin = await requireAdmin();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">관리자 보안</h1>
      <SecurityTabs active="/admin/security/2fa" />
      <div className="bg-white border border-neutral-200 rounded-xl p-5 max-w-md">
        <TotpSetup totpEnabled={admin.totpEnabled} />
      </div>
    </div>
  );
}
