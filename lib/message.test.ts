import { expect, test, describe, vi } from 'vitest'
import { isNormalMessage, isToolMessage, convertMessageStream, parseMessageStream } from './messages'
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


describe('parseMessageStream', () => {

  test('should return null if stream is null', async () => {
    const callbacks = {
      onStart: vi.fn(),
      onMessage: vi.fn(),
      onEnd: vi.fn()
    };
    const reader = await parseMessageStream(null, callbacks)
    expect(reader).toBeNull();
    expect(callbacks.onStart).not.toHaveBeenCalled();
    expect(callbacks.onMessage).not.toHaveBeenCalled();
    expect(callbacks.onEnd).not.toHaveBeenCalled();
  })

  test('should handle start, message, and end callbacks', async () => {
    const data1 = { type: 'message', data: 'Hello' };
    const data2 = { type: 'tool', data: { name: 'search', args: { query: 'test' } } };
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data1)}\n\n`));
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data2)}\n\n`));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
    const callbacks = {
      onStart: vi.fn(),
      onMessage: vi.fn(),
      onEnd: vi.fn()
    };
    await parseMessageStream(mockStream, callbacks);
    expect(callbacks.onStart).toHaveBeenCalled();
    expect(callbacks.onStart).toBeCalledTimes(1);
    expect(callbacks.onMessage).toHaveBeenCalledTimes(2);
    expect(callbacks.onMessage).toHaveBeenCalledWith(data1);
    expect(callbacks.onMessage).toHaveBeenCalledWith(data2);
    expect(callbacks.onEnd).toHaveBeenCalled();
    expect(callbacks.onEnd).toBeCalledTimes(1);
  })

  test('should not invoke end callbacks if stream not done', async () => {
    const data1 = { type: 'message', data: 'Hello' };
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data1)}\n\n`));
        controller.close();
      }
    });
    const callbacks = {
      onStart: vi.fn(),
      onMessage: vi.fn(),
      onEnd: vi.fn()
    };
    await parseMessageStream(mockStream, callbacks);
    expect(callbacks.onStart).toHaveBeenCalled();
    expect(callbacks.onStart).toBeCalledTimes(1);
    expect(callbacks.onMessage).toHaveBeenCalledTimes(1);
    expect(callbacks.onMessage).toHaveBeenCalledWith(data1);
    expect(callbacks.onEnd).not.toHaveBeenCalled();
  })

  test('should not invoke message callbacks if stream has not data', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
    const callbacks = {
      onStart: vi.fn(),
      onMessage: vi.fn(),
      onEnd: vi.fn()
    };
    await parseMessageStream(mockStream, callbacks);
    expect(callbacks.onStart).toHaveBeenCalled();
    expect(callbacks.onStart).toBeCalledTimes(1);
    expect(callbacks.onMessage).not.toHaveBeenCalled();
    expect(callbacks.onEnd).toHaveBeenCalled();
    expect(callbacks.onEnd).toBeCalledTimes(1);
  })

  test('should not continue invoke callbacks if stream abort', async () => {
    const data1 = { type: 'message', data: 'Hello' };
    const data2 = { type: 'tool', data: { name: 'search', args: { query: 'test' } } };
    const mockStream = new ReadableStream({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data1)}\n\n`));
        await new Promise(resolve => setTimeout(resolve, 1000));
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data2)}\n\n`));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
    let currentReader: ReadableStreamDefaultReader | null = null
    const callbacks = {
      onStart: (reader: ReadableStreamDefaultReader) => {
        currentReader = reader
        setTimeout(() => currentReader?.cancel(), 50)
      },
      onMessage: vi.fn(),
      onEnd: vi.fn()
    };
    await parseMessageStream(mockStream, callbacks);
    expect(callbacks.onMessage).toHaveBeenCalled();
    expect(callbacks.onMessage).toBeCalledTimes(1);
    expect(callbacks.onMessage).toHaveBeenCalledWith(data1);
    expect(callbacks.onEnd).not.toHaveBeenCalled();
  })
})