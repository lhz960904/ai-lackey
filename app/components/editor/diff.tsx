"use client"

import { DiffEditor } from "@monaco-editor/react";
import { useTheme } from 'next-themes'
import type { editor } from 'monaco-editor'
import { registerLanguages } from './language-setup'

interface CodeEditorProps {
  language?: string
  height?: string | number
  width?: string | number
  className?: string
  original?: string
  modified?: string
}

// 动态行号管理函数
function setupDynamicLineNumbers(diffEditor: editor.IDiffEditor) {
  const modifiedEditor = diffEditor.getModifiedEditor();

  // 动态调整行号显示的函数
  const updateLineNumbers = () => {
    // 检查当前是否为side-by-side模式
    // 通过检查DOM元素来判断当前渲染模式
    const diffContainer = diffEditor.getContainerDomNode();
    const isSideBySide = diffContainer?.querySelector('.monaco-diff-editor.side-by-side') !== null;

    if (isSideBySide) {
      // side-by-side模式：显示右侧行号
      modifiedEditor.updateOptions({
        lineNumbers: 'on',
      });
    } else {
      // inline模式：隐藏行号
      modifiedEditor.updateOptions({
        lineNumbers: 'off',
      });
    }
  };

  // 初始调整
  updateLineNumbers();

  // 监听窗口大小变化，重新调整行号显示
  const resizeObserver = new ResizeObserver(() => {
    setTimeout(updateLineNumbers, 100); // 延迟执行以确保DOM更新完成
  });

  const container = diffEditor.getContainerDomNode();
  if (container) {
    resizeObserver.observe(container);
  }

  // 返回清理函数
  return () => {
    resizeObserver.disconnect();
  };
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
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
        }}
        onMount={(editor) => {
          // 使用独立的行号管理函数
          const cleanup = setupDynamicLineNumbers(editor);
          // 返回清理函数
          return cleanup;
        }}
        beforeMount={(monaco) => {
          registerLanguages(monaco)
        }}
      />
    </div>
  )
}
