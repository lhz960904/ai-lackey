import { WorkbenchStore } from "@/lib/store/workbench";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import Terminal from "./terminal";
import { useStore } from "zustand";
import FileTree from "./file-tree";
import { CodeEditor } from "../editor";
import { WORK_DIR } from "@/lib/constant";
import { getLanguageFromFilePath } from "@/lib/utils";
import { FileBreadcrumb } from "./file-breadcrumb";
import { RotateCcw, Save } from "lucide-react";
import { Button } from "../ui/button";
import { useCallback } from "react";
import { toast } from "sonner";
interface EditorPanelProps {
  workbenchStore: WorkbenchStore
}

export function EditorPanel({ workbenchStore }: EditorPanelProps) {

  const isShowTerminal = useStore(workbenchStore.store, (state) => state.isShowTerminal);
  const files = useStore(workbenchStore.store, (state) => state.files);
  const currentFile = useStore(workbenchStore.store, (state) => state.currentFile);
  const activeFileSegments = currentFile?.filePath.split('/');
  const unsavedFiles = useStore(workbenchStore.store, (state) => state.unsavedFiles);

  const onFileSave = useCallback(async () => {
    try {
      await workbenchStore.saveCurrentFileContent();
      toast.success("Save Changes")
    } catch {
      toast.success("Failed to update file content")
    }
  }, [workbenchStore]);

  const onFileReset = useCallback(() => {
    workbenchStore.resetCurrentFileContent();
  }, [workbenchStore]);

  const onEditorChange = useCallback((content?: string) => {
    workbenchStore.setCurrentFileContent(content);
  }, [workbenchStore]);

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={60} minSize={20}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="overflow-y-auto h-full">
                <FileTree
                  files={files}
                  hideRoot
                  rootFolder={WORK_DIR}
                  selectedFile={currentFile?.filePath}
                  onFileSelect={(filePath) => workbenchStore.onFileSelect(filePath)}
                  unsavedFiles={Array.from(unsavedFiles.keys())}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle className="bg-border! w-px" />
            <ResizablePanel defaultSize={75} minSize={60}>
              <div className="h-8 border-b flex items-center justify-between px-2">
                {activeFileSegments?.length && (
                  <FileBreadcrumb pathSegments={activeFileSegments} files={files} onFileSelect={(filePath) => workbenchStore.onFileSelect(filePath)} />
                )}
                {unsavedFiles.has(currentFile?.filePath || '') && (
                  <div>
                    <Button variant="ghost" onClick={onFileSave}><Save />Save</Button>
                    <Button variant="ghost" onClick={onFileReset}><RotateCcw />Reset</Button>
                  </div>
                )}
              </div>
              <div className="h-[calc(100%-32px)]">
                <CodeEditor
                  language={getLanguageFromFilePath(currentFile?.filePath)}
                  value={currentFile?.content}
                  onChange={onEditorChange}
                  onSave={onFileSave}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle className="bg-border!" hidden={!isShowTerminal} />
        <ResizablePanel defaultSize={40} minSize={20} hidden={!isShowTerminal}>
          <Terminal
            onTerminalReady={(terminal) => {
              workbenchStore.attachTerminal(terminal)
            }}
            onTerminalResize={(cols, rows) => workbenchStore.onTerminalResize(cols, rows)}
            onTerminalClose={workbenchStore.toggleTerminal}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}