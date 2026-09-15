import { prisma } from "@/lib/prisma";

export type CalcResult = {
  priceMin: number;
  priceMax: number;
  days: number;
  breakdown: { label: string; price: number; days: number }[];
};

// 견적 계산기: 제작 종류(BASE) + 선택한 기능(FEATURE)의 가중치를 합산해
// 예상 금액 범위와 예상 기간을 산출한다. 가중치는 DB(ProjectTypeRule, PricingRule)에서
// 관리자가 편집하며, 코드에는 숫자를 하드코딩하지 않는다.
export async function calculateEstimate(projectType: string, featureKeys: string[]): Promise<CalcResult> {
  const [baseRule, featureRules] = await Promise.all([
    prisma.projectTypeRule.findUnique({ where: { key: projectType } }),
    prisma.pricingRule.findMany({ where: { key: { in: featureKeys }, active: true } }),
  ]);

  const basePrice = baseRule?.basePrice ?? 500000;
  const baseDays = baseRule?.baseDays ?? 5;

  const breakdown = [{ label: baseRule?.label ?? "기본", price: basePrice, days: baseDays }];
  let totalPrice = basePrice;
  let totalDays = baseDays;

  for (const rule of featureRules) {
    breakdown.push({ label: rule.label, price: rule.price, days: rule.days });
    totalPrice += rule.price;
    totalDays += rule.days;
  }

  // 예상 범위는 산정 금액의 -10% ~ +20%로 표시 (실제 견적은 관리자가 확정)
  const priceMin = Math.round((totalPrice * 0.9) / 10000) * 10000;
  const priceMax = Math.round((totalPrice * 1.2) / 10000) * 10000;

  return { priceMin, priceMax, days: totalDays, breakdown };
}
