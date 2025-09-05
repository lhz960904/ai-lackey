import { WORK_DIR } from '@/app/lib/constant';
import { mockFiles } from '@/app/lib/store/mock';
import { Client } from '@/core/client/client';
import { Config } from '@/core/config/config';
import { convertToModelMessages } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, model, messages } = await req.json();

    if (!messages) {
      return new Response('Message is required', { status: 400 });
    }

    // TODO get history by id
    const config = new Config({
      sessionId,
      model: model || 'deepseek-chat',
      targetDir: WORK_DIR,
      files: Object.entries(mockFiles).map(item => ({ path: item[0], type: item[1]?.type || 'file' as const }))
    })
    const client = new Client(config)
    const result = await client.sendMessageStream(convertToModelMessages(messages))

    return result.toUIMessageStreamResponse()

  } catch (error) {
    console.error('API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}