import { CallSettings, ModelMessage, streamText } from "ai";
import { Config } from "../config/config";
import { getEnvironmentContext } from "../utils/environment-context";


export class Client {
  private generateContentConfig: CallSettings = {
    temperature: 0,
    topP: 1,
  };
  private lastPromptId: string;
  private sessionTurnCount = 0;
  private readonly MAX_TURNS = 100;
  /**
   * Threshold for compression token count as a fraction of the model's token limit.
   * If the chat history exceeds this threshold, it will be compressed.
   */
  private readonly COMPRESSION_TOKEN_THRESHOLD = 0.7;
  /**
   * The fraction of the latest chat history to keep. A value of 0.3
   * means that only the last 30% of the chat history will be kept after compression.
   */
  private readonly COMPRESSION_PRESERVE_THRESHOLD = 0.3;


  constructor(private config: Config) {
    this.lastPromptId = this.config.getSessionId();
  }

  async initialize() {
    const envContext = await getEnvironmentContext(this.config);
    const history: ModelMessage[] = [
      {
        role: 'user',
        content: envContext,
      },
      {
        role: 'assistant',
        content: [{ type: 'text', text: 'Got it. Thanks for the context!' }],
      },
      // ...(extraHistory ?? []),
    ];
    // userMemory，

    // streamText({
    //   model: this.config.getModel(),
    //   system: `you are a code assistant, please help user coding, and you name is haha`,
    //   messages: history,
    //   tools: {
    //     // getWeather
    //   },
    // });
  }
}