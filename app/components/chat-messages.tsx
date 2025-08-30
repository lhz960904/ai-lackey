'use client'

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader, Wrench } from "lucide-react";
import { UIMessage } from "@ai-sdk/react";
import { ToolUIPart, UITools } from "ai";

export interface ChatMessagesProps {
  messages: UIMessage[]
  isLoading?: boolean
}


export function BaseMessage({ message }: { message: UIMessage }) {
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-sm lg:max-w-md rounded-lg ${message.role === 'user'
          ? 'bg-blue-500 text-white px-4 py-2'
          : ''
          }`}
      >
        <div className="whitespace-pre-wrap">
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
              case 'tool-getWeather': {
                return <ToolMessageRender part={part} />
              }
            }
          })}
        </div>
      </div>
    </div>
  )
}

export function ToolMessageRender({ part }: { part: ToolUIPart<UITools> }) {
  const [expand, setExpand] = useState(false)

  return (
    <div className="border rounded bg-gray-100 text-gray-500 text-sm duration-300 ease-in transform w-full mt-2">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          {!part.output ? <Loader className="animate-spin" size={16} /> : <Wrench size={16} />}
          <span>{part.type}</span>
        </div>
        {expand ? <ChevronUp className="cursor-pointer" size={16} onClick={() => setExpand(false)} /> : <ChevronDown className="cursor-pointer" onClick={() => setExpand(true)} size={16} />}
      </div>
      {expand ? (
        <div className="border-t p-2 overflow-auto">
          <div className="font-bold">input:</div>
          <pre>
            {JSON.stringify(part.input)}
          </pre>
          <div className="font-bold mt-2">output:</div>
          <pre>
            {JSON.stringify(part.state)}
          </pre>
        </div>
      ) : null}
    </div >
  )
}


export function ChatMessages(props: ChatMessagesProps) {
  const { messages, isLoading } = props

  if (messages.length) {
    const parts = messages[messages.length - 1].parts
    console.log('messages', JSON.stringify(parts[parts.length - 1]))
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      {messages.map((message) => <BaseMessage message={message} key={message.id} />)}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-border text-gray-800 px-4 py-2 rounded-lg">
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