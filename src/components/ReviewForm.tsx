"use client";

import { useActionState, useState } from "react";
import { createReviewAction, type RevisionState } from "@/lib/actions/orders";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export function ReviewForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState<RevisionState, FormData>(createReviewAction, undefined);
  const [rating, setRating] = useState(5);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-amber-400" : "text-neutral-200"}`}>
            ★
          </button>
        ))}
      </div>
      <textarea name="content" required rows={3} placeholder="솔직한 후기를 남겨주세요" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700">
        리뷰 등록
      </SubmitButton>
    </form>
  );
}
