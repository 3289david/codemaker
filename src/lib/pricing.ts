import { prisma } from "@/lib/prisma";

export type CalcResult = {
  priceMin: number;
  priceMax: number;
  days: number;
  breakdown: { label: string; price: number; days: number }[];
  hostingPrice: number;
  totalMax: number;
};

// 개발 비용 상한: 선택한 기능이 아무리 많아도 개발 비용(호스팅 제외)은 이 금액을 넘지 않는다.
export const DEV_COST_CAP = 200000;

// 견적 계산기: 제작 종류(BASE) + 선택한 기능(FEATURE)의 가중치를 합산해
// 예상 금액 범위와 예상 기간을 산출한다. 가중치는 DB(ProjectTypeRule, PricingRule)에서
// 관리자가 편집하며, 코드에는 숫자를 하드코딩하지 않는다.
// ADDON(예: 호스팅) 카테고리는 개발 비용 상한(DEV_COST_CAP)에 포함되지 않고 별도로 더해진다.
export async function calculateEstimate(projectType: string, featureKeys: string[]): Promise<CalcResult> {
  const [baseRule, allRules] = await Promise.all([
    prisma.projectTypeRule.findUnique({ where: { key: projectType } }),
    prisma.pricingRule.findMany({ where: { key: { in: featureKeys }, active: true } }),
  ]);

  const featureRules = allRules.filter((r) => r.category !== "ADDON");
  const addonRules = allRules.filter((r) => r.category === "ADDON");

  const basePrice = baseRule?.basePrice ?? 40000;
  const baseDays = baseRule?.baseDays ?? 2;

  const breakdown = [{ label: baseRule?.label ?? "기본", price: basePrice, days: baseDays }];
  let totalPrice = basePrice;
  let totalDays = baseDays;

  for (const rule of featureRules) {
    breakdown.push({ label: rule.label, price: rule.price, days: rule.days });
    totalPrice += rule.price;
    totalDays += rule.days;
  }

  const hostingPrice = addonRules.reduce((sum, rule) => {
    breakdown.push({ label: rule.label, price: rule.price, days: rule.days });
    totalDays += rule.days;
    return sum + rule.price;
  }, 0);

  // 예상 범위는 산정 금액의 -10% ~ +20%로 표시하되, 개발 비용은 DEV_COST_CAP을 넘지 않는다
  // (실제 최종 견적은 관리자가 확정). 호스팅 비용은 이 상한과 무관하게 별도로 더해진다.
  const priceMin = Math.min(Math.round((totalPrice * 0.9) / 10000) * 10000, DEV_COST_CAP);
  const priceMax = Math.min(Math.round((totalPrice * 1.2) / 10000) * 10000, DEV_COST_CAP);

  return { priceMin, priceMax, days: totalDays, breakdown, hostingPrice, totalMax: priceMax + hostingPrice };
}
