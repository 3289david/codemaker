import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { deleteServiceAction, upsertPricingRuleAction, upsertProjectTypeRuleAction } from "@/lib/actions/adminContent";
import { FEATURE_KEYS, PROJECT_TYPES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const [services, editing, pricingRules, projectRules] = await Promise.all([
    prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
    edit ? prisma.service.findUnique({ where: { id: edit } }) : null,
    prisma.pricingRule.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.projectTypeRule.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-6">서비스 관리</h1>
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500 text-left">
                <tr><th className="px-4 py-3">이름</th><th className="px-4 py-3">카테고리</th><th className="px-4 py-3">가격</th><th className="px-4 py-3">공개</th><th className="px-4 py-3"></th></tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-t border-neutral-100">
                    <td className="px-4 py-3 font-medium">{s.icon} {s.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.category}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.priceMin.toLocaleString()}~{s.priceMax.toLocaleString()}</td>
                    <td className="px-4 py-3">{s.active ? "O" : "X"}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <a href={`/admin/services?edit=${s.id}`} className="text-indigo-600 hover:underline text-xs">수정</a>
                      <form action={deleteServiceAction} className="inline">
                        <input type="hidden" name="id" value={s.id} />
                        <button className="text-red-500 hover:underline text-xs">삭제</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <p className="font-semibold mb-3">{editing ? "서비스 수정" : "새 서비스 추가"}</p>
            <ServiceForm service={editing} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">견적 계산기 - 기능별 가격 규칙</h2>
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500 text-left">
                <tr><th className="px-4 py-3">키</th><th className="px-4 py-3">라벨</th><th className="px-4 py-3">가격</th><th className="px-4 py-3">기간</th></tr>
              </thead>
              <tbody>
                {pricingRules.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-100">
                    <td className="px-4 py-3 font-mono text-xs">{r.key}</td>
                    <td className="px-4 py-3">{r.label}</td>
                    <td className="px-4 py-3">+{r.price.toLocaleString()}원</td>
                    <td className="px-4 py-3">+{r.days}일</td>
                  </tr>
                ))}
                {pricingRules.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-neutral-400">등록된 규칙이 없습니다. 우측에서 추가하세요.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <form
            action={async (formData: FormData) => {
              "use server";
              await upsertPricingRuleAction(undefined, formData);
            }}
            className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2"
          >
            <p className="font-semibold mb-1">규칙 추가/수정</p>
            <select name="key" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
              {FEATURE_KEYS.map((f) => <option key={f.key} value={f.key}>{f.key} - {f.label}</option>)}
            </select>
            <input name="label" required placeholder="라벨" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <input name="price" type="number" required placeholder="추가 금액" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <input name="days" type="number" required placeholder="추가 기간(일)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> 사용</label>
            <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md w-full">저장</button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">견적 계산기 - 제작 종류별 기본값</h2>
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500 text-left">
                <tr><th className="px-4 py-3">키</th><th className="px-4 py-3">라벨</th><th className="px-4 py-3">기본 금액</th><th className="px-4 py-3">기본 기간</th></tr>
              </thead>
              <tbody>
                {projectRules.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-100">
                    <td className="px-4 py-3 font-mono text-xs">{r.key}</td>
                    <td className="px-4 py-3">{r.label}</td>
                    <td className="px-4 py-3">{r.basePrice.toLocaleString()}원</td>
                    <td className="px-4 py-3">{r.baseDays}일</td>
                  </tr>
                ))}
                {projectRules.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-neutral-400">등록된 기본값이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <form
            action={async (formData: FormData) => {
              "use server";
              await upsertProjectTypeRuleAction(undefined, formData);
            }}
            className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2"
          >
            <p className="font-semibold mb-1">기본값 추가/수정</p>
            <select name="key" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
              {PROJECT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.key} - {t.label}</option>)}
            </select>
            <input name="label" required placeholder="라벨" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <input name="basePrice" type="number" required placeholder="기본 금액" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <input name="baseDays" type="number" required placeholder="기본 기간(일)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md w-full">저장</button>
          </form>
        </div>
      </div>
    </div>
  );
}
