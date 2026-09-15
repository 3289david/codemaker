import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">문의 관리</h1>
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr><th className="px-4 py-3">제목</th><th className="px-4 py-3">작성자</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">접수일</th></tr>
          </thead>
          <tbody>
            {inquiries.map((i) => (
              <tr key={i.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/inquiries/${i.id}`} className="text-indigo-600 font-medium hover:underline">{i.title}</Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">{i.user.nickname}</td>
                <td className="px-4 py-3">
                  <Badge className={i.status === "ANSWERED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                    {i.status === "ANSWERED" ? "답변완료" : "답변대기"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-neutral-400">{i.createdAt.toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">문의가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
