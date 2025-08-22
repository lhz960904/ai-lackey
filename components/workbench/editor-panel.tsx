import { WorkbenchStore } from "@/lib/store/workbench";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import Terminal from "./terminal";
import { useStore } from "zustand";
import FileTree from "./file-tree";
import { CodeEditor } from "../editor";
import { WORK_DIR } from "@/lib/constant";
import { getLanguageFromFilePath } from "@/lib/utils";
import { FileBreadcrumb } from "./file-breadcrumb";
interface EditorPanelProps {
  workbenchStore: WorkbenchStore
}

export function EditorPanel({ workbenchStore }: EditorPanelProps) {

  const isShowTerminal = useStore(workbenchStore.store, (state) => state.isShowTerminal);
  const files = useStore(workbenchStore.store, (state) => state.files);
  const selectedFile = useStore(workbenchStore.store, (state) => state.selectedFile);
  const selectedFileCode = useStore(workbenchStore.store, (state) => {
    if (!state.selectedFile) return ''
    const file = state.files[state.selectedFile]
    if (file?.type === 'file') {
      return file?.content
    }
    return ''
  });
  const activeFileSegments = selectedFile?.split('/');

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
                  selectedFile={selectedFile}
                  onFileSelect={(filePath) => workbenchStore.onFileSelect(filePath)}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle className="bg-border! w-px" />
            <ResizablePanel defaultSize={75} minSize={60}>
              <div className="h-8 border-b flex items-center px-2">
                {activeFileSegments?.length && (
                  <FileBreadcrumb pathSegments={activeFileSegments} files={files} onFileSelect={(filePath) => workbenchStore.onFileSelect(filePath)} />
                )}
              </div>
              <div className="h-[calc(100%-32px)]">
                <CodeEditor
                  language={getLanguageFromFilePath(selectedFile)}
                  value={selectedFileCode}
                // onChange={handleChange}
                // onSave={handleSave}
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