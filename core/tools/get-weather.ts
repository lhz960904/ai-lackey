import { tool, ToolRunnableConfig } from '@langchain/core/tools';
import { z } from 'zod';


const schema = z.object({
  location: z.string().describe("Location to get the weather for."),
})

export const getWeather1 = tool<typeof schema>((input) => {
  if (['sf', 'san francisco', 'san francisco, ca'].includes(input.location.toLowerCase())) {
    return 'It\'s 60 degrees and foggy.';
  } else {
    return 'It\'s 90 degrees and sunny.';
  }
}, {
  name: 'get_weather1',
  description: 'Call to get the current weather.',
  schema,
  tags: ['nostream']
})

export const getWeather2 = tool<typeof schema>((input) => {
  if (['sf', 'san francisco', 'san francisco, ca'].includes(input.location.toLowerCase())) {
    return 'It\'s 60 degrees and foggy.';
  } else {
    return 'It\'s 90 degrees and sunny.';
  }
}, {
  name: 'get_weather2',
  description: 'Call to get the current weather.',
  schema,
  tags: ['nostream']
})