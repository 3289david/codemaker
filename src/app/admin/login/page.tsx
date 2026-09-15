"use client";

import { use } from "react";
import { FormMessage } from "@/components/ui";

const ADMIN_OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_state: "로그인 요청이 만료되었거나 유효하지 않습니다. 다시 시도해주세요.",
  oauth_cancelled: "로그인이 취소되었습니다.",
  oauth_failed: "Google 로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  no_email: "Google 계정에서 이메일 정보를 가져올 수 없습니다.",
  not_admin: "해당 Google 계정은 관리자로 등록되어 있지 않습니다.",
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = use(searchParams);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-sm w-full bg-white border border-neutral-200 rounded-xl p-6">
        <h1 className="text-xl font-bold mb-1 text-center">CodeMaker 관리자</h1>
        <p className="text-sm text-neutral-400 mb-6 text-center">
          등록된 관리자 Google 계정으로만 로그인할 수 있습니다.
        </p>

        {error && (
          <div className="mb-4">
            <FormMessage error={ADMIN_OAUTH_ERROR_MESSAGES[error] || "로그인 중 오류가 발생했습니다."} />
          </div>
        )}

        <a
          href="/api/auth/google?intent=admin"
          className="flex items-center justify-center gap-2 w-full bg-neutral-900 text-white font-medium py-2.5 rounded-md hover:bg-neutral-700"
        >
          <span aria-hidden>🔵</span> Google로 관리자 로그인
        </a>
      </div>
    </div>
  );
}
