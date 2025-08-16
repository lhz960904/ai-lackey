'use client';

import { ClockFading } from "lucide-react";
import { ChatInput } from "./chat-input";
import { Button } from "./ui/button";
import { ChatMessages } from "./chat-messages";
import { useState, useRef } from "react";


export interface Message {
  role: 'user' | 'assistant' | 'tool';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
}

export function ChatContainer() {

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'user',
      content: '你好'
    },
    {
      role: 'assistant',
      content: '你好！😊 很高兴见到你～有什么我可以帮你的吗？'
    },
    {
      role: 'tool',
      content: {
        args: { location: 'sdsd' },
        name: 'get_weather1',
        id: 'call_1_9be8c634-2f6b-48b1-8291-90c65f819519',
        type: 'tool_call',
        return: { a: 1 }
      }
    },
    {
      role: 'tool',
      content: {
        name: 'get_weather2',
        args: {},
        id: 'call_1_9be8c634-2f6b-48b1-8291-90c65f819519',
        type: 'tool_call',
        return: { a: 1 }
      }
    }
  ]);
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

  const sendMessage = async (input?: string) => {
    if (!input?.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
        signal: abortControllerRef.current.signal,
      });

      setIsLoading(false)

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      readerRef.current = reader;
      setIsStreaming(true)

      let assistantMessage = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false)
              return;
            }

            try {
              const parsed = JSON.parse(data);
              console.log('parsed', parsed)
              if (parsed.type === 'message') {
                assistantMessage += parsed.data;
                setMessages(prev => {
                  const newMessages = [...prev];
                  if (newMessages[newMessages.length - 1].role === 'assistant') {
                    newMessages[newMessages.length - 1].content = assistantMessage;
                  } else {
                    newMessages.push({
                      role: 'assistant',
                      content: assistantMessage
                    })
                  }
                  return newMessages;
                });
              } else if (parsed.type === 'tool') {
                setMessages(prev => {
                  const newMessages = [...prev];
                  const matchIndex = newMessages.findLastIndex(item => item.content.id === parsed.data.id)
                  if (matchIndex > -1) {
                    newMessages[matchIndex].content = parsed.data;
                  } else {
                    newMessages.push({
                      role: 'tool',
                      content: parsed.data
                    })
                  }
                  return newMessages
                });
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，发生了错误。请稍后再试。' }]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
      readerRef.current = null;
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (readerRef.current) {
      readerRef.current.cancel();
    }

    setIsLoading(false);
    setIsStreaming(false);
  }

  return (
    <div className='border rounded-sm h-full bg-white relative'>
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
        <ChatInput loading={isLoading} streaming={isStreaming} onSubmit={sendMessage} onStop={handleStop} />
      </div>
    </div>
  )
}

