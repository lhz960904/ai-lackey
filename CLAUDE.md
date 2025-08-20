# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` or `pnpm run dev` (uses Next.js with Turbopack)
- **Build**: `npm run build` 
- **Production server**: `npm run start`
- **Linting**: `npm run lint`
- **Testing**: `npm test` (uses Vitest)
- **Test coverage**: `npm run coverage`

## Architecture

AI-Lackey is a Next.js-based AI chat application that uses LangChain and LangGraph for AI agent functionality.

### Core Architecture

**Backend (AI Agent)**:
- `core/graph/index.ts`: Creates a React agent using LangGraph with LLM and tools
- `core/llm/index.ts`: LLM configuration (currently DeepSeek Chat model)
- `core/tools/`: Tool implementations for the agent (e.g., weather tools)

**API Layer**:
- `app/api/chat/route.ts`: Main chat endpoint that streams responses from the agent
- Uses streaming mode with custom message conversion via `convertMessageStream`

**Frontend (React/Next.js)**:
- `hooks/use-chat.ts`: Custom hook managing chat state, streaming, and message handling
- `lib/messages.ts`: Message type definitions and stream parsing utilities
- Components in `components/`: UI components using Radix UI and Tailwind CSS

### Key Data Flow

1. User sends message → `useChat` hook → `/api/chat` endpoint
2. API creates agent stream → `convertMessageStream` converts to readable stream
3. Frontend `parseMessageStream` processes chunks → Updates UI state
4. Supports both regular messages and tool calls with returns

### Message Types

The app handles three message roles:
- `MessageRole.Human`: User messages
- `MessageRole.AI`: Assistant responses
- `MessageRole.Tool`: Tool calls and their returns

Tool messages include both the tool call and its return value in a `ToolCallWithReturn` structure.

### Environment Variables

- `DEEPSEEK_API_KEY`: Required for LLM functionality

### Testing

Uses Vitest for testing with coverage reporting. Test files use `.test.ts` extension.

### Package Management
- Uses `pnpm` as the package manager