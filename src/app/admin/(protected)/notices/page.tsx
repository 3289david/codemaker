import { prisma } from "@/lib/prisma";
import { upsertNoticeAction, deleteNoticeAction } from "@/lib/actions/adminContent";
import { NOTICE_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const [notices, editing] = await Promise.all([
    prisma.notice.findMany({ orderBy: { createdAt: "desc" } }),
    edit ? prisma.notice.findUnique({ where: { id: edit } }) : null,
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">공지사항 관리</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden h-fit">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-left">
              <tr><th className="px-4 py-3">제목</th><th className="px-4 py-3">분류</th><th className="px-4 py-3">고정</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium">{n.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{n.category}</td>
                  <td className="px-4 py-3">{n.pinned ? "O" : "-"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <a href={`/admin/notices?edit=${n.id}`} className="text-indigo-600 hover:underline text-xs">수정</a>
                    <form action={deleteNoticeAction} className="inline">
                      <input type="hidden" name="id" value={n.id} />
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
            await upsertNoticeAction(undefined, formData);
          }}
          className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <p className="font-semibold mb-1">{editing ? "수정" : "새 공지"}</p>
          <select name="category" defaultValue={editing?.category ?? NOTICE_CATEGORIES[0].key} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
            {NOTICE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <input name="title" required defaultValue={editing?.title} placeholder="제목" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <textarea name="content" required defaultValue={editing?.content} placeholder="내용" rows={6} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="pinned" defaultChecked={editing?.pinned} /> 상단 고정</label>
          <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md w-full">저장</button>
        </form>
      </div>
    </div>
  );
}
