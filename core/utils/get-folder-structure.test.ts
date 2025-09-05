/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, } from 'vitest';
import { getFolderStructure, TRUNCATION_INDICATOR } from './get-folder-structure';

describe('getFolderStructure', () => {
  const createFolder = (path: string) => ({ path, type: 'folder' as const })
  const createFile = (...path: string[]) => ({ path: path.join('/'), type: 'file' as const })
  const testRootDir = '/home/project'

  it('should return basic folder structure', () => {
    const structure = getFolderStructure(testRootDir, [
      createFolder('subfolderB'),
      createFile('subfolderB/fileB1.md'),
      createFile('fileA1.ts'),
      createFile('fileA2.js'),
    ]);
    expect(structure.trim()).toBe(
      `
${testRootDir}/
├───fileA1.ts
├───fileA2.js
└───subfolderB/
    └───fileB1.md
`.trim(),
    );
  });

  it('should handle an empty folder', () => {
    const structure = getFolderStructure(testRootDir, []);
    expect(structure.trim()).toBe(
      `
${testRootDir}/
`
        .trim()
        .trim(),
    );
  });

  it('should ignore folders specified in ignoredFolders (default)', () => {
    const files = [
      createFile('.hiddenfile'),
      createFile('file1.txt'),
      createFolder('emptyFolder'),
      createFile('node_modules', 'somepackage', 'index.js'),
      createFile('subfolderA', 'fileA1.ts'),
      createFile('subfolderA', 'fileA2.js'),
      createFile('subfolderA', 'subfolderB', 'fileB1.md'),
    ]
    const structure = getFolderStructure(testRootDir, files);
    expect(structure.trim()).toBe(
      `
${testRootDir}/
├───.hiddenfile
├───file1.txt
├───emptyFolder/
├───node_modules/
└───subfolderA/
    ├───fileA1.ts
    ├───fileA2.js
    └───subfolderB/
        └───fileB1.md
`.trim(),
    );
  });

  it('should ignore folders specified in custom ignoredFolders', () => {
    const files = [
      createFile('.hiddenfile'),
      createFile('file1.txt'),
      createFolder('emptyFolder'),
      createFile('node_modules', 'somepackage', 'index.js'),
      createFile('subfolderA', 'fileA1.ts'),
    ]

    const structure = getFolderStructure(testRootDir, files, {
      ignoredFolders: new Set(['subfolderA', 'node_modules']),
    });
    const expected = `
${testRootDir}/
├───.hiddenfile
├───file1.txt
├───emptyFolder/
├───node_modules/
└───subfolderA/
`.trim();
    expect(structure.trim()).toBe(expected);
  });

  it('should filter files by fileIncludePattern', () => {
    const files = [
      createFile('fileA1.ts'),
      createFile('fileA2.js'),
      createFile('subfolderB', 'fileB1.md')
    ]

    const structure = getFolderStructure(testRootDir, files, {
      fileIncludePattern: /\.ts$/,
    });
    const expected = `
${testRootDir}/
├───fileA1.ts
└───subfolderB/
`.trim();
    expect(structure.trim()).toBe(expected);
  });

  it('should not exceed maxDepth', () => {
    const files = [
      createFile('fileA1.ts'),
      createFile('fileA2.js'),
      createFile('subfolderB', 'subfolderB-1', 'subfolderB-2', 'fileB1.md'),
    ]

    const structure = getFolderStructure(testRootDir, files, {
      maxDepth: 4,
    });
    const expected = `
${testRootDir}/
├───fileA1.ts
├───fileA2.js
└───subfolderB/
    └───subfolderB-1/
        └───subfolderB-2/
            └───fileB1.md
`.trim();
    expect(structure.trim()).toBe(expected);

    const structure2 = getFolderStructure(testRootDir, files, {
      maxDepth: 3,
    });

    const expected2 = `
Folders or files indicated with ${TRUNCATION_INDICATOR} contain more items not shown, the display limit (3 depth) was reached    
${testRootDir}/
├───fileA1.ts
├───fileA2.js
└───subfolderB/
    └───subfolderB-1/
        └───subfolderB-2/...
`.trim();
    expect(structure2.trim()).toBe(expected2);
  });

  it('should create parent directories when only files are provided (no explicit folder entries)', () => {
    // 只提供文件，不提供文件夹，测试是否能正确创建父目录结构
    const files = [
      createFile('src', 'components', 'Button.tsx'),
      createFile('src', 'utils', 'helper.ts'),
      createFile('tests', 'unit', 'Button.test.tsx'),
      createFile('README.md'),
    ];

    const structure = getFolderStructure(testRootDir, files);
    const expected = `
${testRootDir}/
├───README.md
├───src/
│   ├───components/
│   │   └───Button.tsx
│   └───utils/
│       └───helper.ts
└───tests/
    └───unit/
        └───Button.test.tsx
`.trim();
    expect(structure.trim()).toBe(expected);
  });

  it('should strip rootDir prefix from file paths when present', () => {
    // 测试文件路径包含rootDir前缀时应该被去除
    const files = [
      { path: `${testRootDir}/src/components/Button.tsx`, type: 'file' as const },
      { path: `${testRootDir}/src/utils/helper.ts`, type: 'file' as const },
      { path: `${testRootDir}/README.md`, type: 'file' as const },
      { path: 'relative/path/file.js', type: 'file' as const }, // 混合相对路径
    ];

    const structure = getFolderStructure(testRootDir, files);
    const expected = `
${testRootDir}/
├───README.md
├───relative/
│   └───path/
│       └───file.js
└───src/
    ├───components/
    │   └───Button.tsx
    └───utils/
        └───helper.ts
`.trim();
    expect(structure.trim()).toBe(expected);
  });

  it('should handle rootDir with trailing slash correctly', () => {
    const rootDirWithSlash = '/home/project/';
    const files = [
      { path: `${rootDirWithSlash}src/index.js`, type: 'file' as const },
      { path: `${rootDirWithSlash}package.json`, type: 'file' as const },
    ];

    const structure = getFolderStructure(rootDirWithSlash, files);
    const expected = `
${rootDirWithSlash}
├───package.json
└───src/
    └───index.js
`.trim();
    expect(structure.trim()).toBe(expected);
  });
});
