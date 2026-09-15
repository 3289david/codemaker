"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { generateOrderNo } from "@/lib/orderNo";
import { hashPin, verifyPin } from "@/lib/password";
import { calculateEstimate } from "@/lib/pricing";
import { notifyDiscordNewOrder } from "@/lib/discordNotify";
import { createNotification } from "@/lib/notify";
import { saveUploadedFile } from "@/lib/storage";
import { getSettings } from "@/lib/settings";
import { ORDER_STATUS, NOTIFICATION_TYPES } from "@/lib/constants";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type OrderFormState = { error?: string; orderNo?: string; pin?: string } | undefined;

async function saveFilesField(formData: FormData, field: string, kind: "references" | "attachments") {
  const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  const saved = [];
  for (const f of files.slice(0, 10)) {
    const r = await saveUploadedFile(f, kind);
    saved.push(r);
  }
  return saved;
}

export async function createOrderAction(_prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const user = await getCurrentUser();

  const title = String(formData.get("title") || "").trim();
  const projectType = String(formData.get("projectType") || "WEBSITE");
  const description = String(formData.get("description") || "").trim();
  const features = formData.getAll("features").map(String);
  const referenceUrlsRaw = String(formData.get("referenceUrls") || "");
  const desiredTimeline = String(formData.get("desiredTimeline") || "").trim();
  const budget = String(formData.get("budget") || "").trim();
  const contactEmail = String(formData.get("contactEmail") || "").trim();
  const contactPhone = String(formData.get("contactPhone") || "").trim();
  const contactDiscord = String(formData.get("contactDiscord") || "").trim();
  const guestName = String(formData.get("guestName") || "").trim();
  const pin = String(formData.get("pin") || "").trim();

  if (!title || !description || !contactEmail) {
    return { error: "제목, 상세 설명, 연락 이메일은 필수입니다." };
  }
  if (!user) {
    const settings = await getSettings();
    if (!settings.allowGuestOrders) {
      return { error: "현재 비회원 주문이 비활성화되어 있습니다. 로그인 후 주문해주세요." };
    }
    if (!pin || pin.length < 4) {
      return { error: "비회원 주문은 4자리 이상의 조회용 PIN을 설정해야 합니다." };
    }
  }

  const referenceUrls = referenceUrlsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const [referenceImages, attachments] = await Promise.all([
    saveFilesField(formData, "referenceImages", "references"),
    saveFilesField(formData, "attachments", "attachments"),
  ]);

  const estimate = await calculateEstimate(projectType, features);
  const orderNo = await generateOrderNo();
  const pinHash = await hashPin(pin || Math.random().toString(36).slice(2, 8));

  const order = await prisma.order.create({
    data: {
      orderNo,
      userId: user?.id,
      guestName: user ? null : guestName || null,
      guestEmail: user ? null : contactEmail,
      guestPhone: user ? null : contactPhone || null,
      guestDiscord: user ? null : contactDiscord || null,
      pinHash,
      title,
      projectType,
      description,
      features: JSON.stringify(features),
      referenceUrls: JSON.stringify(referenceUrls),
      referenceImages: JSON.stringify(referenceImages),
      attachments: JSON.stringify(attachments),
      desiredTimeline: desiredTimeline || null,
      budget: budget || null,
      contactEmail,
      contactPhone: contactPhone || null,
      contactDiscord: contactDiscord || null,
      estimatedPriceMin: estimate.priceMin,
      estimatedPriceMax: estimate.priceMax,
      estimatedDays: estimate.days,
      status: ORDER_STATUS.RECEIVED,
      statusHistory: {
        create: { status: ORDER_STATUS.RECEIVED, note: "고객이 주문을 접수했습니다.", byAdmin: false },
      },
    },
  });

  if (user) {
    await createNotification({
      userId: user.id,
      orderId: order.id,
      type: NOTIFICATION_TYPES.ORDER_RECEIVED,
      title: "주문이 접수되었습니다",
      message: `#${order.orderNo} "${title}" 주문이 정상적으로 접수되었습니다.`,
    });
  }

  await notifyDiscordNewOrder({ orderNo, title, projectType, contactEmail, budget });

  redirect(`/order/confirm?orderNo=${orderNo}${user ? "" : `&pin=${pin}`}`);
}

// ── 공개 조회 (비회원) ──────────────────────────────────────

export async function lookupOrderAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const orderNo = String(formData.get("orderNo") || "").trim().replace(/^#/, "");
  const pin = String(formData.get("pin") || "").trim();
  const order = await prisma.order.findUnique({ where: { orderNo } });
  if (!order) return { error: "주문 번호를 찾을 수 없습니다." };
  const ok = await verifyPin(pin, order.pinHash);
  if (!ok) return { error: "PIN이 올바르지 않습니다." };
  redirect(`/order/track/${order.orderNo}?pin=${pin}`);
}

