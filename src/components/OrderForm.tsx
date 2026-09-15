"use client";

import { useActionState } from "react";
import { createOrderAction, type OrderFormState } from "@/lib/actions/orders";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export function OrderForm({
  projectTypes,
  defaultType,
  isLoggedIn,
  defaultEmail,
}: {
  projectTypes: { key: string; label: string }[];
  defaultType?: string;
  isLoggedIn: boolean;
  defaultEmail?: string;
}) {
  const [state, formAction] = useActionState<OrderFormState, FormData>(createOrderAction, undefined);

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <div>
        <label className="text-sm font-medium">제목 *</label>
        <input name="title" required className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="예: 쇼핑몰 웹사이트 제작 요청" />
      </div>

      <div>
        <label className="text-sm font-medium">제작 유형 *</label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {projectTypes.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-sm border border-neutral-300 rounded-md px-3 py-2 cursor-pointer has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
              <input type="radio" name="projectType" value={t.key} defaultChecked={defaultType === t.key || (!defaultType && t.key === projectTypes[0]?.key)} required className="accent-indigo-600" />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">상세 설명 *</label>
        <textarea name="description" required rows={6} className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="원하시는 기능, 화면 구성, 참고할 만한 사이트 등을 자유롭게 적어주세요." />
      </div>

      <div>
        <label className="text-sm font-medium">참고 사이트 URL (줄바꿈으로 구분)</label>
        <textarea name="referenceUrls" rows={2} className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="https://example.com" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">참고 디자인 이미지</label>
          <input type="file" name="referenceImages" multiple accept="image/*" className="mt-1 w-full text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">첨부 파일</label>
          <input type="file" name="attachments" multiple className="mt-1 w-full text-sm" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">희망 납기</label>
          <input name="desiredTimeline" className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="예: 4주 이내" />
        </div>
        <div>
          <label className="text-sm font-medium">예산</label>
          <input name="budget" className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="예: 200만원 내외" />
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <p className="font-medium mb-3">연락처 정보</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="contactEmail" type="email" required defaultValue={defaultEmail} placeholder="이메일 *" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="contactPhone" placeholder="전화번호" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <input name="contactDiscord" placeholder="Discord ID" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          {!isLoggedIn && <input name="guestName" placeholder="이름 (비회원)" className="border border-neutral-300 rounded-md px-3 py-2 text-sm" />}
        </div>
        {!isLoggedIn && (
          <div className="mt-3">
            <label className="text-sm font-medium">조회용 PIN (4~6자리 숫자) *</label>
            <input name="pin" required minLength={4} maxLength={6} inputMode="numeric" className="mt-1 w-full sm:w-48 border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="1234" />
            <p className="text-xs text-neutral-400 mt-1">회원가입 없이 주문번호 + PIN으로 진행 상황을 확인할 수 있습니다.</p>
          </div>
        )}
      </div>

      <FormMessage error={state?.error} />

      <SubmitButton className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700">
        주문 신청 제출하기
      </SubmitButton>
    </form>
  );
}
