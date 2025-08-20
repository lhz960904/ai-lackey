'use client';

import { ClockFading } from "lucide-react";
import { ChatInput } from "./chat-input";
import { Button } from "./ui/button";
import { ChatMessages } from "./chat-messages";
import { useChat } from "@/hooks/use-chat";

export function ChatContainer() {
  const { messages, isLoading, isStreaming, sendMessage, stop } = useChat();

  return (
    <div className='border rounded-sm h-full bg-white dark:bg-[#171717] relative'>
      <div className="border-b py-2 px-1 flex justify-between items-center">
        <span></span>
        <Button variant="ghost" size="sm">
          <ClockFading size={18} />
        </Button>
      </div>
      <div className="p-3 h-[calc(100%-200px)] overflow-y-auto">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>
      <div className="p-3 absolute w-full bottom-0">
        <ChatInput loading={isLoading} streaming={isStreaming} onSubmit={sendMessage} onStop={stop} />
      </div>
    </div>
  )
}

