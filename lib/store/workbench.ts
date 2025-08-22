import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { Terminal } from "@xterm/xterm";
import { newShellProcess } from "../shell";
import { coloredText } from "../terminal";
import { createStore } from 'zustand'
import { FileMap, FilesStore } from "./files";
import { mockFiles } from "./mock";
import { WORK_DIR } from "../constant";

export interface PreviewInfo {
  port: number;
  ready: boolean;
  baseUrl: string;
}

export interface WorkbenchStoreState {
  files: FileMap;
  previewInfo?: PreviewInfo;
  isShowTerminal: boolean;
  selectedFile?: string
}

export class WorkbenchStore {

  #webContainer: WebContainer;
  #filesStore: FilesStore;
  #shellProcess: WebContainerProcess | null = null

  store = createStore<WorkbenchStoreState>(() => ({
    isShowTerminal: false,
    files: mockFiles,
    selectedFile: `${WORK_DIR}/index.js`,

  }))

  constructor(webContainer: WebContainer) {
    this.#webContainer = webContainer;
    this.#filesStore = new FilesStore(webContainer, this.store)
    this.init()
  }

  init() {
    this.#webContainer.on('port', (port, type, url) => {
      if (type === 'close' && this.store.getState().previewInfo?.port === port) {
        this.store.setState({ previewInfo: undefined });
        return;
      }

      this.store.setState({
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
    this.store.setState({ isShowTerminal: !this.store.getState().isShowTerminal })
  }

  onFileSelect(filePath: string) {
    this.store.setState({ selectedFile: filePath })
  }
}

