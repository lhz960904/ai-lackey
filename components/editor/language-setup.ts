import type { Monaco } from '@monaco-editor/react'

// 语言配置定义 - 单一数据源
export const LANGUAGE_CONFIGS = {
  typescript: { extensions: ['.ts'], aliases: ['TypeScript', 'ts'] },
  javascript: { extensions: ['.js', '.mjs'], aliases: ['JavaScript', 'js'] },
  css: { extensions: ['.css'], aliases: ['CSS'] },
  scss: { extensions: ['.scss'], aliases: ['SCSS', 'sass'] },
  less: { extensions: ['.less'], aliases: ['Less'] },
  html: { extensions: ['.html', '.htm'], aliases: ['HTML'] },
  json: { extensions: ['.json'], aliases: ['JSON'] },
  markdown: { extensions: ['.md', '.markdown'], aliases: ['Markdown'] },
  vue: { extensions: ['.vue'], aliases: ['Vue'] },
  jsx: { extensions: ['.jsx'], aliases: ['JSX'] },
  tsx: { extensions: ['.tsx'], aliases: ['TSX'] },
}

export function registerLanguages(monaco: Monaco) {
  Object.entries(LANGUAGE_CONFIGS).forEach(([id, config]) => {
    monaco.languages.register({
      id,
      extensions: [...config.extensions],
      aliases: [...config.aliases]
    })
  })
}


export function getLanguageByFilePath(filePath?: string): string | undefined {
  if (!filePath) return undefined

  const ext = '.' + filePath.split('.').pop()?.toLowerCase()

  for (const [languageId, config] of Object.entries(LANGUAGE_CONFIGS)) {
    if (config.extensions.includes(ext)) {
      return languageId
    }
  }

  return undefined
}

