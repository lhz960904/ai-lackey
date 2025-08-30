
import { LanguageModelV2 } from '@ai-sdk/provider';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';


const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const anthropic = createAnthropic({
  baseURL: process.env.ANTHROPIC_BASE_URL,
  apiKey: process.env.ANTHROPIC_API_KEY
});


export const supportModels: Record<string, LanguageModelV2> = {
  'deepseek-v3.1': deepseek("deepseek-chat"),
  'claude-4-sonnet': anthropic('claude-sonnet-4-20250514'),
}

export function getModel(key: string): LanguageModelV2 | undefined {
  return supportModels[key]
}

export const SUPPORT_MODELS = Object.keys(supportModels)