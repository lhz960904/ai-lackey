import { sendMessage } from '@/core/client';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages) {
      return new Response('Message is required', { status: 400 });
    }

    const result = await sendMessage(messages)

    return result.toUIMessageStreamResponse()

  } catch (error) {
    console.error('API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}