"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  senderType: "USER" | "ADMIN";
  senderName: string;
  content: string;
  createdAt: string;
};

export function SupportChat({ threadId, viewAs }: { threadId: string; viewAs: "USER" | "ADMIN" }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const url = `/api/support/messages?threadId=${encodeURIComponent(threadId)}`;

  async function load() {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      // 폴링 실패는 조용히 무시하고 다음 주기에 재시도
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, content: input.trim() }),
      });
      setInput("");
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((m) => {
          const mine = m.senderType === viewAs;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-indigo-600 text-white" : "bg-neutral-100 text-neutral-800"}`}>
                <p className="whitespace-pre-line">{m.content}</p>
                <p className={`text-[10px] mt-1 ${mine ? "text-indigo-100" : "text-neutral-400"}`}>
                  {m.senderName} · {new Date(m.createdAt).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && <p className="text-sm text-neutral-400 text-center mt-8">문의 내용을 남겨주시면 곧 답변드릴게요.</p>}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-neutral-200 p-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="메시지를 입력하세요"
          className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm min-w-0"
        />
        <button onClick={send} disabled={sending} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50">
          전송
        </button>
      </div>
    </div>
  );
}
