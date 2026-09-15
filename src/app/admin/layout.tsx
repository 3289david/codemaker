import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "CodeMaker 관리자",
  description: "CodeMaker 관리자 패널입니다.",
};

// 관리자 영역은 고객용 헤더/푸터와 완전히 분리된 별도의 루트 레이아웃을 사용한다.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-neutral-100 text-neutral-900">{children}</body>
    </html>
  );
}
