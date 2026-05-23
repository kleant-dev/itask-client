"use client";

import { GlobalChatListener } from "@/components/messages/global-chat-listener";

export function ChatLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalChatListener />
      {children}
    </>
  );
}
