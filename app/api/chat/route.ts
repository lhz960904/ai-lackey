import { agent } from '@/core/graph';
import { convertMessageStream } from '@/lib/messages';
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
    const readableStream = convertMessageStream(stream)
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