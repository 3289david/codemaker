import { prisma } from "@/lib/prisma";
import { upsertFaqAction, deleteFaqAction } from "@/lib/actions/adminContent";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const [faqs, editing] = await Promise.all([
    prisma.faq.findMany({ orderBy: { sortOrder: "asc" } }),
    edit ? prisma.faq.findUnique({ where: { id: edit } }) : null,
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">FAQ 관리</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden h-fit">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-left">
              <tr><th className="px-4 py-3">질문</th><th className="px-4 py-3">분류</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {faqs.map((f) => (
                <tr key={f.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium">{f.question}</td>
                  <td className="px-4 py-3 text-neutral-500">{f.category}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <a href={`/admin/faq?edit=${f.id}`} className="text-indigo-600 hover:underline text-xs">수정</a>
                    <form action={deleteFaqAction} className="inline">
                      <input type="hidden" name="id" value={f.id} />
                      <button className="text-red-500 hover:underline text-xs">삭제</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          action={async (formData: FormData) => {
            "use server";
            await upsertFaqAction(undefined, formData);
          }}
          className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <p className="font-semibold mb-1">{editing ? "수정" : "새 FAQ"}</p>
          <input name="category" required defaultValue={editing?.category ?? "일반"} placeholder="분류" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="question" required defaultValue={editing?.question} placeholder="질문" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <textarea name="answer" required defaultValue={editing?.answer} placeholder="답변" rows={4} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} placeholder="정렬순서" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md w-full">저장</button>
        </form>
      </div>
    </div>
  );
}
