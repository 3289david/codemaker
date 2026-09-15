import { prisma } from "@/lib/prisma";
import { SectionTitle } from "@/components/ui";
import { Calculator } from "@/components/Calculator";
import { PROJECT_TYPES, FEATURE_KEYS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  const [typeRules, featureRules] = await Promise.all([
    prisma.projectTypeRule.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.pricingRule.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const projectTypes = typeRules.length
    ? typeRules.map((t) => ({ key: t.key, label: t.label }))
    : PROJECT_TYPES;
  const features = featureRules.length
    ? featureRules.filter((f) => f.category !== "ADDON").map((f) => ({ key: f.key, label: f.label }))
    : FEATURE_KEYS;
  const addons = featureRules
    .filter((f) => f.category === "ADDON")
    .map((f) => ({ key: f.key, label: f.label, price: f.price }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <SectionTitle
        eyebrow="CALCULATOR"
        title="견적 계산기"
        desc="제작 종류와 필요한 기능을 선택하면 예상 금액과 기간을 바로 확인할 수 있습니다. 개발 비용은 최대 200,000원입니다."
      />
      <Calculator projectTypes={projectTypes} features={features} addons={addons} />
    </div>
  );
}
