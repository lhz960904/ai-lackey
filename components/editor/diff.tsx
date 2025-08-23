"use client"

import { DiffEditor } from "@monaco-editor/react";
import { useTheme } from 'next-themes'

interface CodeEditorProps {
  language?: string
  height?: string | number
  width?: string | number
  className?: string
  original?: string
  modified?: string
}

export function DiffCodeEditor({
  language = 'javascript',
  height = '100%',
  width = '100%',
  className = '',
  original = '',
  modified = '',
}: CodeEditorProps) {
  const { theme } = useTheme()

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light'

  return (
    <div className={`monaco-editor-container h-full w-full ${className}`} style={{ minHeight: '400px', minWidth: '800px' }}>
      <DiffEditor
        height={height}
        width={width}
        language={language}
        theme={monacoTheme}
        original={original}
        modified={modified}
        options={{
          renderSideBySide: true,
          diffCodeLens: false,
          readOnly: true,
          originalEditable: false,
          renderMarginRevertIcon: false,
          renderGutterMenu: false,
          ignoreTrimWhitespace: true,
          enableSplitViewResizing: true,
          splitViewDefaultRatio: 0.5,
          fontSize: 14,
          lineHeight: 1.5,
          fontFamily: 'Monaco, Consolas, "Ubuntu Mono", monospace',
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
