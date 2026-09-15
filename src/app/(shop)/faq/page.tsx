import { prisma } from "@/lib/prisma";
import { SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <SectionTitle eyebrow="FAQ" title="자주 묻는 질문" />
      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <h3 className="font-semibold text-neutral-700 mb-3">{cat}</h3>
          <div className="space-y-2">
            {faqs.filter((f) => f.category === cat).map((f) => (
              <details key={f.id} className="border border-neutral-200 rounded-lg p-4">
                <summary className="font-medium cursor-pointer">{f.question}</summary>
                <p className="text-sm text-neutral-500 mt-2 whitespace-pre-line">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      ))}
      {faqs.length === 0 && <p className="text-neutral-400">등록된 FAQ가 없습니다.</p>}
    </div>
  );
}
