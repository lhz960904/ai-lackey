import { BaseMessage, BaseMessageChunk, isAIMessageChunk, isToolMessageChunk, MessageContent, ToolMessageChunk } from "@langchain/core/messages";
import { ToolCall } from "@langchain/core/messages/tool";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import { appendFileSync } from "fs";

export enum MessageRole {
  AI = 'ai',
  Human = 'human',
  Tool = 'tool',
}

export interface ToolCallWithReturn extends ToolCall {
  return?: MessageContent;
}

export interface ToolMessage {
  role: 'tool';
  content: ToolCallWithReturn
}

export interface NormalMessage {
  role: 'ai' | 'human';
  content: MessageContent;
}

export interface ParsedStreamData {
  type: 'tool' | 'message';
  data: ToolCallWithReturn | MessageContent;
}

export type ChatMessage = ToolMessage | NormalMessage

export function isToolMessage(value: ChatMessage): value is ToolMessage {
  return value.role === MessageRole.Tool && value.content.name !== undefined && value.content.args !== undefined;
}

export function isNormalMessage(value: ChatMessage): value is NormalMessage {
  return value.role === MessageRole.AI || value.role === MessageRole.Human;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertMessageStream(stream: IterableReadableStream<[BaseMessage, Record<string, any>]>) {
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const toolMap = new Map<string, ToolCallWithReturn>();
        let toolArgs = '', lastToolId = '';
        for await (const item of stream) {
          const message = item[0] as BaseMessageChunk
          if (isAIMessageChunk(message) && message.tool_calls?.length) {
            const toolMessage = message.tool_calls[0]
            toolMap.set(toolMessage.id || '', toolMessage)
            lastToolId = toolMessage.id || ''
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: MessageRole.Tool, data: toolMessage })}\n\n`));
          }
          if (isAIMessageChunk(message) && message.tool_call_chunks?.length) {
            toolArgs += message.tool_call_chunks[0].args
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const args: Record<string, any> = JSON.parse(toolArgs)
              const toolMessage = toolMap.get(lastToolId)
              if (toolMessage) {
                toolMessage.args = args
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: MessageRole.Tool, data: toolMessage })}\n\n`));
              }
            } catch {
            }
          } else {
            if (isToolMessageChunk(message) && message.tool_call_id) {
              const toolMessage = toolMap.get(message.tool_call_id)
              if (toolMessage) {
                toolMessage.return = message.content
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: MessageRole.Tool, data: toolMessage })}\n\n`));
              }
            } else {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'message', data: message.content })}\n\n`));
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      }
    },
  });

  return readableStream
}


export async function parseMessageStream(stream: ReadableStream<Uint8Array<ArrayBuffer>> | null, callbacks: { onStart?: (reader: ReadableStreamDefaultReader) => void; onMessage?: (data: ParsedStreamData) => void; onEnd?: () => void }) {
  const reader = stream?.getReader();
  if (!stream || !reader) {
    return null;
  }
  callbacks.onStart?.(reader);
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = new TextDecoder().decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {

        const data = line.slice(6);
        if (data === '[DONE]') {
          callbacks.onEnd?.();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          callbacks.onMessage?.(parsed);
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  }
}

