import { agent } from '@/core/graph';
import { BaseMessageChunk, isAIMessageChunk, MessageContent } from '@langchain/core/messages';
import { ToolCall } from '@langchain/core/messages/tool';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    const stream = await agent.stream({ messages: [{ role: 'user', content: message }] }, {
      streamMode: 'messages',
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let toolMessage: ToolCall & { return?: MessageContent } | undefined, toolArgs = ''
          for await (const item of stream) {
            const message = item[0] as BaseMessageChunk
            if (isAIMessageChunk(message) && message.tool_calls?.length) {
              toolMessage = message.tool_calls[0]
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'tool', data: toolMessage })}\n\n`));
            }
            if (isAIMessageChunk(message) && message.tool_call_chunks?.length) {
              toolArgs += message.tool_call_chunks[0].args
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const args: Record<string, any> = JSON.parse(toolArgs)
                if (toolMessage) {
                  toolMessage.args = args
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'tool', data: toolMessage })}\n\n`));
                }
              } catch {
              }
            } else {
              if (message.getType() === 'tool' && toolMessage) {

                toolMessage.return = message.content
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'tool', data: toolMessage })}\n\n`));
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

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}