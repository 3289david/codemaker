"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/adminAuth";
import { logAdminActivity } from "@/lib/actions/adminSecurity";
import { createNotification } from "@/lib/notify";
import { NOTIFICATION_TYPES } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; success?: string } | undefined;

function slugify(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/(^-|-$)/g, "") || `svc-${Date.now()}`
  );
}

// ── 서비스 ───────────────────────────────────────────────────

export async function upsertServiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "");
  const summary = String(formData.get("summary") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const capabilitiesRaw = String(formData.get("capabilities") || "");
  const priceMin = Number(formData.get("priceMin") || 0);
  const priceMax = Number(formData.get("priceMax") || 0);
  const durationMin = Number(formData.get("durationMin") || 0);
  const durationMax = Number(formData.get("durationMax") || 0);
  const icon = String(formData.get("icon") || "").trim();
  const active = formData.get("active") === "on";

  if (!name || !category) return { error: "이름과 카테고리는 필수입니다." };

  const capabilities = JSON.stringify(
    capabilitiesRaw.split("\n").map((s) => s.trim()).filter(Boolean)
  );

  const data = {
    name,
    category,
    summary,
    description,
    capabilities,
    priceMin,
    priceMax,
    durationMin,
    durationMax,
    icon: icon || null,
    active,
  };

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({ data: { ...data, slug: slugify(name) } });
  }

  await logAdminActivity(admin.id, "SERVICE_SAVE", name);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: "저장되었습니다." };
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.service.delete({ where: { id } }).catch(() => {});
  await logAdminActivity(admin.id, "SERVICE_DELETE", id);
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

// ── 가격 규칙 ────────────────────────────────────────────────

export async function upsertPricingRuleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const key = String(formData.get("key") || "").trim().toUpperCase();
  const label = String(formData.get("label") || "").trim();
  const price = Number(formData.get("price") || 0);
  const days = Number(formData.get("days") || 0);
  const active = formData.get("active") === "on";

  if (!key || !label) return { error: "키와 라벨은 필수입니다." };

  await prisma.pricingRule.upsert({
    where: { key },
    update: { label, price, days, active },
    create: { key, label, price, days, active },
  });

  await logAdminActivity(admin.id, "PRICING_RULE_SAVE", key);
  revalidatePath("/admin/services");
  revalidatePath("/calculator");
  return { success: "저장되었습니다." };
}

export async function upsertProjectTypeRuleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const key = String(formData.get("key") || "").trim().toUpperCase();
  const label = String(formData.get("label") || "").trim();
  const basePrice = Number(formData.get("basePrice") || 0);
  const baseDays = Number(formData.get("baseDays") || 0);
  if (!key || !label) return { error: "키와 라벨은 필수입니다." };

  await prisma.projectTypeRule.upsert({
    where: { key },
    update: { label, basePrice, baseDays },
    create: { key, label, basePrice, baseDays },
  });

  await logAdminActivity(admin.id, "PROJECT_TYPE_RULE_SAVE", key);
  revalidatePath("/admin/services");
  revalidatePath("/calculator");
  return { success: "저장되었습니다." };
}

// ── 포트폴리오 ───────────────────────────────────────────────

export async function upsertPortfolioAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const techStackRaw = String(formData.get("techStack") || "");
  const featuresRaw = String(formData.get("features") || "");
  const duration = String(formData.get("duration") || "").trim();
  const priceBand = String(formData.get("priceBand") || "").trim();
  const liveUrl = String(formData.get("liveUrl") || "").trim();
  const githubUrl = String(formData.get("githubUrl") || "").trim();
  const active = formData.get("active") === "on";

  if (!title) return { error: "제목은 필수입니다." };

  const data = {
    title,
    category,
    description,
    images: JSON.stringify([]),
    techStack: JSON.stringify(techStackRaw.split(",").map((s) => s.trim()).filter(Boolean)),
    features: JSON.stringify(featuresRaw.split("\n").map((s) => s.trim()).filter(Boolean)),
    duration,
    priceBand,
    liveUrl: liveUrl || null,
    githubUrl: githubUrl || null,
    active,
  };

  if (id) {
    await prisma.portfolio.update({ where: { id }, data });
  } else {
    await prisma.portfolio.create({ data });
  }

  await logAdminActivity(admin.id, "PORTFOLIO_SAVE", title);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  return { success: "저장되었습니다." };
}

