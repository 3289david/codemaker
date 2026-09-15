"use server";

export type AdminLoginState = { error?: string; needsTotp?: boolean; loginId?: string } | undefined;

// 아이디/비밀번호(+TOTP) 관리자 로그인은 비활성화되었다 — /admin/login은 이제
// Google OAuth(AdminUser.email이 일치하는 계정, 기본값 davideom0414@gmail.com)만 지원한다.
// 실제 로그인 경로는 src/lib/oauth.ts의 adminGoogleLogin()이며, 콜백은
// src/app/api/auth/google/callback/route.ts 에서 처리한다.
// 이 함수는 예전 폼이 실수로 다시 연결되더라도 항상 거부하도록 남겨둔 방어 코드다.
// (과거 비밀번호+TOTP 검증 로직 전문은 git 히스토리에 남아있다.)
export async function adminLoginAction(_prev: AdminLoginState, _formData: FormData): Promise<AdminLoginState> {
  return { error: "아이디/비밀번호 로그인은 비활성화되었습니다. Google 계정으로 로그인해주세요." };
}
