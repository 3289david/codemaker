import { requireUser } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/notifications";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">알림</h1>
        <form action={markAllNotificationsReadAction}>
          <button className="text-sm text-neutral-400 hover:text-neutral-700">모두 읽음 처리</button>
        </form>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <form key={n.id} action={markNotificationReadAction}>
            <input type="hidden" name="id" value={n.id} />
            <button type="submit" className={`w-full text-left border rounded-lg p-4 ${n.isRead ? "border-neutral-100 text-neutral-400" : "border-indigo-200 bg-indigo-50/40"}`}>
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-sm mt-1">{n.message}</p>
              <p className="text-xs text-neutral-400 mt-2">{n.createdAt.toLocaleString("ko-KR")}</p>
            </button>
          </form>
        ))}
        {notifications.length === 0 && <p className="text-neutral-400 text-center py-8">알림이 없습니다.</p>}
      </div>
    </div>
  );
}
