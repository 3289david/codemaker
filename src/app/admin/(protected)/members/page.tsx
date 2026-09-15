import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const members = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">회원 관리</h1>
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr>
              <th className="px-4 py-3">닉네임</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3">주문 수</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">가입일</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/members/${m.id}`} className="text-indigo-600 font-medium hover:underline">{m.nickname}</Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">{m.email}</td>
                <td className="px-4 py-3">{m._count.orders}건</td>
                <td className="px-4 py-3">
                  <Badge className={m.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>{m.status}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-400">{m.createdAt.toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
