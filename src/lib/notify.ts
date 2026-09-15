import { prisma } from "@/lib/prisma";

export async function createNotification(params: {
  userId?: string | null;
  orderId?: string | null;
  type: string;
  title: string;
  message: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId ?? null,
      orderId: params.orderId ?? null,
      type: params.type,
      title: params.title,
      message: params.message,
    },
  });
}