export async function canAccessOrder(order: { userId: string | null; pinHash: string }, pinFromQuery?: string) {
  const user = await getCurrentUser();
  if (user && order.userId === user.id) return true;
  if (pinFromQuery) return verifyPin(pinFromQuery, order.pinHash);
  return false;
}

// ── 고객: 견적 승인 → 결제대기 ──────────────────────────────

export async function approveQuoteAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") || "");
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { quote: true } });
  if (!order || !order.quote) return;

  await prisma.$transaction([
    prisma.quote.update({ where: { orderId }, data: { status: "APPROVED", approvedAt: new Date() } }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUS.PAYMENT_WAIT,
        statusHistory: { create: { status: ORDER_STATUS.PAYMENT_WAIT, note: "고객이 견적을 승인했습니다.", byAdmin: false } },
      },
    }),
    prisma.payment.upsert({
      where: { orderId },
      update: {},
      create: { orderId, amount: order.quote.amount, status: "PENDING" },
    }),
  ]);

  if (order.userId) {
    await createNotification({
      userId: order.userId,
      orderId,
      type: NOTIFICATION_TYPES.PAYMENT_REQUESTED,
      title: "결제 대기 중",
      message: `#${order.orderNo} 견적이 승인되어 결제 대기 상태가 되었습니다.`,
    });
  }
  revalidatePath(`/order/track/${order.orderNo}`);
  revalidatePath(`/mypage/orders/${order.id}`);
}

// ── 고객: 입금 완료 알림 ────────────────────────────────────

export async function notifyPaymentSentAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") || "");
  const depositorName = String(formData.get("depositorName") || "").trim();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await prisma.payment.update({
    where: { orderId },
    data: { status: "NOTIFIED", depositorName: depositorName || null, notifiedAt: new Date() },
  });

  revalidatePath(`/order/track/${order.orderNo}`);
  revalidatePath(`/mypage/orders/${order.id}`);
}

// ── 고객: 수정 요청 제출 ────────────────────────────────────

export type RevisionState = { error?: string; success?: string } | undefined;

export async function createRevisionRequestAction(_prev: RevisionState, formData: FormData): Promise<RevisionState> {
  const orderId = String(formData.get("orderId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title || !description) return { error: "제목과 설명을 입력해주세요." };

  const files = await saveFilesField(formData, "files", "attachments");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "주문을 찾을 수 없습니다." };

  await prisma.revisionRequest.create({
    data: { orderId, title, description, files: JSON.stringify(files) },
  });
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: ORDER_STATUS.REVISION,
      statusHistory: { create: { status: ORDER_STATUS.REVISION, note: `수정 요청: ${title}`, byAdmin: false } },
    },
  });

  revalidatePath(`/order/track/${order.orderNo}`);
  revalidatePath(`/mypage/orders/${order.id}`);
  return { success: "수정 요청이 접수되었습니다." };
}

// ── 채팅 메시지 (고객 전송) ─────────────────────────────────

export async function sendUserMessageAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") || "");
  const content = String(formData.get("content") || "").trim();
  if (!content) return;
  const user = await getCurrentUser();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await prisma.message.create({
    data: {
      orderId,
      senderType: "USER",
      userId: user?.id ?? null,
      content,
      readByUser: true,
      readByAdmin: false,
    },
  });
  await prisma.message.updateMany({ where: { orderId, senderType: "ADMIN" }, data: { readByUser: true } });

  revalidatePath(`/order/track/${order.orderNo}`);
  revalidatePath(`/mypage/orders/${order.id}`);
}

export async function markMessagesReadByUserAction(orderId: string): Promise<void> {
  await prisma.message.updateMany({ where: { orderId, senderType: "ADMIN" }, data: { readByUser: true } });
}

// ── 리뷰 작성 ────────────────────────────────────────────────

export async function createReviewAction(_prev: RevisionState, formData: FormData): Promise<RevisionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const orderId = String(formData.get("orderId") || "");
  const rating = Number(formData.get("rating") || 5);
  const content = String(formData.get("content") || "").trim();
  if (!content) return { error: "리뷰 내용을 입력해주세요." };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== user.id) return { error: "본인 주문에만 리뷰를 작성할 수 있습니다." };
  if (order.status !== ORDER_STATUS.DONE) return { error: "완료된 주문에만 리뷰를 작성할 수 있습니다." };

  const existing = await prisma.review.findUnique({ where: { orderId } });
  if (existing) return { error: "이미 리뷰를 작성했습니다." };

  const settings = await getSettings();
  const status = settings.autoApproveReviews ? "APPROVED" : "PENDING";

  await prisma.review.create({
    data: { userId: user.id, orderId, rating: Math.min(5, Math.max(1, rating)), content, status },
  });

  revalidatePath(`/mypage/orders/${orderId}`);
  revalidatePath("/reviews");
  return {
    success: settings.autoApproveReviews
      ? "리뷰가 등록되었습니다."
      : "리뷰가 등록되었습니다. 관리자 승인 후 공개됩니다.",
  };
}
