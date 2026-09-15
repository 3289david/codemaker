"use client";

import { useState } from "react";
import { SupportChat } from "./SupportChat";

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function openChat() {
    setOpen(true);
    if (threadId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/support/thread", { method: "POST" });
      const data = await res.json();
      if (data.threadId) setThreadId(data.threadId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-80 sm:w-96 h-[28rem] bg-white border border-neutral-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-neutral-900 text-white px-4 py-3 shrink-0">
            <span className="text-sm font-semibold">💬 실시간 상담</span>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-sm">
              닫기
            </button>
          </div>
          <div className="flex-1 min-h-0">
            {loading || !threadId ? (
              <div className="p-6 text-sm text-neutral-400 text-center">연결 중...</div>
            ) : (
              <SupportChat threadId={threadId} viewAs="USER" />
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={openChat}
          className="bg-indigo-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl hover:bg-indigo-700"
          aria-label="실시간 상담 열기"
        >
          💬
        </button>
      )}
    </div>
  );
}
