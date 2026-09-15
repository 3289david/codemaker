import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { answerInquiryAction } from "@/lib/actions/adminContent";

export const dynamic = "force-dynamic";

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id }, include: { user: true } });
  if (!inquiry) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold mb-1">{inquiry.title}</h1>
      <p className="text-sm text-neutral-500 mb-4">{inquiry.user.nickname} ({inquiry.user.email})</p>
      <div className="bg-white border border-neutral-200 rounded-xl p-4 text-sm whitespace-pre-line">{inquiry.content}</div>

      <form
        action={async (formData: FormData) => {
          "use server";
          await answerInquiryAction(undefined, formData);
        }}
        className="mt-4 space-y-2"
      >
        <input type="hidden" name="id" value={inquiry.id} />
        <textarea name="answer" required defaultValue={inquiry.answer ?? ""} rows={5} placeholder="답변 작성" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md">답변 등록</button>
      </form>
    </div>
  );
}
