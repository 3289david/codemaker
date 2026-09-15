import Link from "next/link";
import { requireUser } from "@/lib/actions/auth";

const NAV = [
  { href: "/mypage", label: "대시보드" },
  { href: "/mypage/orders", label: "주문 내역" },
  { href: "/mypage/inquiries", label: "1:1 문의" },
  { href: "/mypage/notifications", label: "알림" },
];

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-[180px_1fr] gap-8">
      <aside className="space-y-1 text-sm">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="block px-3 py-2 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900">
            {n.label}
          </Link>
        ))}
      </aside>
      <div>{children}</div>
    </div>
  );
}
