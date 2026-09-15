"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { usePolling } from "@/hooks/usePolling";
import {
  getTicketMessagesAction,
  sendTicketMessageAction,
  type TicketMessageItem,
} from "@/actions/supportticket.actions";

// Tickets aren't job-chat-latency-sensitive — a slower poll than ChatThread's.
const MESSAGES_POLL_INTERVAL_MS = 10000;

/**
 * A support ticket's conversation — structurally a close mirror of
 * ChatThread (same polling idiom, same bubble layout), not shared code with
 * it, since a ticket has no ServiceCall to scope to and the two sides here
 * are "the vendor" and "support" rather than customer/technician.
 */
export function SupportTicketThread({
  ticketId,
  disabled = false,
}: {
  ticketId: string;
  /** True once the ticket is resolved/closed — no more replies accepted. */
  disabled?: boolean;
}) {
  const [messages, setMessages] = useState<TicketMessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const load = useCallback(async () => {
    const res = await getTicketMessagesAction(ticketId);
    if (res.success && res.data) setMessages(res.data);
    setLoaded(true);
  }, [ticketId]);

  usePolling(load, MESSAGES_POLL_INTERVAL_MS, [ticketId]);

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
      const res = await sendTicketMessageAction(ticketId, body);
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
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0F172A]">
      <div ref={scrollRef} className="h-80 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
        {!loaded ? (
          <p className="text-xs text-slate-400 text-center my-auto">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center my-auto">No messages yet.</p>
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
                {!m.isMine && (
                  <p className={`text-[10px] font-bold mb-0.5 ${m.senderIsAdmin ? "text-emerald-500" : "text-slate-400"}`}>
                    {m.senderIsAdmin ? "Support" : m.senderName}
                  </p>
                )}
                <p className="text-sm break-words whitespace-pre-wrap">{m.body}</p>
                <p className={`text-[10px] mt-0.5 ${m.isMine ? "text-white/70" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {disabled ? (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400">
          <ClientIcon icon="ph:lock-simple-fill" className="w-3.5 h-3.5" />
          This ticket is closed.
        </div>
      ) : (
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
      )}
    </div>
  );
}
