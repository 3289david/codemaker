import Link from "next/link";
import { OAuthButtons } from "@/components/OAuthButtons";

export default function SignupPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>
      <p className="text-sm text-neutral-500 text-center mb-5">
        아래 계정으로 가입하면 별도 절차 없이 바로 이용할 수 있습니다.
      </p>
      <OAuthButtons />
      <p className="text-sm text-neutral-500 text-center mt-6">
        이미 계정이 있으신가요? <Link href="/login" className="text-indigo-600 hover:underline">로그인</Link>
      </p>
    </div>
  );
}
