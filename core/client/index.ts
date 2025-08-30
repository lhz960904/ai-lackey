
import { createDeepSeek } from '@ai-sdk/deepseek';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { getWeather } from '../tools/get-weather';

// TODO support more model
export function getLLM() {
  const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
  });

  return deepseek('deepseek-chat');
}


export function sendMessage(messages: UIMessage[]) {
  const msgs = convertToModelMessages(messages)
  const result = streamText({
    model: getLLM(),
    system: `you are a code assistant, please help user coding, and you name is haha`,
    messages: msgs,
    tools: {
      getWeather
    }
  });
  return result
}

