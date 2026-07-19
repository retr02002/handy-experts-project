"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { ClientIcon } from "@/components/ui/ClientIcon";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatBot() {
  const { isOpen, toggleChat, closeChat } = useChat();
  const pathname = usePathname();
  const isCustomerDashboard = pathname?.startsWith("/customer");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your Handy Experts assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I'm having trouble connecting right now." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {/* On public pages: hidden on mobile, flex on desktop. On customer dashboard: flex on mobile (when closed) and desktop. */}
      <button
        onClick={toggleChat}
        className={`${
          isCustomerDashboard ? (isOpen ? "hidden lg:flex" : "flex") : "hidden lg:flex"
        } fixed bottom-[84px] lg:bottom-6 right-4 lg:right-6 z-[100] items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 dark:border-slate-700/50 ${
          isOpen 
            ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" 
            : "bg-gradient-to-tr from-[#00B4FF] to-[#0096d6] text-white"
        }`}
      >
        <ClientIcon icon={isOpen ? "ph:x-bold" : "ph:chat-teardrop-text-fill"} className="w-6 h-6 lg:w-7 lg:h-7" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-[10%] lg:top-auto lg:inset-auto lg:bottom-24 lg:right-6 lg:left-auto lg:w-[360px] lg:h-[550px] lg:max-h-[80vh] z-[120] flex flex-col bg-white dark:bg-[#0B1120] rounded-t-3xl lg:rounded-2xl shadow-2xl overflow-hidden border-t lg:border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-[#00B4FF] dark:bg-[#0096d6] text-white shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                  <ClientIcon icon="ph:robot-fill" className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-semibold text-sm leading-tight truncate">Handy Assistant</h3>
                  <p className="text-[11px] text-white/90 truncate">Online & ready to help</p>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors shrink-0"
              >
                <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 dark:bg-[#020617]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex max-w-[85%] ${
                    msg.role === "user" ? "self-end justify-end" : "self-start justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-[1.2rem] text-[13.5px] shadow-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#00B4FF] text-white rounded-br-sm"
                        : "bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex self-start max-w-[85%]">
                  <div className="px-4 py-3 bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 shadow-sm rounded-[1.2rem] rounded-bl-sm flex gap-1.5 items-center">
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-500 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-500 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-500 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-[#0B1120] border-t border-slate-100 dark:border-slate-800 shrink-0 pb-safe">
              <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder="Message..."
                  className="flex-1 max-h-24 min-h-[44px] bg-slate-100 dark:bg-[#0F172A] border border-transparent focus:border-[#00B4FF]/30 rounded-[1.2rem] px-4 py-3 text-[13.5px] focus:outline-none focus:bg-white dark:focus:bg-[#0F172A] text-slate-900 dark:text-white resize-none custom-scrollbar transition-all"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-[44px] h-[44px] shrink-0 rounded-full bg-[#00B4FF] hover:bg-[#0096d6] text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 shadow-md"
                >
                  <ClientIcon icon="ph:paper-plane-right-fill" className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
