import { CallSettings, ModelMessage, streamText } from "ai";
import { Config } from "../config/config";
import { getEnvironmentContext } from "../utils/environment-context";
import { getCoreSystemPrompt } from "../prompts/system";


export class Client {
  private generateContentConfig: CallSettings = {
    temperature: 0,
    topP: 1,
  };
  private history: ModelMessage[] = [];
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
    this.initialize()
  }

  initialize() {
    const envContext = getEnvironmentContext(this.config);
    this.history = [
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
  }

  addHistory(content: ModelMessage) {
    this.history.push(content)
  }

  getHistory() {
    return this.history
  }

  async sendMessageStream(messages: ModelMessage[]) {
    // TODO try compress chat when token exceed

    return streamText({
      model: this.config.getModel(),
      system: getCoreSystemPrompt(this.config.getUserMemory()),
      messages: [
        ...this.history,
        ...messages
      ],
      tools: {
      },
      ...this.generateContentConfig
    });
  }


  async tryCompressChat() {

  }
}