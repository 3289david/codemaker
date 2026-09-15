import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service || !service.active) notFound();

  const capabilities: string[] = JSON.parse(service.capabilities || "[]");
  const related = await prisma.portfolio.findMany({
    where: { active: true, category: service.category },
    take: 3,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <p className="text-indigo-600 font-semibold text-sm mb-2">{service.category}</p>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>{service.icon || "💻"}</span> {service.name}
        </h1>
      </div>
      <p className="text-neutral-500 mt-3">{service.summary}</p>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <div className="border border-neutral-200 rounded-xl p-5">
          <p className="text-xs text-neutral-400">예상 가격</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">
            {service.priceMin.toLocaleString()}원 ~ {service.priceMax.toLocaleString()}원
          </p>
        </div>
        <div className="border border-neutral-200 rounded-xl p-5">
          <p className="text-xs text-neutral-400">예상 소요 기간</p>
          <p className="text-xl font-bold mt-1">{service.durationMin}~{service.durationMax}일</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-3">상세 설명</h2>
        <p className="text-neutral-600 whitespace-pre-line">{service.description}</p>
      </div>

      {capabilities.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">제공 가능 기능</h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            {capabilities.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="text-indigo-600">✓</span> {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-3">관련 제작 사례</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((p) => (
              <Link key={p.id} href={`/portfolio/${p.id}`} className="border border-neutral-200 rounded-lg p-4 text-sm hover:border-indigo-300">
                <p className="font-medium">{p.title}</p>
                <p className="text-neutral-400 text-xs mt-1">{p.duration} · {p.priceBand}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex gap-3">
        <Link
          href={`/order/new?type=${service.category}`}
          className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          이 서비스로 신청하기
        </Link>
        <Link href="/calculator" className="border border-neutral-300 font-medium px-6 py-3 rounded-lg hover:bg-neutral-50">
          견적 계산해보기
        </Link>
      </div>
    </div>
  );
}
