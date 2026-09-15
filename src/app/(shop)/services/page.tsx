import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionTitle } from "@/components/ui";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const services = await prisma.service.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <SectionTitle eyebrow="SERVICES" title="서비스" desc="카테고리별로 제공하는 개발 서비스를 확인하세요." />

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/services"
          className={`text-sm px-3 py-1.5 rounded-full border ${!category ? "bg-indigo-600 text-white border-indigo-600" : "border-neutral-300 text-neutral-600"}`}
        >
          전체
        </Link>
        {SERVICE_CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/services?category=${c.key}`}
            className={`text-sm px-3 py-1.5 rounded-full border ${category === c.key ? "bg-indigo-600 text-white border-indigo-600" : "border-neutral-300 text-neutral-600"}`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {services.length === 0 ? (
        <p className="text-neutral-400">등록된 서비스가 없습니다.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <Link key={s.id} href={`/services/${s.slug}`} className="border border-neutral-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition block">
              <p className="text-2xl mb-2">{s.icon || "💻"}</p>
              <h3 className="font-semibold text-lg">{s.name}</h3>
              <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{s.summary}</p>
              <p className="text-indigo-600 font-bold mt-3">
                {s.priceMin.toLocaleString()}원 ~ {s.priceMax.toLocaleString()}원
              </p>
              <p className="text-xs text-neutral-400 mt-1">예상 기간 {s.durationMin}~{s.durationMax}일</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
