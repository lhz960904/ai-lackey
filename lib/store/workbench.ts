import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { Terminal } from "@xterm/xterm";
import { newShellProcess } from "../shell";
import { coloredText } from "../terminal";
import { createStore } from 'zustand'

export interface PreviewInfo {
  port: number;
  ready: boolean;
  baseUrl: string;
}

interface WorkbenchStoreState {
  previewInfo?: PreviewInfo;
  isShowTerminal: boolean
  toggleTerminal: () => void;
}


export class WorkbenchStore {

  #webContainer: WebContainer;
  #shellProcess: WebContainerProcess | null = null

  state = createStore<WorkbenchStoreState>((set) => ({
    isShowTerminal: false,
    toggleTerminal: () => set((state) => ({ isShowTerminal: !state.isShowTerminal })),
  }))

  constructor(webContainer: WebContainer) {
    this.#webContainer = webContainer;
    this.init()
  }

  init() {
    this.#webContainer.on('port', (port, type, url) => {
      if (type === 'close' && this.state.getState().previewInfo?.port === port) {
        this.state.setState({ previewInfo: undefined });
        return;
      }

      this.state.setState({
        previewInfo: { port, ready: type === 'open', baseUrl: url }
      })
    });
  }

  async saveFile(path: string, content: string) {
    await this.#webContainer.fs.writeFile(path, content)
  }

  async attachTerminal(terminal: Terminal) {
    try {
      this.#shellProcess = await newShellProcess(this.#webContainer, terminal);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      terminal.write(coloredText.red('Failed to spawn shell\n\n') + error.message);
      return;
    }
  }

  onTerminalResize(cols: number, rows: number) {
    if (this.#shellProcess) {
      this.#shellProcess.resize({ cols, rows });
    }
  }

  toggleTerminal() {
    this.state.setState({ isShowTerminal: !this.state.getState().isShowTerminal })
  }
}

