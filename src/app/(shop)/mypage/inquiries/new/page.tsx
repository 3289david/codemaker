"use client";

import { useActionState } from "react";
import { createInquiryAction } from "@/lib/actions/inquiries";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export default function NewInquiryPage() {
  const [state, formAction] = useActionState(createInquiryAction, undefined);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">1:1 문의 작성</h1>
      <form action={formAction} className="space-y-3" encType="multipart/form-data">
        <input name="title" required placeholder="제목" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <textarea name="content" required rows={6} placeholder="문의 내용을 입력해주세요" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
        <input type="file" name="file" className="w-full text-sm" />
        <FormMessage error={state?.error} />
        <SubmitButton className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700">
          제출하기
        </SubmitButton>
      </form>
    </div>
  );
}
