import { requireUser, updateProfileAction } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProfileForm } from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function MyPageHome() {
  const user = await requireUser();
  const [orderCount, unreadNotif, inquiryCount] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    prisma.inquiry.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/mypage/orders" className="border border-neutral-200 rounded-xl p-5 hover:border-indigo-300">
          <p className="text-xs text-neutral-400">주문</p>
          <p className="text-2xl font-bold mt-1">{orderCount}건</p>
        </Link>
        <Link href="/mypage/notifications" className="border border-neutral-200 rounded-xl p-5 hover:border-indigo-300">
          <p className="text-xs text-neutral-400">읽지 않은 알림</p>
          <p className="text-2xl font-bold mt-1">{unreadNotif}건</p>
        </Link>
        <Link href="/mypage/inquiries" className="border border-neutral-200 rounded-xl p-5 hover:border-indigo-300">
          <p className="text-xs text-neutral-400">1:1 문의</p>
          <p className="text-2xl font-bold mt-1">{inquiryCount}건</p>
        </Link>
      </div>

      <div className="border border-neutral-200 rounded-xl p-6 max-w-md">
        <h2 className="font-semibold mb-4">프로필</h2>
        <p className="text-sm text-neutral-400 mb-4">{user.email}</p>
        <ProfileForm action={updateProfileAction} nickname={user.nickname} phone={user.phone ?? ""} />
      </div>
    </div>
  );
}
