'use client';

import { ClockFading } from "lucide-react";
import { ChatInput } from "./chat-input";
import { Button } from "./ui/button";
import { ChatMessages } from "./chat-messages";
import { useChat } from '@ai-sdk/react';

export function ChatContainer() {
  const { status, messages, sendMessage, stop } = useChat();

  return (
    <div className='border rounded-sm h-full bg-white dark:bg-[#171717] relative'>
      <div className="border-b py-2 px-1 flex justify-between items-center">
        <span></span>
        <Button variant="ghost" size="sm">
          <ClockFading size={18} />
        </Button>
      </div>
      <div className="p-3 h-[calc(100%-200px)] overflow-y-auto">
        <ChatMessages messages={messages} isLoading={status === 'submitted'} />
      </div>
      <div className="p-3 absolute w-full bottom-0">
        <ChatInput loading={status === 'submitted'} streaming={status === 'streaming'} onSubmit={(input) => sendMessage({ text: input || '' })} onStop={stop} />
      </div>
    </div>
  )
}

