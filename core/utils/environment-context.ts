import { TextPart } from "ai";
import { Config } from "../config/config";
import { getFolderStructure } from "./get-folder-structure";


/**
 * Generates a string describing the current workspace directories and their structures.
 * @param {Config} config - The runtime configuration and services.
 * @returns {Promise<string>} A promise that resolves to the directory context string.
 */
export function getDirectoryContextString(
  config: Config,
): string {

  const folderStructure = getFolderStructure(config.getTargetDir(), config.getAllFiles())

  const workingDirPreamble = `I'm currently working in the directory: ${config.getTargetDir()}`;

  return `${workingDirPreamble}
Here is the folder structure of the current working directories:

${folderStructure}`;
}

/**
 * Retrieves environment-related information to be included in the chat context.
 * This includes the current working directory, date, operating system, and folder structure.
 * Optionally, it can also include the full file context if enabled.
 * @param {Config} config - The runtime configuration and services.
 * @returns A promise that resolves to a UserContent objects containing environment information.
 */
export function getEnvironmentContext(config: Config): TextPart[] {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const directoryContext = getDirectoryContextString(config);
  const context = `
This is the Code Assistant. We are setting up the context for our chat.
Today's date is ${today}.
${directoryContext}
        `.trim();

  const parts: TextPart[] = [
    { type: 'text', text: context },
  ];

  return parts
}