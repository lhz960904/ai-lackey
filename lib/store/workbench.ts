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

export interface CurrentFile {
  filePath: string
  content?: string
  isBinary: boolean;
}

export interface WorkbenchStoreState {
  files: FileMap;
  previewInfo?: PreviewInfo;
  isShowTerminal: boolean;
  currentFile?: CurrentFile;
  unsavedFiles: Map<string, string>
}

export class WorkbenchStore {

  #webContainer: WebContainer;
  #filesStore: FilesStore;
  #shellProcess: WebContainerProcess | null = null

  store = createStore<WorkbenchStoreState>(() => ({
    isShowTerminal: false,
    files: mockFiles,
    unsavedFiles: new Map(),
    currentFile: {
      filePath: `${WORK_DIR}/index.js`,
      ...mockFiles[`${WORK_DIR}/index.js`]
    } as CurrentFile,
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
    const file = this.store.getState().files[filePath]
    const unsavedFiles = this.store.getState().unsavedFiles
    if (file?.type !== 'file') return
    const content = unsavedFiles.has(filePath) ? unsavedFiles.get(filePath) : file.content
    this.store.setState({
      currentFile: {
        filePath,
        content,
        isBinary: file.isBinary
      }
    })
  }

  setCurrentFileContent(newContent: string = '') {
    const currentFile = this.store.getState().currentFile

    if (!currentFile) {
      return;
    }

    const originalContent = this.#filesStore.getFile(currentFile.filePath)?.content;
    const unsavedChanges = originalContent !== undefined && originalContent !== newContent;

    const newCurrentFile = { ...currentFile, content: newContent }
    this.store.setState({ currentFile: newCurrentFile })

    const previousUnsavedFiles = this.store.getState().unsavedFiles;
    const nextUnsavedFiles = new Map(previousUnsavedFiles)

    if (unsavedChanges) {
      nextUnsavedFiles.set(currentFile.filePath, newContent)
    } else {
      nextUnsavedFiles.delete(currentFile.filePath);
    }

    this.store.setState({ unsavedFiles: nextUnsavedFiles })
  }

  async saveCurrentFileContent() {
    const currentFile = this.store.getState().currentFile

    if (!currentFile) {
      return;
    }
    await this.#filesStore.saveFile(currentFile.filePath, currentFile.content || '');
    const previousUnsavedFiles = this.store.getState().unsavedFiles;
    const nextUnsavedFiles = new Map(previousUnsavedFiles)
    nextUnsavedFiles.delete(currentFile.filePath);
    this.store.setState({ unsavedFiles: nextUnsavedFiles })
  }

  resetCurrentFileContent() {
    const currentFile = this.store.getState().currentFile

    if (!currentFile) {
      return;
    }
    const { filePath } = currentFile;
    const file = this.#filesStore.getFile(filePath);

    if (!file) {
      return;
    }

    this.store.setState({ currentFile: { ...currentFile, content: file.content } });
  }
}

