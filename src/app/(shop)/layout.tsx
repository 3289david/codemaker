import type { Metadata } from "next";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CodeMaker - 개발 외주/수주 플랫폼",
  description: "웹사이트, 웹서비스, 봇, API, 자동화 프로그램까지. 견적부터 납품까지 한 번에.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="antialiased">
      <body className="min-h-screen flex flex-col bg-white text-neutral-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
