
import { ChatDeepSeek } from '@langchain/deepseek';

// TODO support more model
export function getLLM() {
  const model = new ChatDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
    streaming: true,
  });

  return model
}