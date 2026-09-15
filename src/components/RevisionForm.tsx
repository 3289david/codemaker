"use client";

import { useActionState } from "react";
import { createRevisionRequestAction, type RevisionState } from "@/lib/actions/orders";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export function RevisionForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState<RevisionState, FormData>(createRevisionRequestAction, undefined);

  return (
    <form action={formAction} className="space-y-2 border-t border-neutral-100 pt-4" encType="multipart/form-data">
      <input type="hidden" name="orderId" value={orderId} />
      <input name="title" required placeholder="수정 요청 제목" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <textarea name="description" required rows={3} placeholder="변경하고 싶은 내용을 자세히 적어주세요" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <input type="file" name="files" multiple className="w-full text-sm" />
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-neutral-700">
        수정 요청 제출
      </SubmitButton>
    </form>
  );
}
