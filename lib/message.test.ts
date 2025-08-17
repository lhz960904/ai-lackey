import { expect, test, describe } from 'vitest'
import { isNormalMessage, isToolMessage, convertMessageStream } from './messages'
import { AIMessageChunk, BaseMessageChunk, ToolMessageChunk } from '@langchain/core/messages'
import { IterableReadableStream } from '@langchain/core/utils/stream'

describe('isToolMessage', () => {
  test('should return true if the role is \'tool\'', () => {
    expect(isToolMessage({ role: 'tool', content: { name: 'testTool', args: {} } })).toBe(true)
    expect(isToolMessage({ role: 'human', content: '' })).toBe(false)
  })

  test('should return false if content has not name or args', () => {
    // @ts-expect-error for test
    expect(isToolMessage({ role: 'tool', content: { name: 'testTool' } })).toBe(false)
    // @ts-expect-error for test
    expect(isToolMessage({ role: 'tool', content: { args: {} } })).toBe(false)

  })
})

describe('isNormalMessage', () => {
  test(' should return true if the role is in ["human", "ai"]', () => {
    expect(isNormalMessage({ role: 'tool', content: { name: 'testTool', args: {} } })).toBe(false)
    expect(isNormalMessage({ role: 'human', content: '' })).toBe(true)
    expect(isNormalMessage({ role: 'ai', content: '' })).toBe(true)
  })
})

describe('convertMessageStream', () => {
  // Mock 创建可迭代流
  const createMockStream = (items: [BaseMessageChunk, Record<string, unknown>][]) => {
    return {
      [Symbol.asyncIterator]: async function* () {
        for (const item of items) {
          yield item;
        }
      }
    } as IterableReadableStream<[BaseMessageChunk, Record<string, unknown>]>;
  };

  // Mock BaseMessageChunk 工厂函数
  const createMockAIMessage = (props: Partial<AIMessageChunk> = {}): BaseMessageChunk => ({
    content: '',
    _getType: () => 'ai',
    ...props
  } as BaseMessageChunk);

  const createMockToolMessage = (props: Partial<ToolMessageChunk> = {}): BaseMessageChunk => ({
    content: '',
    _getType: () => 'tool',
    ...props
  } as BaseMessageChunk);

  const createMockMessage = (props: Partial<BaseMessageChunk> = {}): BaseMessageChunk => ({
    content: '',
    _getType: () => 'generic',
    ...props
  } as BaseMessageChunk);

  // 辅助函数读取 ReadableStream 的所有数据
  const readStreamToText = async (stream: ReadableStream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
    } finally {
      reader.releaseLock();
    }

    return result;
  };

  test('should handle AI message with tool calls', async () => {
    const mockAIMessage = createMockAIMessage({
      tool_calls: [{
        id: 'tool_123',
        name: 'search',
        args: { query: 'test' }
      }]
    });

    const mockStream = createMockStream([[mockAIMessage, {}]]);
    const result = convertMessageStream(mockStream);
    const output = await readStreamToText(result);

    expect(output).toContain('data: {"type":"tool","data":{"id":"tool_123","name":"search","args":{"query":"test"}}}');
    expect(output).toContain('data: [DONE]');
  });

  test('should handle AI message with tool call chunks', async () => {
    const mockAIMessage1 = createMockAIMessage({
      tool_calls: [{
        id: 'tool_456',
        name: 'calculate',
        args: {}
      }]
    });

    const mockAIMessage2 = createMockAIMessage({
      tool_call_chunks: [{
        args: '{"num'
      }]
    });

    const mockAIMessage3 = createMockAIMessage({
      tool_call_chunks: [{
        args: 'ber":42}'
      }]
    });

    const mockStream = createMockStream([
      [mockAIMessage1, {}],
      [mockAIMessage2, {}],
      [mockAIMessage3, {}]
    ]);

    const result = convertMessageStream(mockStream);
    const output = await readStreamToText(result);

    expect(output).toContain('data: {"type":"tool","data":{"id":"tool_456","name":"calculate","args":{}}}');
    expect(output).toContain('data: {"type":"tool","data":{"id":"tool_456","name":"calculate","args":{"number":42}}}');
    expect(output).toContain('data: [DONE]');
  });

  test('should handle tool message with return content', async () => {
    const mockAIMessage = createMockAIMessage({
      tool_calls: [{
        id: 'tool_789',
        name: 'fetch',
        args: { url: 'https://example.com' }
      }]
    });

    const mockToolMessage = createMockToolMessage({
      tool_call_id: 'tool_789',
      content: 'Tool execution result'
    });

    const mockStream = createMockStream([
      [mockAIMessage, {}],
      [mockToolMessage, {}]
    ]);

    const result = convertMessageStream(mockStream);
    const output = await readStreamToText(result);

    expect(output).toContain('data: {"type":"tool","data":{"id":"tool_789","name":"fetch","args":{"url":"https://example.com"}}}');
    expect(output).toContain('data: {"type":"tool","data":{"id":"tool_789","name":"fetch","args":{"url":"https://example.com"},"return":"Tool execution result"}}');
    expect(output).toContain('data: [DONE]');
  });

  test('should handle normal message content', async () => {
    const mockMessage = createMockMessage({
      content: 'Hello, this is a normal message'
    });

    const mockStream = createMockStream([[mockMessage, {}]]);
    const result = convertMessageStream(mockStream);
    const output = await readStreamToText(result);

    expect(output).toContain('data: {"type":"message","data":"Hello, this is a normal message"}');
    expect(output).toContain('data: [DONE]');
  });

  test('should handle stream errors gracefully', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        throw new Error('Stream error');
      }
    } as unknown as IterableReadableStream<[BaseMessageChunk, Record<string, unknown>]>;

    const result = convertMessageStream(mockStream);
    const reader = result.getReader();

    await expect(reader.read()).rejects.toThrow('Stream error');
  });

  test('should handle invalid JSON in tool call chunks', async () => {
    const mockAIMessage1 = createMockAIMessage({
      tool_calls: [{
        id: 'tool_invalid',
        name: 'test',
        args: {}
      }]
    });

    const mockAIMessage2 = createMockAIMessage({
      tool_call_chunks: [{
        args: '{"invalid": json'
      }]
    });

    const mockStream = createMockStream([
      [mockAIMessage1, {}],
      [mockAIMessage2, {}]
    ]);

    const result = convertMessageStream(mockStream);
    const output = await readStreamToText(result);
    expect(output).toContain('data: {"type":"tool","data":{"id":"tool_invalid","name":"test","args":{}}}');
    expect(output).toContain('data: [DONE]');
    expect(output).not.toContain('"invalid": json');
  });
})
