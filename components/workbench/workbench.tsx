'use client';

import { CodeXml, Eye, SquareTerminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useEffect, useState } from "react";
import '@xterm/xterm/css/xterm.css';
import { Preview } from "./preview";
import { EditorPanel } from "./editor-panel";
import { WorkbenchStore } from "@/lib/store/workbench";
import { WebContainer } from "@webcontainer/api";
import { WORK_DIR_NAME } from "@/lib/constant";
import { files } from "./filts";
import { Button } from "../ui/button";


export function Workbench() {
  const [workbenchStore, setWorkbenchStore] = useState<WorkbenchStore | null>(null);

  const init = async () => {
    const webContainer = await WebContainer.boot({ workdirName: WORK_DIR_NAME });
    webContainer.mount(files)
    webContainer.on('port', (port, type, url) => {
      console.log(`Port ${port} of type ${type} is now available at ${url}`);
    })
    const store = new WorkbenchStore(webContainer);
    setWorkbenchStore(store);
  }

  useEffect(() => { init() }, [])

  return (
    <div className='border rounded-sm h-full bg-white dark:bg-[#171717]'>
      <Tabs defaultValue="code" className="h-full gap-0">
        <div className="border-b py-2 px-3 flex justify-between items-center">
          <TabsList>
            <Tooltip>
              <TooltipTrigger>
                <TabsTrigger value="view">
                  <Eye />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <TabsTrigger value="code">
                  <CodeXml />
                </TabsTrigger>
                <TooltipContent>code</TooltipContent>
              </TooltipTrigger>
            </Tooltip>
          </TabsList>
          <div>
            <Button variant="ghost" size="sm" onClick={() => workbenchStore?.toggleTerminal()}>
              <SquareTerminal />
            </Button>
          </div>
        </div>
        <div className="h-full relative">
          <TabsContent value="view" className="h-full" forceMount>
            {workbenchStore && <Preview workbenchStore={workbenchStore} />}
          </TabsContent>
          <TabsContent value="code" className="h-full" forceMount>
            {workbenchStore && <EditorPanel workbenchStore={workbenchStore} />}
          </TabsContent>
        </div>
      </Tabs >
    </div >
  )
}