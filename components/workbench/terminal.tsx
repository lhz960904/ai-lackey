
'use client';

import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import { useEffect, useRef } from 'react';


interface TerminalProps {
  className?: string;
  readonly?: boolean;
  onTerminalResize?: (cols: number, rows: number) => void;
  onTerminalReady?: (terminal: XTerm) => void;
}

export default function Terminal(props: TerminalProps) {
  const { className, readonly, onTerminalResize, onTerminalReady } = props;

  const terminalElementRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm>(null);

  useEffect(() => {
    const element = terminalElementRef.current!;
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    const terminal = new XTerm({
      // cursorBlink: true,
      convertEol: true,
      disableStdin: false,
      // theme: getTerminalTheme(readonly ? { cursor: '#00000000' } : {}),
      fontSize: 12,
      // fontFamily: 'Menlo, courier-new, courier, monospace',
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

    // we render a transparent cursor in case the terminal is readonly
    // terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});

    terminal.options.disableStdin = readonly;
  }, [readonly]);

  return <div className={`h-full bg-border ${className}`} ref={terminalElementRef} />;
}