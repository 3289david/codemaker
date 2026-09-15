"use client";

import { useActionState } from "react";
import { lookupOrderAction } from "@/lib/actions/orders";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export default function OrderLookupPage() {
  const [state, formAction] = useActionState(lookupOrderAction, undefined);

  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <h1 className="text-2xl font-bold text-center mb-2">주문 조회</h1>
      <p className="text-sm text-neutral-500 text-center mb-6">주문번호와 PIN을 입력하면 회원가입 없이 진행 상황을 확인할 수 있습니다.</p>
      <form action={formAction} className="space-y-3">
        <input name="orderNo" required placeholder="주문번호 (예: A-10291)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input name="pin" required placeholder="PIN" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <FormMessage error={state?.error} />
        <SubmitButton className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-md hover:bg-indigo-700">
          조회하기
        </SubmitButton>
      </form>
    </div>
  );
}
