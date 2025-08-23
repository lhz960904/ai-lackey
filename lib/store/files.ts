import type { WebContainer } from '@webcontainer/api';
// PathWatcherEvent
import { getEncoding } from 'istextorbinary';
import { Buffer } from 'buffer';
import * as nodePath from 'path';
// import { bufferWatchEvents } from '@/lib/utils';
// import { WORK_DIR } from '@/lib/constant';
import { StoreApi } from 'zustand';
import { WorkbenchStoreState } from './workbench';

const utf8TextDecoder = new TextDecoder('utf8', { fatal: true });

export interface File {
  type: 'file';
  content: string;
  isBinary: boolean;
}

export interface Folder {
  type: 'folder';
}

type Dirent = File | Folder;

export type FileMap = Record<string, Dirent | undefined>;

export interface FilesStoreState {
  files: FileMap
  setFile: (key: string, value: Dirent | undefined) => void;
}


export class FilesStore {
  #webContainer: WebContainer;

  /**
   * Tracks the number of files without folders.
   */
  #size = 0;

  /**
   * @note Keeps track all modified files with their original content since the last user message.
   * Needs to be reset when the user sends another message and all changes have to be submitted
   * for the model to be aware of the changes.
   */
  #modifiedFiles: Map<string, string> = new Map();

  #store: StoreApi<WorkbenchStoreState>


  get filesCount() {
    return this.#size;
  }

  constructor(webContainer: WebContainer, store: StoreApi<WorkbenchStoreState>) {
    this.#webContainer = webContainer;
    this.#store = store

    this.#init();
  }

  getFile(filePath: string) {
    const dirent = this.#store.getState().files[filePath];

    if (dirent?.type !== 'file') {
      return undefined;
    }

    return dirent;
  }


  resetFileModifications() {
    this.#modifiedFiles.clear();
  }

  async saveFile(filePath: string, content: string) {
    const webContainer = this.#webContainer;

    try {
      const relativePath = nodePath.relative(webContainer.workdir, filePath);

      if (!relativePath) {
        throw new Error(`EINVAL: invalid file path, write '${relativePath}'`);
      }

      const oldContent = this.getFile(filePath)?.content;

      if (!oldContent) {
        throw new Error('Expected content to be defined');
      }

      await webContainer.fs.writeFile(relativePath, content);

      if (!this.#modifiedFiles.has(filePath)) {
        this.#modifiedFiles.set(filePath, oldContent);
      }

      // we immediately update the file and don't rely on the `change` event coming from the watcher
      this.setFile(filePath, { type: 'file', content, isBinary: false });

    } catch (error) {
      throw error;
    }
  }

  async setFile(path: string, content?: Dirent | undefined) {
    const files = this.#store.getState().files
    files[path] = content
    this.#store.setState({ files })
  }

  async #init() {
    const webContainer = await this.#webContainer;

    // webContainer.internal.watchPaths(
    //   { include: [`${WORK_DIR}/**`], exclude: ['**/node_modules', '.git'], includeContent: true },
    //   bufferWatchEvents(100, this.#processEventBuffer.bind(this)),
    // );
    // webContainer.fs.watch('', (event, ) => {

    // })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #processEventBuffer(events: Array<[events: any[]]>) {
    const watchEvents = events.flat(2);

    for (const { type, path, buffer } of watchEvents) {
      // remove any trailing slashes
      const sanitizedPath = path.replace(/\/+$/g, '');

      switch (type) {
        case 'add_dir': {
          // we intentionally add a trailing slash so we can distinguish files from folders in the file tree
          this.setFile(sanitizedPath, { type: 'folder' });
          break;
        }
        case 'remove_dir': {
          this.setFile(sanitizedPath, undefined);

          for (const [direntPath] of Object.entries(this.#store.getState().files)) {
            if (direntPath.startsWith(sanitizedPath)) {
              this.setFile(direntPath, undefined);
            }
          }

          break;
        }
        case 'add_file':
        case 'change': {
          if (type === 'add_file') {
            this.#size++;
          }

          let content = '';

          /**
           * @note This check is purely for the editor. The way we detect this is not
           * bullet-proof and it's a best guess so there might be false-positives.
           * The reason we do this is because we don't want to display binary files
           * in the editor nor allow to edit them.
           */
          const isBinary = isBinaryFile(buffer);

          if (!isBinary) {
            content = this.#decodeFileContent(buffer);
          }

          this.setFile(sanitizedPath, { type: 'file', content, isBinary });

          break;
        }
        case 'remove_file': {
          this.#size--;
          this.setFile(sanitizedPath, undefined);
          break;
        }
        case 'update_directory': {
          // we don't care about these events
          break;
        }
      }
    }
  }

  #decodeFileContent(buffer?: Uint8Array) {
    if (!buffer || buffer.byteLength === 0) {
      return '';
    }

    try {
      return utf8TextDecoder.decode(buffer);
    } catch (error) {
      console.log(error);
      return '';
    }
  }
}

function isBinaryFile(buffer: Uint8Array | undefined) {
  if (buffer === undefined) {
    return false;
  }

  return getEncoding(convertToBuffer(buffer), { chunkLength: 100 }) === 'binary';
}

/**
 * Converts a `Uint8Array` into a Node.js `Buffer` by copying the prototype.
 * The goal is to  avoid expensive copies. It does create a new typed array
 * but that's generally cheap as long as it uses the same underlying
 * array buffer.
 */
function convertToBuffer(view: Uint8Array): Buffer {
  const buffer = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);

  Object.setPrototypeOf(buffer, Buffer.prototype);

  return buffer as Buffer;
}
