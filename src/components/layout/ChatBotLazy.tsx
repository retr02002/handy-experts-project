"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only allowed inside a Client Component in Next 16 — this
// thin wrapper exists so the Server Component public layout can still defer
// ChatBot (and the framer-motion it pulls in) into its own chunk, loaded
// only once mounted client-side, without pre-rendering it on the server.
const ChatBot = dynamic(() => import("@/components/ui/ChatBot").then((m) => m.ChatBot), { ssr: false });

export function ChatBotLazy() {
  return <ChatBot />;
}
