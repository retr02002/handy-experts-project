"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { usePolling } from "@/hooks/usePolling";
import {
  getMessagesAction,
  sendMessageAction,
  markMessagesReadAction,
  type ChatMessageItem,
} from "@/actions/chat.actions";

const MESSAGES_POLL_INTERVAL_MS = 6000;

/**
 * Job-scoped conversation between the customer and their technician.
 * Poll-driven like everything else in this stack — there's no socket layer
 * here, so new messages land within a few seconds rather than instantly.
 */
export function ChatThread({
  serviceCallId,
  counterpartName,
  heightClass = "h-72",
  hideHeader = false,
  bare = false,
}: {
  serviceCallId: string;
  counterpartName: string;
  heightClass?: string;
  /** The host already shows who you're talking to (e.g. a modal header). */
  hideHeader?: boolean;
  /** Drops the card border/background so it can fill a modal edge to edge. */
  bare?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const load = useCallback(async () => {
    const res = await getMessagesAction(serviceCallId);
    if (res.success && res.data) {
      setMessages(res.data);
      if (res.data.some((m) => !m.isMine)) markMessagesReadAction(serviceCallId);
    }
    setLoaded(true);
  }, [serviceCallId]);

  usePolling(load, MESSAGES_POLL_INTERVAL_MS, [serviceCallId]);

  // Stick to the bottom only when something new actually arrived, so
  // scrolling back through history isn't yanked away on every poll.
  useEffect(() => {
    if (messages.length !== lastCountRef.current) {
      lastCountRef.current = messages.length;
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setIsSending(true);
    try {
      const res = await sendMessageAction(serviceCallId, body);
      if (!res.success) {
        toast.error(res.error || "Couldn't send that");
        return;
      }
      setDraft("");
      await load();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={
        bare
          ? "flex flex-col flex-1 min-h-0"
          : "flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0F172A]"
      }
    >
      {!hideHeader && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <ClientIcon icon="ph:chats-circle-fill" className="w-4 h-4 text-[#00B4FF]" />
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Chat with {counterpartName}</p>
        </div>
      )}

      <div ref={scrollRef} className={`${heightClass} overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2`}>
        {!loaded ? (
          <p className="text-xs text-slate-400 text-center my-auto">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center my-auto">No messages yet — say hello.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                  m.isMine
                    ? "bg-[#00B4FF] text-white rounded-br-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                }`}
              >
                <p className="text-sm break-words whitespace-pre-wrap">{m.body}</p>
                <p className={`text-[10px] mt-0.5 ${m.isMine ? "text-white/70" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={send} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          maxLength={1000}
          className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40"
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          className="shrink-0 w-10 h-10 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <ClientIcon icon="ph:paper-plane-right-fill" className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
