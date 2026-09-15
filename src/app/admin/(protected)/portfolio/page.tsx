import { prisma } from "@/lib/prisma";
import { upsertPortfolioAction, deletePortfolioAction } from "@/lib/actions/adminContent";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const [items, editing] = await Promise.all([
    prisma.portfolio.findMany({ orderBy: { sortOrder: "asc" } }),
    edit ? prisma.portfolio.findUnique({ where: { id: edit } }) : null,
  ]);
  const techStack: string[] = editing ? JSON.parse(editing.techStack || "[]") : [];
  const features: string[] = editing ? JSON.parse(editing.features || "[]") : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">포트폴리오 관리</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden h-fit">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-left">
              <tr><th className="px-4 py-3">제목</th><th className="px-4 py-3">카테고리</th><th className="px-4 py-3">공개</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{p.category}</td>
                  <td className="px-4 py-3">{p.active ? "O" : "X"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <a href={`/admin/portfolio?edit=${p.id}`} className="text-indigo-600 hover:underline text-xs">수정</a>
                    <form action={deletePortfolioAction} className="inline">
                      <input type="hidden" name="id" value={p.id} />
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
            await upsertPortfolioAction(undefined, formData);
          }}
          className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <p className="font-semibold mb-1">{editing ? "수정" : "새 포트폴리오"}</p>
          <input name="title" required defaultValue={editing?.title} placeholder="제목" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <select name="category" defaultValue={editing?.category ?? SERVICE_CATEGORIES[0].key} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
            {SERVICE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <textarea name="description" defaultValue={editing?.description} placeholder="설명" rows={3} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="techStack" defaultValue={techStack.join(", ")} placeholder="기술스택 (쉼표 구분)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <textarea name="features" defaultValue={features.join("\n")} placeholder="주요 기능 (줄바꿈 구분)" rows={2} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input name="duration" defaultValue={editing?.duration} placeholder="소요 기간" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <input name="priceBand" defaultValue={editing?.priceBand} placeholder="가격대" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <input name="liveUrl" defaultValue={editing?.liveUrl ?? ""} placeholder="라이브 URL" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="githubUrl" defaultValue={editing?.githubUrl ?? ""} placeholder="GitHub URL" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={editing?.active ?? true} /> 공개</label>
          <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md w-full">저장</button>
        </form>
      </div>
    </div>
  );
}
