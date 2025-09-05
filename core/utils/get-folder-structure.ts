const MAX_DEPTH = 4;
export const TRUNCATION_INDICATOR = '...';
const DEFAULT_IGNORED_FOLDERS = new Set(['node_modules', '.git', 'dist']);

export interface FileInfo {
  path: string
  type: 'file' | 'folder',
}

/** Options for customizing folder structure retrieval. */
export interface FolderStructureOptions {
  /** max show folder level */
  maxDepth?: number
  /** Set of folder names to ignore completely. Case-sensitive. */
  ignoredFolders?: Set<string>;
  /** Optional regex to filter included files by name. */
  fileIncludePattern?: RegExp;
}

/** Represents the full, unfiltered information about a folder and its contents. */
export interface FullFolderInfo {
  name: string;
  path: string;
  files: string[];
  subFolders: FullFolderInfo[];
  hasMore?: boolean; // Indicates if files or subfolders were truncated for this specific folder
}

function formatStructure(
  node: FullFolderInfo,
  currentIndent: string,
  builder: string[],
): void {
  // Render files of the current node
  const fileCount = node.files.length;
  for (let i = 0; i < fileCount; i++) {
    const isLastFileAmongSiblings =
      i === fileCount - 1 && node.subFolders.length === 0;
    const fileConnector = isLastFileAmongSiblings ? '└───' : '├───';
    builder.push(`${currentIndent}${fileConnector}${node.files[i]}`);
  }

  // Render subfolders of the current node
  const subFolderCount = node.subFolders.length;
  for (let i = 0; i < subFolderCount; i++) {
    const isLastSubfolderAmongSiblings = i === subFolderCount - 1;
    const folderConnector = isLastSubfolderAmongSiblings ? '└───' : '├───';
    const subfolder = node.subFolders[i];
    const folderName = subfolder.hasMore ? `${subfolder.name}/${TRUNCATION_INDICATOR}` : `${subfolder.name}/`;
    builder.push(`${currentIndent}${folderConnector}${folderName}`);

    // Recursively format subfolder contents only if not truncated
    if (!subfolder.hasMore) {
      const indentForChildren = currentIndent + (isLastSubfolderAmongSiblings ? '    ' : '│   ');
      formatStructure(
        subfolder,
        indentForChildren,
        builder,
      );
    }
  }
}



export function getFolderStructure(
  rootDir: string,
  files: FileInfo[],
  options?: FolderStructureOptions,
): string {
  const {
    maxDepth = MAX_DEPTH,
    ignoredFolders = DEFAULT_IGNORED_FOLDERS,
    fileIncludePattern,
  } = options || {}

  const rootFolder: FullFolderInfo = {
    name: '',
    path: '',
    files: [],
    subFolders: [],
  };

  // Build the folder structure from flat file list
  for (const fileInfo of files) {
    // Strip rootDir prefix if present
    let filePath = fileInfo.path;
    const normalizedRootDir = rootDir.replace(/\/$/, ''); // Remove trailing slash
    if (filePath.startsWith(normalizedRootDir + '/')) {
      filePath = filePath.substring(normalizedRootDir.length + 1);
    } else if (filePath === normalizedRootDir) {
      filePath = '';
    }

    const parts = filePath.split('/').filter(part => part.length > 0);
    if (parts.length === 0) continue;

    let currentFolder = rootFolder;
    let currentPath = '';
    let depth = 0;
    let inIgnoredFolder = false;

    // Handle folder type entries
    if (fileInfo.type === 'folder') {
      // Create all parent folders and the folder itself
      for (let i = 0; i < parts.length; i++) {
        const folderName = parts[i];
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        depth++;

        // Check max depth
        if (depth > maxDepth) {
          break;
        }

        // Find or create subfolder
        let subfolder = currentFolder.subFolders.find(f => f.name === folderName);
        if (!subfolder) {
          subfolder = {
            name: folderName,
            path: currentPath,
            files: [],
            subFolders: [],
          };
          currentFolder.subFolders.push(subfolder);
        }
        currentFolder = subfolder;

        // Check if this folder should be ignored for contents (after creating it)
        if (ignoredFolders.has(folderName)) {
          inIgnoredFolder = true;
          // Don't go deeper into ignored folders
          break;
        }
      }
      continue;
    }

    // Handle file type entries - create parent folders
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      depth++;

      // Check max depth
      if (depth > maxDepth) {
        break;
      }

      // Find or create subfolder
      let subfolder = currentFolder.subFolders.find(f => f.name === folderName);
      if (!subfolder) {
        subfolder = {
          name: folderName,
          path: currentPath,
          files: [],
          subFolders: [],
        };
        currentFolder.subFolders.push(subfolder);
      }
      currentFolder = subfolder;

      // Check if this folder should be ignored for contents (after creating it)
      if (ignoredFolders.has(folderName)) {
        inIgnoredFolder = true;
        // Don't go deeper into ignored folders
        break;
      }
    }

    // Add file if it passes all filters
    if (fileInfo.type === 'file') {
      const fileName = parts[parts.length - 1];

      // Skip if in an ignored folder
      if (inIgnoredFolder) {
        continue;
      }

      // Check file include pattern
      if (fileIncludePattern && !fileIncludePattern.test(fileName)) {
        continue;
      }

      // Check depth limit
      if (parts.length <= maxDepth) {
        currentFolder.files.push(fileName);
      }
    }
  }

  // Handle depth truncation - mark folders that were truncated
  function markTruncation(folder: FullFolderInfo, currentDepth: number): boolean {
    let hasTruncation = false;

    for (const subfolder of folder.subFolders) {
      if (currentDepth >= maxDepth) {
        subfolder.hasMore = true;
        hasTruncation = true;
      } else {
        if (markTruncation(subfolder, currentDepth + 1)) {
          hasTruncation = true;
        }
      }
    }

    return hasTruncation;
  }

  const hasTruncation = markTruncation(rootFolder, 1);

  // Sort folders and files for consistent output
  function sortFolderContents(folder: FullFolderInfo) {
    folder.files.sort();
    folder.subFolders.sort((a, b) => a.name.localeCompare(b.name));
    folder.subFolders.forEach(sortFolderContents);
  }
  sortFolderContents(rootFolder);

  // Generate structure string
  const structureLines: string[] = [];
  formatStructure(rootFolder, '', structureLines);

  // Normalize rootDir for display (ensure single trailing slash)
  const displayRootDir = rootDir.replace(/\/+$/, '') + '/';

  let result = `${displayRootDir}\n${structureLines.join('\n')}`;

  // Add truncation header if needed
  if (hasTruncation) {
    result = `Folders or files indicated with ${TRUNCATION_INDICATOR} contain more items not shown, the display limit (${maxDepth} depth) was reached    \n${result}`;
  }

  return result.trim()
}