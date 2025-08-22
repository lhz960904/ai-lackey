"use client"

import { Editor } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { useCallback, useRef } from 'react'
import type { editor } from 'monaco-editor'

interface CodeEditorProps {
  language?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string | undefined) => void
  onSave?: (value: string) => void
  height?: string | number
  width?: string | number
  readOnly?: boolean
  className?: string
}

export function CodeEditor({
  language = 'javascript',
  value,
  defaultValue = '',
  onChange,
  onSave,
  height = '100%',
  width = '100%',
  readOnly = false,
  className = ''
}: CodeEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor

    // 添加保存快捷键 Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        const currentValue = editor.getValue()
        onSave?.(currentValue)
      }
    )
  }, [onSave])

  const handleEditorChange = useCallback((value: string | undefined) => {
    onChange?.(value)
  }, [onChange])

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light'

  return (
    <div className={`monaco-editor-container h-full ${className}`}>
      <Editor
        height={height}
        width={width}
        language={language}
        value={value}
        defaultValue={defaultValue}
        theme={monacoTheme}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          fontSize: 14,
          lineHeight: 1.5,
          fontFamily: 'Monaco, Consolas, "Ubuntu Mono", monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          renderLineHighlight: 'all',
          // selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          folding: true,
          foldingHighlight: true,
          bracketPairColorization: {
            enabled: true
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true
          },
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          parameterHints: {
            enabled: true
          },
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          accessibilitySupport: 'auto'
        }}
        beforeMount={(monaco) => {
          // 注册前端相关语言
          monaco.languages.register({ id: 'typescript' })
          monaco.languages.register({ id: 'javascript' })
          monaco.languages.register({ id: 'css' })
          monaco.languages.register({ id: 'scss' })
          monaco.languages.register({ id: 'less' })
          monaco.languages.register({ id: 'html' })
          monaco.languages.register({ id: 'json' })
          monaco.languages.register({ id: 'markdown' })

          // 为Vue文件添加支持
          monaco.languages.register({
            id: 'vue',
            extensions: ['.vue'],
            aliases: ['Vue', 'vue']
          })

          // 为JSX/TSX添加支持
          monaco.languages.register({
            id: 'jsx',
            extensions: ['.jsx'],
            aliases: ['JSX', 'jsx']
          })

          monaco.languages.register({
            id: 'tsx',
            extensions: ['.tsx'],
            aliases: ['TSX', 'tsx']
          })
        }}
      />
    </div>
  )
}

// 导出语言类型常量
export const SUPPORTED_LANGUAGES = {
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  JSX: 'jsx',
  TSX: 'tsx',
  CSS: 'css',
  SCSS: 'scss',
  LESS: 'less',
  HTML: 'html',
  VUE: 'vue',
  JSON: 'json',
  MARKDOWN: 'markdown'
} as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES]