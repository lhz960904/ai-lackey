import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: 'Get the weather for a location',
  inputSchema: z.object({ location: z.string() }),
});

// 单独的执行函数，供用户确认后调用
export async function executeGetWeather(location: string) {
  return `Weather in ${location}: sunny, 72°F`;
}

