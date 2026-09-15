import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/lib/actions/auth";

const NAV = [
  { href: "/services", label: "서비스" },
  { href: "/calculator", label: "견적계산기" },
  { href: "/portfolio", label: "제작사례" },
  { href: "/reviews", label: "리뷰" },
  { href: "/notices", label: "공지사항" },
  { href: "/faq", label: "FAQ" },
  { href: "/order/lookup", label: "주문조회" },
];

export async function Header() {
  const user = await getCurrentUser();
  const unread = user
    ? await prisma.notification.count({ where: { userId: user.id, isRead: false } })
    : 0;

  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-neutral-900">
          <span className="text-indigo-600">Code</span>Maker
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-indigo-600">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/order/new"
            className="hidden sm:inline-flex bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            주문 신청하기
          </Link>
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/mypage/notifications" className="relative text-neutral-500 hover:text-indigo-600">
                🔔
                {unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <Link href="/mypage" className="text-neutral-600 hover:text-indigo-600">
                {user.nickname}님
              </Link>
              <form action={logoutAction}>
                <button className="text-neutral-400 hover:text-neutral-700">로그아웃</button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/login" className="text-neutral-600 hover:text-indigo-600">
                로그인
              </Link>
              <Link href="/signup" className="text-neutral-600 hover:text-indigo-600">
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
