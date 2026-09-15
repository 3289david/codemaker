// Google/GitHub/Discord 로그인 버튼 — /login, /signup에서 공용으로 사용한다.
// OAuth는 find-or-create이므로 로그인/가입이 사실상 같은 동작이다: 계정이 없으면
// 새로 만들고, 있으면 로그인한다.
export function OAuthButtons() {
  return (
    <div className="space-y-2 mb-5">
      <a
        href="/api/auth/google"
        className="flex items-center justify-center gap-2 w-full border border-neutral-300 rounded-md py-2.5 text-sm font-medium hover:bg-neutral-50"
      >
        <span aria-hidden>🔵</span> Google로 계속하기
      </a>
      <a
        href="/api/auth/github"
        className="flex items-center justify-center gap-2 w-full bg-neutral-900 text-white border border-neutral-900 rounded-md py-2.5 text-sm font-medium hover:bg-neutral-800"
      >
        <span aria-hidden>⚫</span> GitHub로 계속하기
      </a>
      <a
        href="/api/auth/discord"
        className="flex items-center justify-center gap-2 w-full bg-[#5865F2] text-white rounded-md py-2.5 text-sm font-medium hover:opacity-90"
      >
        <span aria-hidden>🎮</span> Discord로 계속하기
      </a>
    </div>
  );
}
