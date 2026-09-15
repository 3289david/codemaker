import { notFound } from "next/navigation";
import { requireUser } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry || inquiry.userId !== user.id) notFound();

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{inquiry.title}</h1>
        <Badge className={inquiry.status === "ANSWERED" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}>
          {inquiry.status === "ANSWERED" ? "답변완료" : "답변대기"}
        </Badge>
      </div>
      <p className="text-xs text-neutral-400 mb-4">{inquiry.createdAt.toLocaleString("ko-KR")}</p>
      <div className="border border-neutral-200 rounded-xl p-4 text-sm whitespace-pre-line">{inquiry.content}</div>
      {inquiry.answer && (
        <div className="mt-4 border border-indigo-200 bg-indigo-50/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-indigo-600 mb-2">CodeMaker 답변</p>
          <p className="text-sm whitespace-pre-line">{inquiry.answer}</p>
        </div>
      )}
    </div>
  );
}
