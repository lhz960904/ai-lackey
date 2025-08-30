import { ThemeHandle } from '@/components/theme-handle';
import Image from 'next/image'
import Link from 'next/link';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ChatContainer } from '@/components/chat-container';
import { Workbench } from '@/components/workbench/workbench';

export default async function ChatPage(props: {
  params: Promise<{ id: string }>
}) {
  const { params } = props

  const { id } = await params

  return (
    <div className="min-h-screen relative">
      <div className='p-2 flex justify-between items-center'>
        <Link className='cursor-pointer' href='/'>
          <Image src="/logo-light.png" alt="logo" width={100} height={32} priority />
        </Link>
        <div>
          <ThemeHandle />
        </div>
      </div>
      <div className='h-[calc(100vh-60px)] px-2'>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={20} defaultSize={30}>
            <ChatContainer />
          </ResizablePanel>
          <ResizableHandle className="mx-[2px] h-[94%] mt-[2%] rounded" />
          <ResizablePanel defaultSize={70} minSize={50}>
            <Workbench />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>

  );
}
