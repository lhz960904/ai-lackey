import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function bufferWatchEvents<T extends unknown[]>(timeInMs: number, cb: (events: T[]) => unknown) {
  let timeoutId: number | undefined;
  let events: T[] = [];

  // keep track of the processing of the previous batch so we can wait for it
  let processing: Promise<unknown> = Promise.resolve();

  const scheduleBufferTick = () => {
    timeoutId = self.setTimeout(async () => {
      // we wait until the previous batch is entirely processed so events are processed in order
      await processing;

      if (events.length > 0) {
        processing = Promise.resolve(cb(events));
      }

      timeoutId = undefined;
      events = [];
    }, timeInMs);
  };

  return (...args: T) => {
    events.push(args);

    if (!timeoutId) {
      scheduleBufferTick();
    }
  };
}

const languageMap: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript', 
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.php': 'php',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.kt': 'kotlin',
  '.swift': 'swift',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.fish': 'shell',
  '.ps1': 'powershell',
  '.html': 'html',
  '.htm': 'html',
  '.xml': 'xml',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'sass',
  '.less': 'less',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.sql': 'sql',
  '.r': 'r',
  '.R': 'r',
  '.scala': 'scala',
  '.clj': 'clojure',
  '.hs': 'haskell',
  '.elm': 'elm',
  '.lua': 'lua',
  '.pl': 'perl',
  '.pm': 'perl',
  '.dart': 'dart',
  '.vue': 'vue',
  '.svelte': 'svelte',
};

export function getLanguageFromFilePath(filePath: string | undefined): string {
  if (!filePath) return 'plaintext';
  
  const extension = filePath.substring(filePath.lastIndexOf('.'));
  return languageMap[extension] || 'plaintext';
}
