"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction] = useActionState<AuthState, FormData>(loginAction, undefined);

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
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
