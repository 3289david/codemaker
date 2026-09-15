import { prisma } from "@/lib/prisma";
import { updateSettingsAction } from "@/lib/actions/adminContent";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findUnique({ where: { id: "singleton" } });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">설정</h1>
      <p className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2 mb-4">
        ※ 아래 계좌 정보는 예시입니다 — 실제 서비스 운영 시 반드시 실제 계좌로 교체하세요.
      </p>
      <form
        action={async (formData: FormData) => {
          "use server";
          await updateSettingsAction(undefined, formData);
        }}
        className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3"
      >
        <input name="companyName" defaultValue={settings?.companyName} placeholder="회사명" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="bankName" defaultValue={settings?.bankName} placeholder="은행명" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="bankAccountNumber" defaultValue={settings?.bankAccountNumber} placeholder="계좌번호" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="bankAccountHolder" defaultValue={settings?.bankAccountHolder} placeholder="예금주" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <textarea name="noticeMessage" defaultValue={settings?.noticeMessage ?? ""} placeholder="사이트 공지 메시지" rows={3} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md w-full">저장</button>
      </form>
    </div>
  );
}
