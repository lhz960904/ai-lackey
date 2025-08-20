import { WorkbenchStore } from "@/lib/store/workbench";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import Terminal from "./terminal";
import { Textarea } from "../ui/textarea";
import { files } from "./filts";
// import dynamic from "next/dynamic";

// const Terminal = dynamic(() => import('./terminal'), { ssr: false })

interface EditorPanelProps {
  workbenchStore: WorkbenchStore
}

export function EditorPanel({ workbenchStore }: EditorPanelProps) {

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={60} minSize={20}>
          <Textarea
            className="h-full w-full"
            defaultValue={files["index.js"].file.contents}
            onInput={(e) => {
              const target = (e.target as HTMLTextAreaElement).value
              console.log('value', target);
              workbenchStore.saveFile('/index.js', target);
            }}
          />
        </ResizablePanel>
        <ResizableHandle className="border hover:h-4" />
        <ResizablePanel defaultSize={40} minSize={20}>
          <Terminal
            onTerminalReady={(terminal) => {
              workbenchStore.attachTerminal(terminal)
            }}
            onTerminalResize={(cols, rows) => workbenchStore.onTerminalResize(cols, rows)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}