export async function deletePortfolioAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.portfolio.delete({ where: { id } }).catch(() => {});
  await logAdminActivity(admin.id, "PORTFOLIO_DELETE", id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

// ── 리뷰 ─────────────────────────────────────────────────────

export async function setReviewStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  await prisma.review.update({ where: { id }, data: { status } });
  await logAdminActivity(admin.id, "REVIEW_STATUS", id, status);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function replyReviewAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const adminReply = String(formData.get("adminReply") || "").trim();
  await prisma.review.update({ where: { id }, data: { adminReply, repliedAt: new Date() } });
  await logAdminActivity(admin.id, "REVIEW_REPLY", id);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  return { success: "답글이 등록되었습니다." };
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.review.delete({ where: { id } }).catch(() => {});
  await logAdminActivity(admin.id, "REVIEW_DELETE", id);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

// ── 공지사항 ─────────────────────────────────────────────────

export async function upsertNoticeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const category = String(formData.get("category") || "SERVICE");
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const pinned = formData.get("pinned") === "on";
  if (!title || !content) return { error: "제목과 내용은 필수입니다." };

  if (id) {
    await prisma.notice.update({ where: { id }, data: { category, title, content, pinned } });
  } else {
    await prisma.notice.create({ data: { category, title, content, pinned } });
  }

  await logAdminActivity(admin.id, "NOTICE_SAVE", title);
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  return { success: "저장되었습니다." };
}

export async function deleteNoticeAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.notice.delete({ where: { id } }).catch(() => {});
  await logAdminActivity(admin.id, "NOTICE_DELETE", id);
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
}

// ── FAQ ──────────────────────────────────────────────────────

export async function upsertFaqAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const category = String(formData.get("category") || "일반");
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0);
  if (!question || !answer) return { error: "질문과 답변은 필수입니다." };

  if (id) {
    await prisma.faq.update({ where: { id }, data: { category, question, answer, sortOrder } });
  } else {
    await prisma.faq.create({ data: { category, question, answer, sortOrder } });
  }

  await logAdminActivity(admin.id, "FAQ_SAVE", question);
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  return { success: "저장되었습니다." };
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.faq.delete({ where: { id } }).catch(() => {});
  await logAdminActivity(admin.id, "FAQ_DELETE", id);
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

// ── 문의 ─────────────────────────────────────────────────────

export async function answerInquiryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const answer = String(formData.get("answer") || "").trim();
  if (!answer) return { error: "답변 내용을 입력해주세요." };

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: { answer, status: "ANSWERED", answeredByAdminId: admin.id, answeredAt: new Date() },
  });

  await createNotification({
    userId: inquiry.userId,
    type: NOTIFICATION_TYPES.INQUIRY_ANSWERED,
    title: "문의에 답변이 등록되었습니다",
    message: `"${inquiry.title}" 문의에 답변이 등록되었습니다.`,
  });

  await logAdminActivity(admin.id, "INQUIRY_ANSWER", id);
  revalidatePath("/admin/inquiries");
  revalidatePath(`/mypage/inquiries/${id}`);
  return { success: "답변이 등록되었습니다." };
}

// ── 회원 관리 ────────────────────────────────────────────────

export async function setMemberStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const status = String(formData.get("status") || "");
  const suspendedReason = String(formData.get("suspendedReason") || "");
  await prisma.user.update({ where: { id: userId }, data: { status, suspendedReason: suspendedReason || null } });
  await logAdminActivity(admin.id, "MEMBER_STATUS", userId, status);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${userId}`);
}

// ── 설정 ─────────────────────────────────────────────────────

export async function updateSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const companyName = String(formData.get("companyName") || "").trim();
  const bankName = String(formData.get("bankName") || "").trim();
  const bankAccountNumber = String(formData.get("bankAccountNumber") || "").trim();
  const bankAccountHolder = String(formData.get("bankAccountHolder") || "").trim();
  const noticeMessage = String(formData.get("noticeMessage") || "").trim();

  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: { companyName, bankName, bankAccountNumber, bankAccountHolder, noticeMessage },
    create: { id: "singleton", companyName, bankName, bankAccountNumber, bankAccountHolder, noticeMessage },
  });

  await logAdminActivity(admin.id, "SETTINGS_UPDATE");
  revalidatePath("/admin/settings");
  return { success: "설정이 저장되었습니다." };
}
