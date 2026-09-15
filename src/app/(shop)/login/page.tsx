"use client";

import { use, useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";
import { OAuthButtons } from "@/components/OAuthButtons";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_state: "로그인 요청이 만료되었거나 유효하지 않습니다. 다시 시도해주세요.",
  oauth_cancelled: "로그인이 취소되었습니다.",
  oauth_failed: "소셜 로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  no_email: "소셜 계정에서 이메일 정보를 가져올 수 없습니다.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: oauthError } = use(searchParams);
  const [state, formAction] = useActionState<AuthState, FormData>(loginAction, undefined);

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>

      {oauthError && (
        <div className="mb-4">
          <FormMessage error={OAUTH_ERROR_MESSAGES[oauthError] || "로그인 중 오류가 발생했습니다."} />
        </div>
      )}

      <OAuthButtons />

      <div className="flex items-center gap-3 mb-5 text-xs text-neutral-400">
        <div className="h-px bg-neutral-200 flex-1" />
        또는 이메일로 로그인
        <div className="h-px bg-neutral-200 flex-1" />
      </div>

      <form action={formAction} className="space-y-3">
        <input name="email" type="email" required placeholder="이메일" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="password" type="password" required placeholder="비밀번호" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <FormMessage error={state?.error} />
        <SubmitButton className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-md hover:bg-indigo-700">
          로그인
        </SubmitButton>
      </form>
      <p className="text-sm text-neutral-500 text-center mt-4">
        계정이 없으신가요? <Link href="/signup" className="text-indigo-600 hover:underline">회원가입</Link>
      </p>
      <p className="text-sm text-neutral-500 text-center mt-1">
        회원이 아니어도{" "}
        <Link href="/order/lookup" className="text-indigo-600 hover:underline">주문번호로 조회</Link>할 수 있습니다.
      </p>
    </div>
  );
}
