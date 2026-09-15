import Link from "next/link";
import { requireUser } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const user = await requireUser();
  const inquiries = await prisma.inquiry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">1:1 문의</h1>
        <Link href="/mypage/inquiries/new" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700">
          문의하기
        </Link>
      </div>
      <div className="divide-y divide-neutral-200 border-y border-neutral-200">
        {inquiries.map((i) => (
          <Link key={i.id} href={`/mypage/inquiries/${i.id}`} className="flex items-center justify-between py-4 hover:bg-neutral-50 px-2">
            <div>
              <p className="font-medium">{i.title}</p>
              <p className="text-xs text-neutral-400 mt-1">{i.createdAt.toLocaleDateString("ko-KR")}</p>
            </div>
            <Badge className={i.status === "ANSWERED" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}>
              {i.status === "ANSWERED" ? "답변완료" : "답변대기"}
            </Badge>
          </Link>
        ))}
        {inquiries.length === 0 && <p className="text-neutral-400 py-8 text-center">문의 내역이 없습니다.</p>}
      </div>
    </div>
  );
}
