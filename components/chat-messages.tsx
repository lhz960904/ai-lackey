'use client'

import { useEffect, useRef, useState } from "react";
import { Message } from "./chat-container";
import { ChevronDown, ChevronUp, Loader, Wrench } from "lucide-react";

export interface ChatMessagesProps {
  messages: Message[]
  isLoading?: boolean
}


export function BaseMessage({ message }: { message: Message }) {
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md rounded-lg ${message.role === 'user'
          ? 'bg-blue-500 text-white px-4 py-2'
          : ''
          }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

export function ToolMessage({ message }: { message: Message }) {
  const [expand, setExpand] = useState(false)

  return (
    <div className="border rounded bg-gray-100 text-gray-500 text-sm duration-300 ease-in transform">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          {!message.content.return ? <Loader className="animate-spin" size={16} /> : <Wrench size={16} />}
          <span>{message.content.name}</span>
        </div>
        {expand ? <ChevronUp className="cursor-pointer" size={16} onClick={() => setExpand(false)} /> : <ChevronDown className="cursor-pointer" onClick={() => setExpand(true)} size={16} />}
      </div>
      {expand ? (
        <div className="border-t">
          <pre>
            {JSON.stringify(message.content.args, null, 2)}
          </pre>
          <pre>
            {JSON.stringify(message.content.return, null, 2)}
          </pre>
        </div>
      ) : null}
    </div >
  )
}


export function ChatMessages(props: ChatMessagesProps) {
  const { messages, isLoading } = props

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      {messages.map((message, index) => {
        if (message.role === 'tool') {
          return <ToolMessage message={message} key={index} />
        } else {
          return <BaseMessage message={message} key={index} />
        }
      })}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}