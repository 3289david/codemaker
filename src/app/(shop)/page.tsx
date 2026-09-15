import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionTitle, Stars } from "@/components/ui";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

const PROCESS_STEPS = [
  { step: "1", title: "견적 요청", desc: "견적 계산기로 예상 금액을 확인하고 상세 내용을 담아 주문을 신청하세요." },
  { step: "2", title: "정식 견적 수신", desc: "담당 개발자가 요구사항을 검토하고 확정 견적과 예상 기간을 보내드립니다." },
  { step: "3", title: "결제 및 제작 시작", desc: "견적 승인 후 계약금(또는 전액) 입금이 확인되면 바로 제작을 시작합니다." },
  { step: "4", title: "실시간 소통", desc: "주문별 채팅으로 진행 상황을 확인하고, 필요 시 자유롭게 문의하세요." },
  { step: "5", title: "검수 및 수정", desc: "1차 산출물을 검수하고, 필요한 부분은 수정 요청을 통해 반영합니다." },
  { step: "6", title: "납품 및 사후지원", desc: "최종 산출물을 다운로드하고, 이후 유지보수 요청도 언제든 가능합니다." },
];

const WHY_US = [
  { title: "실무 개발자 직접 진행", desc: "외주 중개 없이 담당 개발자가 처음부터 끝까지 책임지고 진행합니다." },
  { title: "투명한 가격 산정", desc: "기능별 가중치 기반 견적 계산기로 예상 금액을 미리 확인할 수 있습니다." },
  { title: "실시간 진행 상황 공유", desc: "주문 상세 페이지에서 진행률, 상태, 채팅을 실시간으로 확인하세요." },
  { title: "체계적인 사후 관리", desc: "버전별 산출물 관리와 수정 요청 트래킹으로 이력을 명확히 남깁니다." },
];

export default async function HomePage() {
  const [services, portfolios, reviews, notices, orderCount] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.portfolio.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.review.findMany({ where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 3, include: { user: true } }),
    prisma.notice.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 5 }),
    prisma.order.count(),
  ]);
  const faqs = await prisma.faq.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 4 });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
          <p className="text-indigo-600 font-semibold mb-3">개발 외주 / 수주 플랫폼</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
            아이디어를, 실제로 동작하는
            <br />
            코드로 만들어드립니다
          </h1>
          <p className="mt-5 text-neutral-500 max-w-2xl mx-auto">
            웹사이트, 웹서비스, Discord Bot, Chrome Extension, API, 자동화 프로그램, AI 기능까지 —
            견적 계산부터 제작, 결제, 납품까지 하나의 플랫폼에서 처리하세요.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/order/new" className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-700">
              주문 신청하기
            </Link>
            <Link href="/calculator" className="bg-white border border-neutral-300 font-medium px-6 py-3 rounded-lg hover:bg-neutral-50">
              견적 받기
            </Link>
          </div>
          <p className="mt-6 text-sm text-neutral-400">누적 주문 접수 {orderCount.toLocaleString()}건</p>
        </div>
      </section>

      {/* Notices ticker */}
      {notices.length > 0 && (
        <div className="bg-neutral-900 text-neutral-200 text-sm">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3 overflow-x-auto">
            <span className="shrink-0 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded">공지</span>
            {notices.map((n) => (
              <Link key={n.id} href={`/notices/${n.id}`} className="shrink-0 hover:underline">
                {n.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <SectionTitle eyebrow="SERVICES" title="서비스 카테고리" desc="필요한 개발 분야를 선택하고 상세 내용을 확인하세요." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SERVICE_CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/services?category=${c.key}`}
              className="border border-neutral-200 rounded-xl p-4 text-sm font-medium hover:border-indigo-400 hover:bg-indigo-50 transition"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing overview */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle eyebrow="PRICING" title="가격 개요" desc="실제 가격은 요구사항에 따라 달라지며, 정확한 금액은 견적 계산기와 정식 견적을 통해 확인하세요." />
          <div className="grid md:grid-cols-3 gap-4">
            {services.slice(0, 3).map((s) => (
              <div key={s.id} className="bg-white border border-neutral-200 rounded-xl p-6">
                <p className="text-2xl mb-2">{s.icon || "💻"}</p>
                <h3 className="font-semibold text-lg mb-1">{s.name}</h3>
                <p className="text-sm text-neutral-500 mb-3">{s.summary}</p>
                <p className="text-indigo-600 font-bold">
                  {s.priceMin.toLocaleString()}원 ~ {s.priceMax.toLocaleString()}원
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  예상 기간 {s.durationMin}~{s.durationMax}일
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <SectionTitle eyebrow="PROCESS" title="진행 프로세스" />
        <div className="grid md:grid-cols-3 gap-6">
          {PROCESS_STEPS.map((p) => (
            <div key={p.step} className="flex gap-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {p.step}
              </div>
              <div>
                <h4 className="font-semibold">{p.title}</h4>
                <p className="text-sm text-neutral-500 mt-1">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio highlights */}
      {portfolios.length > 0 && (
        <section className="bg-neutral-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <SectionTitle eyebrow="PORTFOLIO" title="제작 사례" />
            <div className="grid md:grid-cols-3 gap-6">
              {portfolios.map((p) => (
                <Link key={p.id} href={`/portfolio/${p.id}`} className="block bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition">
                  <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg px-4 text-center">
                    {p.title}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-indigo-600 font-medium">{p.category}</p>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{p.description}</p>
                    <p className="text-xs text-neutral-400 mt-2">
                      {p.duration} · {p.priceBand}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <SectionTitle eyebrow="WHY US" title="왜 CodeMaker인가요" />
        <div className="grid md:grid-cols-2 gap-6">
          {WHY_US.map((w) => (
            <div key={w.title} className="border border-neutral-200 rounded-xl p-5">
              <h4 className="font-semibold mb-1">{w.title}</h4>
              <p className="text-sm text-neutral-500">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="bg-neutral-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <SectionTitle eyebrow="REVIEWS" title="고객 후기" />
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white border border-neutral-200 rounded-xl p-5">
                  <Stars rating={r.rating} />
                  <p className="text-sm text-neutral-600 mt-3 line-clamp-4">{r.content}</p>
                  <p className="text-xs text-neutral-400 mt-3">{r.user.nickname}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ preview */}
      {faqs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <SectionTitle eyebrow="FAQ" title="자주 묻는 질문" />
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.id} className="border border-neutral-200 rounded-lg p-4">
                <summary className="font-medium cursor-pointer">{f.question}</summary>
                <p className="text-sm text-neutral-500 mt-2 whitespace-pre-line">{f.answer}</p>
              </details>
            ))}
          </div>
          <Link href="/faq" className="inline-block mt-4 text-indigo-600 text-sm font-medium hover:underline">
            FAQ 더 보기 →
          </Link>
        </section>
      )}

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">지금 바로 시작하세요</h2>
          <p className="text-indigo-100 mt-2">견적 계산기로 예상 비용을 확인하고, 몇 분 안에 주문을 접수할 수 있습니다.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/order/new" className="bg-white text-indigo-600 font-medium px-6 py-3 rounded-lg hover:bg-indigo-50">
              주문 신청하기
            </Link>
            <Link href="/calculator" className="border border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-500">
              견적 받기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
