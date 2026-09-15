import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.portfolio.findUnique({ where: { id } });
  if (!p || !p.active) notFound();

  const tech: string[] = JSON.parse(p.techStack || "[]");
  const features: string[] = JSON.parse(p.features || "[]");

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="h-48 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold text-center px-6">
        {p.title}
      </div>
      <p className="text-indigo-600 font-semibold text-sm mt-6">{p.category}</p>
      <h1 className="text-2xl font-bold mt-1">{p.title}</h1>
      <p className="text-neutral-600 mt-3 whitespace-pre-line">{p.description}</p>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div className="border border-neutral-200 rounded-lg p-4">
          <p className="text-xs text-neutral-400">소요 기간</p>
          <p className="font-semibold mt-1">{p.duration}</p>
        </div>
        <div className="border border-neutral-200 rounded-lg p-4">
          <p className="text-xs text-neutral-400">가격대</p>
          <p className="font-semibold mt-1">{p.priceBand}</p>
        </div>
      </div>

      {tech.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold mb-2">기술 스택</p>
          <div className="flex flex-wrap gap-2">
            {tech.map((t) => (
              <span key={t} className="text-xs bg-neutral-100 rounded px-2 py-1 text-neutral-600">{t}</span>
            ))}
          </div>
        </div>
      )}

      {features.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold mb-2">주요 기능</p>
          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
            {features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        {p.liveUrl && (
          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="border border-neutral-300 px-4 py-2 rounded-lg text-sm hover:bg-neutral-50">
            라이브 링크 →
          </a>
        )}
        {p.githubUrl && (
          <a href={p.githubUrl} target="_blank" rel="noreferrer" className="border border-neutral-300 px-4 py-2 rounded-lg text-sm hover:bg-neutral-50">
            GitHub →
          </a>
        )}
      </div>
    </div>
  );
}
