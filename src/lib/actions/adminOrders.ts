"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/adminAuth";
import { logAdminActivity } from "@/lib/actions/adminSecurity";
import { createNotification } from "@/lib/notify";
import { saveUploadedFile } from "@/lib/storage";
import { ORDER_STATUS, NOTIFICATION_TYPES } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; success?: string } | undefined;

export async function updateOrderStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");
  const note = String(formData.get("note") || "").trim();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "주문을 찾을 수 없습니다." };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      statusHistory: { create: { status, note: note || null, byAdmin: true } },
    },
  });

  if (order.userId) {
    const typeMap: Record<string, string> = {
      [ORDER_STATUS.IN_PROGRESS]: NOTIFICATION_TYPES.PRODUCTION_STARTED,
      [ORDER_STATUS.DONE]: NOTIFICATION_TYPES.PRODUCTION_COMPLETED,
    };
    await createNotification({
      userId: order.userId,
      orderId,
      type: typeMap[status] ?? "ORDER_STATUS_CHANGED",
      title: "주문 상태가 변경되었습니다",
      message: `#${order.orderNo} 주문 상태가 "${status}"(으)로 변경되었습니다.`,
    });
  }

  await logAdminActivity(admin.id, "ORDER_STATUS_CHANGE", order.orderNo, status);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/order/track/${order.orderNo}`);
  return { success: "상태가 변경되었습니다." };
}

export async function updateOrderMetaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") || "");
  const progress = Number(formData.get("progress") || 0);
  const dueDateRaw = String(formData.get("dueDate") || "");
  const internalMemo = String(formData.get("internalMemo") || "");
  const assignedAdminId = String(formData.get("assignedAdminId") || "");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "주문을 찾을 수 없습니다." };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      progress: Math.min(100, Math.max(0, progress)),
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      internalMemo: internalMemo || null,
      assignedAdminId: assignedAdminId || null,
    },
  });

  await logAdminActivity(admin.id, "ORDER_META_UPDATE", order.orderNo);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/order/track/${order.orderNo}`);
  return { success: "저장되었습니다." };
}

export async function createOrUpdateQuoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") || "");
  const amount = Number(formData.get("amount") || 0);
  const estimatedDays = Number(formData.get("estimatedDays") || 0);
  const includedFeaturesRaw = String(formData.get("includedFeatures") || "");
  const memo = String(formData.get("memo") || "");

  if (!amount || amount <= 0) return { error: "금액을 입력해주세요." };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "주문을 찾을 수 없습니다." };

  const includedFeatures = includedFeaturesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.quote.upsert({
    where: { orderId },
    update: { amount, estimatedDays, includedFeatures: JSON.stringify(includedFeatures), memo, status: "SENT", sentAt: new Date() },
    create: {
      orderId,
      amount,
      estimatedDays,
      includedFeatures: JSON.stringify(includedFeatures),
      memo,
      status: "SENT",
      sentAt: new Date(),
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: ORDER_STATUS.QUOTE_CHECK,
      statusHistory: { create: { status: ORDER_STATUS.QUOTE_CHECK, note: "견적이 발송되었습니다.", byAdmin: true } },
    },
  });

  if (order.userId) {
    await createNotification({
      userId: order.userId,
      orderId,
      type: NOTIFICATION_TYPES.QUOTE_ARRIVED,
      title: "견적이 도착했습니다",
      message: `#${order.orderNo} 견적이 도착했습니다. 확인 후 승인해주세요.`,
    });
  }

  await logAdminActivity(admin.id, "QUOTE_SENT", order.orderNo, `${amount}원`);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/order/track/${order.orderNo}`);
  return { success: "견적이 발송되었습니다." };
}

export async function confirmPaymentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") || "");

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || !order.payment) return { error: "결제 정보를 찾을 수 없습니다." };

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: "CONFIRMED", confirmedAt: new Date(), confirmedBy: admin.name },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUS.IN_PROGRESS,
        statusHistory: { create: { status: ORDER_STATUS.IN_PROGRESS, note: "입금이 확인되어 제작을 시작합니다.", byAdmin: true } },
      },
    }),
  ]);

  if (order.userId) {
    await createNotification({
      userId: order.userId,
      orderId,
      type: NOTIFICATION_TYPES.PRODUCTION_STARTED,
      title: "입금 확인 및 제작 시작",
      message: `#${order.orderNo} 입금이 확인되어 제작이 시작되었습니다.`,
    });
  }

  await logAdminActivity(admin.id, "PAYMENT_CONFIRMED", order.orderNo);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/order/track/${order.orderNo}`);
  return { success: "입금이 확인되었습니다." };
}

export async function uploadDeliverableAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") || "");
  const versionLabel = String(formData.get("versionLabel") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) return { error: "파일을 선택해주세요." };
  if (!versionLabel) return { error: "버전 라벨을 입력해주세요 (예: v1.0)." };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "주문을 찾을 수 없습니다." };

  const saved = await saveUploadedFile(file, "deliverables");
  await prisma.deliverable.create({
    data: {
      orderId,
      versionLabel,
      fileKey: saved.key,
      fileName: saved.name,
      size: saved.size,
      note: note || null,
      uploadedBy: admin.name,
    },
  });

  await logAdminActivity(admin.id, "DELIVERABLE_UPLOAD", order.orderNo, versionLabel);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/order/track/${order.orderNo}`);
  return { success: "산출물이 업로드되었습니다." };
}

export async function toggleDeliverableVisibilityAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const deliverable = await prisma.deliverable.findUnique({ where: { id } });
  if (!deliverable) return;
  await prisma.deliverable.update({ where: { id }, data: { visible: !deliverable.visible } });
  await logAdminActivity(admin.id, "DELIVERABLE_VISIBILITY_TOGGLE", id);
  revalidatePath(`/admin/orders/${deliverable.orderId}`);
}

export async function updateRevisionStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const adminNote = String(formData.get("adminNote") || "");

  const revision = await prisma.revisionRequest.findUnique({ where: { id }, include: { order: true } });
  if (!revision) return;

  await prisma.revisionRequest.update({
    where: { id },
    data: { status, adminNote: adminNote || null, resolvedAt: status === "완료" ? new Date() : null },
  });

  if (status === "완료" && revision.order.userId) {
    await createNotification({
      userId: revision.order.userId,
      orderId: revision.orderId,
      type: NOTIFICATION_TYPES.REVISION_COMPLETED,
      title: "수정 요청이 완료되었습니다",
      message: `#${revision.order.orderNo} "${revision.title}" 수정이 완료되었습니다.`,
    });
  }

  await logAdminActivity(admin.id, "REVISION_STATUS_CHANGE", revision.order.orderNo, status);
  revalidatePath(`/admin/orders/${revision.orderId}`);
}

export async function sendAdminMessageAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") || "");
  const content = String(formData.get("content") || "").trim();
  const pinned = formData.get("pinned") === "on";
  if (!content) return;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await prisma.message.create({
    data: { orderId, senderType: "ADMIN", adminId: admin.id, content, pinned, readByAdmin: true, readByUser: false },
  });
  await prisma.message.updateMany({ where: { orderId, senderType: "USER" }, data: { readByAdmin: true } });

  if (order.userId) {
    await createNotification({
      userId: order.userId,
      orderId,
      type: NOTIFICATION_TYPES.ADMIN_MESSAGE,
      title: "새 메시지가 도착했습니다",
      message: `#${order.orderNo} 담당자로부터 새 메시지가 도착했습니다.`,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/order/track/${order.orderNo}`);
}
