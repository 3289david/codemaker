"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "",
  pendingText = "처리 중...",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
