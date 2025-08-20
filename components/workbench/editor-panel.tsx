import { WorkbenchStore } from "@/lib/store/workbench";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import Terminal from "./terminal";
import { Textarea } from "../ui/textarea";
import { files } from "./filts";
import { useStore } from "zustand";
import { FileTree } from "./file-tree";
import { CodeEditor } from "../editor";
interface EditorPanelProps {
  workbenchStore: WorkbenchStore
}

export function EditorPanel({ workbenchStore }: EditorPanelProps) {

  const isShowTerminal = useStore(workbenchStore.state, (state) => state.isShowTerminal);
  const toggleTerminal = useStore(workbenchStore.state, (state) => state.toggleTerminal);


  return (
    <div className="h-full">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={60} minSize={20}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={25} minSize={20}>
              <FileTree />
            </ResizablePanel>
            <ResizableHandle className="bg-border! w-px" />
            <ResizablePanel defaultSize={75} minSize={60}>
              <CodeEditor
                language={"javascript"}
                value={files["index.js"].file.contents}
              // onChange={handleChange}
              // onSave={handleSave}
              />
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
            onTerminalClose={toggleTerminal}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}