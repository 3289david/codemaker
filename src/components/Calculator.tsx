"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { estimateAction } from "@/lib/actions/calculator";
import type { CalcResult } from "@/lib/pricing";

export function Calculator({
  projectTypes,
  features,
}: {
  projectTypes: { key: string; label: string }[];
  features: { key: string; label: string }[];
}) {
  const [projectType, setProjectType] = useState(projectTypes[0]?.key ?? "WEBSITE");
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function calculate() {
    startTransition(async () => {
      const r = await estimateAction(projectType, selected);
      setResult(r);
    });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <p className="font-semibold mb-3">제작 종류</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {projectTypes.map((t) => (
              <button
                key={t.key}
                onClick={() => setProjectType(t.key)}
                className={`text-sm px-3 py-2 rounded-lg border ${
                  projectType === t.key ? "bg-indigo-600 text-white border-indigo-600" : "border-neutral-300 hover:border-indigo-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold mb-3">필요한 기능 (복수 선택)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {features.map((f) => (
              <label
                key={f.key}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer ${
                  selected.includes(f.key) ? "bg-indigo-50 border-indigo-400" : "border-neutral-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(f.key)}
                  onChange={() => toggle(f.key)}
                  className="accent-indigo-600"
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={calculate}
          disabled={isPending}
          className="bg-neutral-900 text-white font-medium px-6 py-3 rounded-lg hover:bg-neutral-700 disabled:opacity-50"
        >
          {isPending ? "계산 중..." : "예상 금액 계산하기"}
        </button>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 h-fit sticky top-24">
        <p className="text-sm text-neutral-400 mb-1">예상 금액</p>
        {result ? (
          <>
            <p className="text-2xl font-bold text-indigo-600">
              {result.priceMin.toLocaleString()}원 ~ {result.priceMax.toLocaleString()}원
            </p>
            <p className="text-sm text-neutral-500 mt-1">예상 기간: 약 {result.days}일</p>
            <div className="mt-4 space-y-1 text-xs text-neutral-500">
              {result.breakdown.map((b, i) => (
                <div key={i} className="flex justify-between">
                  <span>{b.label}</span>
                  <span>+{b.price.toLocaleString()}원 / {b.days}일</span>
                </div>
              ))}
            </div>
            <Link
              href={`/order/new?type=${projectType}&features=${selected.join(",")}`}
              className="mt-6 block text-center bg-indigo-600 text-white font-medium px-4 py-3 rounded-lg hover:bg-indigo-700"
            >
              정식 견적 요청
            </Link>
            <p className="text-[11px] text-neutral-400 mt-3">
              * 실제 최종 견적은 담당자가 상세 요구사항을 검토한 뒤 확정됩니다.
            </p>
          </>
        ) : (
          <p className="text-neutral-400 text-sm">항목을 선택하고 계산하기를 눌러주세요.</p>
        )}
      </div>
    </div>
  );
}
