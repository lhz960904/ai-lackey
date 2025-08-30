# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-Lackey is an AI-powered code programming assistant built with Next.js that provides an interactive workbench for building and editing applications. It uses WebContainer API to provide a sandboxed development environment in the browser.

## Architecture

### Monorepo Structure
- **Root**: Next.js web application  
- **cli/**: Command line tool package (`@ai-lackey/cli`)
- Managed with pnpm workspaces

### Core Components
- **Workbench**: Main interactive coding environment with Monaco editor, terminal, and preview
- **Chat System**: AI conversation interface for project requests and code generation
- **WebContainer Integration**: Browser-based Node.js runtime for executing code
- **File Management**: Virtual filesystem with real-time editing and saving capabilities

### Key Technologies
- Next.js 15 with React 19
- WebContainer API for sandboxed execution
- Monaco Editor for code editing
- XTerm.js for terminal interface
- Zustand for state management
- shadcn/ui components with Tailwind CSS
- AI SDK for LLM integration

### Store Architecture
- **WorkbenchStore**: Central state management for file system, terminal, and editor
- **FilesStore**: Handles file operations and virtual filesystem
- Uses Zustand for reactive state management

## Development Commands

### Main Application
- `pnpm dev` - Start Next.js development server with Turbo
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests with Vitest
- `pnpm coverage` - Run test coverage

### CLI Package
- `pnpm dev:cli` - Develop CLI in watch mode
- `pnpm --filter @ai-lackey/cli run build` - Build CLI package

## Important Configuration

### Next.js Headers
The application requires specific CORS headers for WebContainer to function:
- Cross-Origin-Embedder-Policy: require-corp
- Cross-Origin-Opener-Policy: same-origin

### Component Structure
- Components are located in `app/components/`
- UI components use shadcn/ui patterns
- Workbench components handle the main development interface

### File System Integration
- Virtual files are managed through WebContainer API
- File editing uses Monaco editor with diff capabilities
- Terminal integration provides shell access to the container

## Key Patterns

### Workbench Integration
When working with the workbench system, understand the relationship between:
- WorkbenchStore (state management)
- WebContainer (execution environment)  
- Monaco Editor (code editing)
- Terminal (shell interface)

### State Management
The application uses Zustand stores for managing:
- File system state and unsaved changes
- Current file selection
- Terminal visibility and preview state