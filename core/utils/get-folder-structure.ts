import { FileDiscoveryService } from "../services/file-discovery";

/** Options for customizing folder structure retrieval. */
interface FolderStructureOptions {
  /** Maximum number of files and folders combined to display. Defaults to 200. */
  maxItems?: number;
  /** Set of folder names to ignore completely. Case-sensitive. */
  ignoredFolders?: Set<string>;
  /** Optional regex to filter included files by name. */
  fileIncludePattern?: RegExp;
  /** For filtering files. */
  fileService?: FileDiscoveryService;
  // /** File filtering ignore options. */
  // fileFilteringOptions?: FileFilteringOptions;
}

export async function getFolderStructure(
  directory: string,
  options?: FolderStructureOptions,
): Promise<string> {
  return ''
  // fs? 考虑web场景
}