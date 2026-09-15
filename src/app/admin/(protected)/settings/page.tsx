import { prisma } from "@/lib/prisma";
import { updateSettingsAction } from "@/lib/actions/adminContent";
import { maskSecret } from "@/lib/settings";
import { getAppOrigin } from "@/lib/appUrl";
import { googleRedirectUri, githubRedirectUri } from "@/lib/oauth";

export const dynamic = "force-dynamic";

function SecretInput({ name, placeholder, currentValue }: { name: string; placeholder: string; currentValue?: string | null }) {
  return (
    <div>
      <input
        name={name}
        type="password"
        placeholder={currentValue ? `현재: ${maskSecret(currentValue)} (변경하려면 새 값 입력)` : placeholder}
        className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
        autoComplete="off"
      />
      <p className="text-xs text-neutral-400 mt-0.5">비워두면 기존 값이 유지됩니다.</p>
    </div>
  );
}

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findUnique({ where: { id: "singleton" } });
  const origin = getAppOrigin();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">설정</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await updateSettingsAction(undefined, formData);
        }}
        className="space-y-6"
      >
        {/* 사이트 정보 */}
        <section className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">사이트 정보</h2>
          <input name="companyName" defaultValue={settings?.companyName} placeholder="회사명" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input name="contactEmail" defaultValue={settings?.contactEmail ?? ""} placeholder="문의 이메일" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <input name="contactPhone" defaultValue={settings?.contactPhone ?? ""} placeholder="문의 전화번호" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <textarea name="metaDescription" defaultValue={settings?.metaDescription ?? ""} placeholder="사이트 메타 설명 (SEO)" rows={2} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <textarea name="noticeMessage" defaultValue={settings?.noticeMessage ?? ""} placeholder="사이트 공지 메시지" rows={2} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        </section>

        {/* 무통장입금 계좌 */}
        <section className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">무통장입금 계좌</h2>
          <p className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2">
            ※ 실제 서비스 운영 시 반드시 실제 계좌로 교체하세요.
          </p>
          <input name="bankName" defaultValue={settings?.bankName} placeholder="은행명" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="bankAccountNumber" defaultValue={settings?.bankAccountNumber} placeholder="계좌번호" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="bankAccountHolder" defaultValue={settings?.bankAccountHolder} placeholder="예금주" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        </section>

        {/* 토글 */}
        <section className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">동작 옵션</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allowGuestOrders" defaultChecked={settings?.allowGuestOrders ?? true} className="accent-indigo-600" />
            비회원(게스트) 주문 허용
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="autoApproveReviews" defaultChecked={settings?.autoApproveReviews ?? false} className="accent-indigo-600" />
            리뷰 자동 승인 (끄면 관리자가 수동 승인)
          </label>
        </section>

        {/* Discord */}
        <section className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Discord 알림 / 봇</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="discordNotifyEnabled" defaultChecked={settings?.discordNotifyEnabled ?? true} className="accent-indigo-600" />
            신규 주문 Discord 알림 사용
          </label>
          <SecretInput name="discordWebhookUrl" placeholder="Discord 웹훅 URL" currentValue={settings?.discordWebhookUrl} />
          <input name="discordNotifyChannelId" defaultValue={settings?.discordNotifyChannelId ?? ""} placeholder="봇 알림 채널 ID (웹훅 대신 봇으로 보낼 때)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <SecretInput name="discordBotToken" placeholder="Discord 봇 토큰" currentValue={settings?.discordBotToken} />
          <input name="discordGuildId" defaultValue={settings?.discordGuildId ?? ""} placeholder="Discord 서버(길드) ID" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="discordAdminUserIds" defaultValue={settings?.discordAdminUserIds ?? ""} placeholder="봇 관리자 명령어 허용 유저 ID (쉼표로 구분)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="discordAdminRoleIds" defaultValue={settings?.discordAdminRoleIds ?? ""} placeholder="봇 관리자 명령어 허용 역할 ID (쉼표로 구분)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <p className="text-xs text-neutral-400">
            봇 토큰/서버 ID를 바꾼 뒤에는 <code className="bg-neutral-100 px-1 rounded">pm2 restart codemaker-bot</code>이 필요합니다.
          </p>
        </section>

        {/* OAuth */}
        <section className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">소셜 로그인 (OAuth)</h2>
          <p className="text-xs text-neutral-400">
            값을 바꾸기 전에 각 OAuth 앱에 아래 redirect URI가 이미 등록되어 있어야 합니다.
          </p>
          <div className="text-xs bg-neutral-50 border border-neutral-200 rounded-md p-3 space-y-1">
            <p>Google redirect URI: <code>{googleRedirectUri()}</code></p>
            <p>GitHub callback URL: <code>{githubRedirectUri()}</code></p>
            <p>현재 기준 origin: <code>{origin}</code> (환경변수 NEXT_PUBLIC_APP_ORIGIN)</p>
          </div>
          <p className="text-sm font-medium mt-2">Google</p>
          <input name="googleClientId" defaultValue={settings?.googleClientId ?? ""} placeholder="Google Client ID" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <SecretInput name="googleClientSecret" placeholder="Google Client Secret" currentValue={settings?.googleClientSecret} />
          <p className="text-sm font-medium mt-2">GitHub</p>
          <input name="githubClientId" defaultValue={settings?.githubClientId ?? ""} placeholder="GitHub Client ID" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <SecretInput name="githubClientSecret" placeholder="GitHub Client Secret" currentValue={settings?.githubClientSecret} />
        </section>

        <button className="bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-md">저장</button>
      </form>
    </div>
  );
}
