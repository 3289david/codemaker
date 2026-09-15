import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PROJECT_TYPES } from "@/lib/constants";
import { OrderForm } from "@/components/OrderForm";
import { SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const user = await getCurrentUser();
  const typeRules = await prisma.projectTypeRule.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });

  const projectTypes = typeRules.length ? typeRules.map((t) => ({ key: t.key, label: t.label })) : PROJECT_TYPES;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <SectionTitle eyebrow="ORDER" title="주문 신청하기" desc="상세 요구사항을 남겨주시면 담당자가 확인 후 정식 견적을 보내드립니다." />
      <OrderForm
        projectTypes={projectTypes}
        defaultType={type}
        isLoggedIn={!!user}
        defaultEmail={user?.email}
      />
    </div>
  );
}
