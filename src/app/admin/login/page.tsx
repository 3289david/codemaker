"use client";

import { useActionState } from "react";
import { adminLoginAction, type AdminLoginState } from "@/lib/actions/adminLogin";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export default function AdminLoginPage() {
  const [state, formAction] = useActionState<AdminLoginState, FormData>(adminLoginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-sm w-full bg-white border border-neutral-200 rounded-xl p-6">
        <h1 className="text-xl font-bold mb-1 text-center">CodeMaker 관리자</h1>
        <p className="text-sm text-neutral-400 mb-6 text-center">관리자 계정으로 로그인하세요.</p>
        <form action={formAction} className="space-y-3">
          <input name="loginId" required defaultValue={state?.loginId} placeholder="아이디" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="password" type="password" required placeholder="비밀번호" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          {state?.needsTotp && (
            <input name="totpToken" required maxLength={6} placeholder="OTP 6자리 코드" className="w-full border border-indigo-300 rounded-md px-3 py-2 text-sm" />
          )}
          <FormMessage error={state?.error} />
          <SubmitButton className="w-full bg-neutral-900 text-white font-medium py-2.5 rounded-md hover:bg-neutral-700">
            로그인
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
