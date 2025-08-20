
'use client';

import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import type { ITheme } from '@xterm/xterm';
import { SquareTerminal, X } from 'lucide-react';
import { useTheme } from 'next-themes';

function getTerminalTheme(overrides?: ITheme): ITheme {
  const style = getComputedStyle(document.documentElement);
  const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

  return {
    cursor: cssVar('--terminal-color-foreground'),
    cursorAccent: cssVar('--terminal-color-foreground'),
    foreground: cssVar('--terminal-color-foreground'),
    background: cssVar('--terminal-color-background'),
    selectionBackground: cssVar('--terminal-color-selection-background'),

    // ansi escape code colors
    black: cssVar('--terminal-color-black'),
    red: cssVar('--terminal-color-red'),
    green: cssVar('--terminal-color-green'),
    yellow: cssVar('--terminal-color-yellow'),
    blue: cssVar('--terminal-color-blue'),
    magenta: cssVar('--terminal-color-magenta'),
    cyan: cssVar('--terminal-color-cyan'),
    white: cssVar('--terminal-color-white'),
    brightBlack: cssVar('--terminal-color-brightBlack'),
    brightRed: cssVar('--terminal-color-brightRed'),
    brightGreen: cssVar('--terminal-color-brightGreen'),
    brightYellow: cssVar('--terminal-color-brightYellow'),
    brightBlue: cssVar('--terminal-color-brightBlue'),
    brightMagenta: cssVar('--terminal-color-brightMagenta'),
    brightCyan: cssVar('--terminal-color-brightCyan'),
    brightWhite: cssVar('--terminal-color-brightWhite'),

    ...overrides,
  };
}

interface TerminalProps {
  className?: string;
  readonly?: boolean;
  onTerminalResize?: (cols: number, rows: number) => void;
  onTerminalReady?: (terminal: XTerm) => void;
  onTerminalClose?: () => void;
}

export default function Terminal(props: TerminalProps) {
  const { className, readonly, onTerminalResize, onTerminalReady, onTerminalClose } = props;

  const terminalElementRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm>(null);

  const { theme } = useTheme()

  useEffect(() => {
    const element = terminalElementRef.current!;
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    const terminal = new XTerm({
      // cursorBlink: true,
      convertEol: true,
      disableStdin: false,
      theme: getTerminalTheme(readonly ? { cursor: '#00000000' } : {}),
      fontSize: 12,
      fontFamily: 'Menlo, courier-new, courier, monospace',
    });

    terminalRef.current = terminal;

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.open(element);

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      onTerminalResize?.(terminal.cols, terminal.rows);
    });

    resizeObserver.observe(element);

    onTerminalReady?.(terminal);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const terminal = terminalRef.current!;
    terminal.options.disableStdin = readonly;
    // 使用 requestAnimationFrame 确保 CSS 变量已经更新
    requestAnimationFrame(() => {
      terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});
      terminal.reset();
    });

  }, [theme, readonly]);

  return (
    <div className={`h-full rounded ${className}`}>
      <div className='px-2 flex justify-between items-center border-b h-10 text-sm select-none'>
        <div className='flex items-center gap-1'>
          <SquareTerminal size={18} />
          Console
        </div>
        <div>
          <X className="cursor-pointer" size={18} onClick={onTerminalClose} />
        </div>
      </div>
      <div ref={terminalElementRef} className='h-[calc(100%-40px)]' />
    </div>
  );
}