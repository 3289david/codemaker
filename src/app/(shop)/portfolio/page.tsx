import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const items = await prisma.portfolio.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <SectionTitle eyebrow="PORTFOLIO" title="제작 사례" desc="실제로 진행했던 프로젝트들을 확인해보세요." />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => {
          const tech: string[] = JSON.parse(p.techStack || "[]");
          return (
            <Link key={p.id} href={`/portfolio/${p.id}`} className="block border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition">
              <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold px-4 text-center">
                {p.title}
              </div>
              <div className="p-4">
                <p className="text-xs text-indigo-600 font-medium">{p.category}</p>
                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{p.description}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {tech.slice(0, 4).map((t) => (
                    <span key={t} className="text-[11px] bg-neutral-100 rounded px-1.5 py-0.5 text-neutral-500">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-neutral-400 mt-2">{p.duration} · {p.priceBand}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
