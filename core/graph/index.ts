
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getLLM } from "../llm";
import { getWeather2, getWeather1 } from "../tools/get-weather";

export const agent = createReactAgent({ llm: getLLM(), tools: [getWeather1, getWeather2] });
