"use client";

import { useEffect, useState } from "react";
import { SupportChat } from "@/components/SupportChat";

type ThreadRow = {
  id: string;
  label: string;
  status: string;
  unreadByAdmin: boolean;
  lastMessageAt: string;
  preview: string;
};

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/support/threads", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setThreads(data.threads ?? []);
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  async function closeThread(id: string) {
    await fetch(`/api/support/threads/${id}/close`, { method: "POST" });
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">1:1 상담 채팅</h1>
      <div className="grid md:grid-cols-[280px_1fr] gap-4 h-[36rem]">
        <div className="border border-neutral-200 rounded-xl bg-white overflow-y-auto">
          {threads.length === 0 && <p className="text-sm text-neutral-400 p-4 text-center">아직 상담 요청이 없습니다.</p>}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 ${activeId === t.id ? "bg-indigo-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{t.label}</span>
                {t.unreadByAdmin && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
              </div>
              <p className="text-xs text-neutral-400 truncate mt-0.5">{t.preview}</p>
              <p className="text-[10px] text-neutral-400 mt-1">
                {t.status === "CLOSED" ? "종료됨" : "진행중"} · {new Date(t.lastMessageAt).toLocaleString("ko-KR")}
              </p>
            </button>
          ))}
        </div>
        <div className="border border-neutral-200 rounded-xl bg-white flex flex-col overflow-hidden">
          {activeId ? (
            <>
              <div className="flex items-center justify-end px-4 py-2 border-b border-neutral-100">
                <button onClick={() => closeThread(activeId)} className="text-xs text-neutral-400 hover:text-red-600">
                  상담 종료
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <SupportChat threadId={activeId} viewAs="ADMIN" />
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-400 text-center m-auto">왼쪽에서 상담 스레드를 선택하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
}
