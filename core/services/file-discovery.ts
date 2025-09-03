

export class FileDiscoveryService {

  constructor(private targetDir: string) {
  }


  /**
  * Checks if a single file should be git-ignored
  */
  shouldGitIgnoreFile(filePath: string): boolean {
    // if (this.gitIgnoreFilter) {
    //   return this.gitIgnoreFilter.isIgnored(filePath);
    // }
    return false;
  }

  /**
   * Checks if a single file should be gemini-ignored
   */
  shouldGeminiIgnoreFile(filePath: string): boolean {
    // if (this.geminiIgnoreFilter) {
    //   return this.geminiIgnoreFilter.isIgnored(filePath);
    // }
    return false;
  }
}