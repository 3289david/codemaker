"use client";

import { useActionState } from "react";
import { createAdminAction, type ActionState } from "@/lib/actions/adminSecurity";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export function CreateAdminForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createAdminAction, undefined);
  return (
    <form action={formAction} className="space-y-2">
      <input name="loginId" required placeholder="아이디" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <input name="password" type="password" required placeholder="비밀번호 (8자 이상)" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <input name="name" required placeholder="이름" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <select name="role" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
        <option value="STAFF">STAFF</option>
        <option value="MANAGER">MANAGER</option>
        <option value="SUPER">SUPER</option>
      </select>
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 w-full">
        추가
      </SubmitButton>
    </form>
  );
}
