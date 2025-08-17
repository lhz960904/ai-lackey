import { useState, useRef, useCallback } from 'react';
import { ChatMessage, isNormalMessage, MessageRole, ParsedStreamData, parseMessageStream, ToolCallWithReturn } from '@/lib/messages';

export interface UseChatOptions {
  api?: string;
  onError?: (error: Error) => void;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (input?: string) => Promise<void>;
  stop: () => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { api = '/api/chat', onError } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (readerRef.current) {
      readerRef.current.cancel();
    }

    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const sendMessage = async (input?: string) => {
    if (!input?.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: MessageRole.Human, content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
        signal: abortControllerRef.current.signal,
      });



      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (typeof response.body !== 'undefined') {
      }
      let assistantMessage = ''
      await parseMessageStream(response.body, {
        onStart(reader) {
          setIsStreaming(true);
          setIsLoading(false);
          readerRef.current = reader
        },
        onMessage(data: ParsedStreamData) {
          if (data.type === 'message') {
            if (typeof data.data !== 'string') return
            assistantMessage += data.data as string;
            setMessages(prev => {
              const nextMessages = [...prev];
              const lastMessage = nextMessages[nextMessages.length - 1];
              // ignore if the new data is not a string
              if (isNormalMessage(lastMessage) && lastMessage.role === MessageRole.AI) {
                nextMessages[nextMessages.length - 1].content = assistantMessage
              } else {
                nextMessages.push({
                  role: MessageRole.AI,
                  content: assistantMessage
                });
              }
              return nextMessages
            })
          } else if (data.type === 'tool') {
            setMessages(prev => {
              const newMessages = [...prev];
              const matchIndex = newMessages.findLastIndex(item =>
                item.role === MessageRole.Tool && 'id' in item.content && item.content.id === (data.data as ToolCallWithReturn).id
              );
              if (matchIndex > -1) {
                newMessages[matchIndex] = {
                  role: MessageRole.Tool,
                  content: data.data as ToolCallWithReturn
                };
              } else {
                newMessages.push({
                  role: MessageRole.Tool,
                  content: data.data as ToolCallWithReturn
                });
              }
              return newMessages;
            });
          }
        }
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        setMessages(prev => [...prev, {
          role: MessageRole.AI,
          content: `抱歉，发生了错误：${errorMessage}。请稍后再试。`
        }]);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
      readerRef.current = null;
    }
  };

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    stop,
    setMessages
  };
}