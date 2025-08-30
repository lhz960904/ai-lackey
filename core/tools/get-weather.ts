import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: 'Get the weather for a location',
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    return `Weather in ${location}: sunny, 72°F`;
  }
});

