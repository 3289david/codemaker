"use client";

import { use } from "react";
import Link from "next/link";
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

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>

      {oauthError && (
        <div className="mb-4">
          <FormMessage error={OAUTH_ERROR_MESSAGES[oauthError] || "로그인 중 오류가 발생했습니다."} />
        </div>
      )}

      <p className="text-sm text-neutral-500 text-center mb-5">
        아래 계정으로 간편하게 로그인/가입하세요. 별도의 아이디·비밀번호는 사용하지 않습니다.
      </p>
      <OAuthButtons />

      <p className="text-sm text-neutral-500 text-center mt-6">
        회원이 아니어도{" "}
        <Link href="/order/lookup" className="text-indigo-600 hover:underline">주문번호로 조회</Link>할 수 있습니다.
      </p>
    </div>
  );
}
