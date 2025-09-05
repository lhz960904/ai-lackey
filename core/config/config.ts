import { LanguageModelV2 } from "@ai-sdk/provider";
import { getModel } from "../models";
import path from "node:path";
import { FileInfo } from "../utils/get-folder-structure";

export interface ConfigParams {
  model: string
  sessionId: string
  targetDir: string;
  files: FileInfo[];
}

export class Config {
  private readonly model: string;
  private readonly sessionId: string;
  private readonly targetDir: string;
  private readonly files: FileInfo[];

  constructor(params: ConfigParams) {
    this.sessionId = params.sessionId;
    this.model = params.model;
    this.targetDir = path.resolve(params.targetDir)
    this.files = params.files;
  }

  getAllFiles(): FileInfo[] {
    return this.files;
  }

  getTargetDir(): string {
    return this.targetDir;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getModel(): LanguageModelV2 {
    return getModel(this.model)
  }
}