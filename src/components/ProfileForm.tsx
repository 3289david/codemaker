"use client";

import { useActionState } from "react";
import type { AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export function ProfileForm({
  action,
  nickname,
  phone,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  nickname: string;
  phone: string;
}) {
  const [state, formAction] = useActionState<AuthState, FormData>(action, undefined);
  return (
    <form action={formAction} className="space-y-3">
      <input name="nickname" defaultValue={nickname} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="닉네임" />
      <input name="phone" defaultValue={phone} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="연락처" />
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-neutral-700">
        저장
      </SubmitButton>
    </form>
  );
}
