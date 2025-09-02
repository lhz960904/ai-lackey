import { LanguageModelV2 } from "@ai-sdk/provider";
import { getModel } from "../models";
import { WorkspaceContext } from "../utils/workspace-context";
import { FileDiscoveryService } from "../services/file-discovery";
import path from "node:path";

export interface ConfigParams {
  model: string
  sessionId: string
  targetDir: string;
  includeDirectories?: string[];
  fileDiscoveryService?: FileDiscoveryService
}


export class Config {
  private readonly model: string;
  private readonly sessionId: string;
  private readonly targetDir: string;
  private workspaceContext: WorkspaceContext;
  private fileDiscoveryService: FileDiscoveryService | null = null;

  constructor(params: ConfigParams) {
    this.sessionId = params.sessionId;
    this.model = params.model;
    this.fileDiscoveryService = params.fileDiscoveryService ?? null;
    this.targetDir = path.resolve(params.targetDir)
    this.workspaceContext = new WorkspaceContext(
      this.targetDir,
      params.includeDirectories ?? []
    );
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

  getWorkspaceContext(): WorkspaceContext {
    return this.workspaceContext;
  }

  getFileService(): FileDiscoveryService {
    if (!this.fileDiscoveryService) {
      this.fileDiscoveryService = new FileDiscoveryService(this.targetDir);
    }
    return this.fileDiscoveryService;
  }
}