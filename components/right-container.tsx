import { CodeXml, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function RightContainer() {
  return (
    <div className='border rounded-sm h-full bg-white'>
      <Tabs defaultValue="view" >
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
        </div>
        <TabsContent value="view">show view</TabsContent>
        <TabsContent value="code">show source code</TabsContent>
      </Tabs >
    </div >
  )
}