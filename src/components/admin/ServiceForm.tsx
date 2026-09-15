"use client";

import { useActionState } from "react";
import { upsertServiceAction, type ActionState } from "@/lib/actions/adminContent";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { Service } from "@prisma/client";

export function ServiceForm({ service }: { service?: Service | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(upsertServiceAction, undefined);
  const capabilities: string[] = service ? JSON.parse(service.capabilities || "[]") : [];

  return (
    <form action={formAction} className="space-y-2">
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="grid sm:grid-cols-2 gap-2">
        <input name="name" required defaultValue={service?.name} placeholder="서비스명" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <select name="category" defaultValue={service?.category ?? SERVICE_CATEGORIES[0].key} className="border border-neutral-300 rounded-md px-3 py-2 text-sm">
          {SERVICE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>
      <input name="summary" defaultValue={service?.summary} placeholder="한 줄 요약" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <textarea name="description" defaultValue={service?.description} placeholder="상세 설명" rows={3} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <textarea name="capabilities" defaultValue={capabilities.join("\n")} placeholder="제공 기능 (줄바꿈 구분)" rows={3} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <input name="priceMin" type="number" defaultValue={service?.priceMin} placeholder="최소가" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="priceMax" type="number" defaultValue={service?.priceMax} placeholder="최대가" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="durationMin" type="number" defaultValue={service?.durationMin} placeholder="최소기간(일)" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="durationMax" type="number" defaultValue={service?.durationMax} placeholder="최대기간(일)" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="icon" defaultValue={service?.icon ?? ""} placeholder="아이콘(이모지)" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input type="checkbox" name="active" defaultChecked={service?.active ?? true} /> 공개
      </label>
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700">
        {service ? "수정 저장" : "서비스 추가"}
      </SubmitButton>
    </form>
  );
}
