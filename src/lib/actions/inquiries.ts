"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/actions/auth";
import { saveUploadedFile } from "@/lib/storage";
import { redirect } from "next/navigation";

export type ActionState = { error?: string } | undefined;

export async function createInquiryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const file = formData.get("file");

  if (!title || !content) return { error: "제목과 내용을 입력해주세요." };

  let attachment: string | null = null;
  if (file instanceof File && file.size > 0) {
    const saved = await saveUploadedFile(file, "attachments");
    attachment = saved.key;
  }

  const inquiry = await prisma.inquiry.create({
    data: { userId: user.id, title, content, attachment },
  });

  redirect(`/mypage/inquiries/${inquiry.id}`);
}
