import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Config } from "../config/config";
import { getFolderStructure } from "./get-folder-structure";
import { getDirectoryContextString, getEnvironmentContext } from "./environment-context";

vi.mock('../config/config.js');
vi.mock('./get-folder-structure', () => ({
  getFolderStructure: vi.fn(),
}));

describe('getDirectoryContextString', () => {
  let mockConfig: Partial<Config>;

  beforeEach(() => {
    mockConfig = {
      getAllFiles: vi.fn(),
      getTargetDir: vi.fn()
    };
    vi.mocked(getFolderStructure).mockReturnValue('Mock Folder Structure');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return context string for a single directory', async () => {
    vi.mocked(mockConfig.getTargetDir!).mockReturnValue('/test/dir')
    const contextString = getDirectoryContextString(mockConfig as Config);
    expect(contextString).toContain(
      "I'm currently working in the directory: /test/dir",
    );
    expect(contextString).toContain(
      'Here is the folder structure of the current working directories:\n\nMock Folder Structure',
    );
  });

  it('should passed all files to call getFolderStructure', () => {
    const mockedFiles = [{ path: '/test/dir', type: 'folder' as const }, { path: '/test/dir/a.ts', type: 'file' as const }]
    vi.mocked(mockConfig.getTargetDir!).mockReturnValue('/test/dir')
    vi.mocked(mockConfig.getAllFiles!).mockReturnValue(mockedFiles)
    getDirectoryContextString(mockConfig as Config);
    expect(getFolderStructure).toHaveBeenCalledWith('/test/dir', mockedFiles);
  })

})

describe('getEnvironmentContext', () => {
  let mockConfig: Partial<Config>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-09-03T09:00:00Z'));

    mockConfig = {
      getAllFiles: vi.fn(),
      getTargetDir: vi.fn()
    };
    vi.mocked(mockConfig.getTargetDir!).mockReturnValue('/test/dir')
    vi.mocked(getFolderStructure).mockReturnValue('Mock Folder Structure');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('should return basic environment context for a single directory', async () => {
    const parts = getEnvironmentContext(mockConfig as Config);

    expect(parts.length).toBe(1);
    const context = parts[0].text;

    expect(context).toContain("Today's date is Wednesday, September 3, 2025.");
    expect(context).toContain(
      "I'm currently working in the directory: /test/dir",
    );
    expect(context).toContain(
      'Here is the folder structure of the current working directories:\n\nMock Folder Structure',
    );
  });

})