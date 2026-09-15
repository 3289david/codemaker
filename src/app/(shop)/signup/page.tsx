"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export default function SignupPage() {
  const [state, formAction] = useActionState<AuthState, FormData>(signupAction, undefined);

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>
      <form action={formAction} className="space-y-3">
        <input name="email" type="email" required placeholder="이메일" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="password" type="password" required placeholder="비밀번호 (8자 이상)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="nickname" required placeholder="닉네임" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="phone" placeholder="연락처 (선택)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <FormMessage error={state?.error} />
        <SubmitButton className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-md hover:bg-indigo-700">
          회원가입
        </SubmitButton>
      </form>
      <p className="text-sm text-neutral-500 text-center mt-4">
        이미 계정이 있으신가요? <Link href="/login" className="text-indigo-600 hover:underline">로그인</Link>
      </p>
    </div>
  );
}
