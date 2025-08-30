"use client"

import { Editor } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { useCallback, useRef } from 'react'
import type { editor } from 'monaco-editor'
import { registerLanguages } from './language-setup'

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
          registerLanguages(monaco)
        }}
      />
    </div>
  )
}