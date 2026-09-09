"use client";

import React from "react";
import { Modal } from "./Modal";
import { ChatThread } from "./ChatThread";

export function ChatModal({
  serviceCallId,
  counterpartName,
  onClose,
}: {
  serviceCallId: string;
  counterpartName: string;
  onClose: () => void;
}) {
  return (
    <Modal title={`Chat with ${counterpartName}`} onClose={onClose} bodyClassName="p-0">
      <ChatThread
        serviceCallId={serviceCallId}
        counterpartName={counterpartName}
        hideHeader
        bare
        heightClass="flex-1 min-h-[16rem]"
      />
    </Modal>
  );
}
