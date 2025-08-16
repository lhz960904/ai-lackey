import { ChatInput } from '@/components/chat-input';
import { AppSidebar } from '@/components/sidebar';
import { ThemeHandle } from '@/components/theme-handle';
import Image from 'next/image'
import Link from 'next/link';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ChatContainer } from '@/components/chat-container';

export default async function ChatPage(props: {
  params: Promise<{ id: string }>
}) {
  const { params } = props

  const { id } = await params

  return (
    <div className="min-h-screen relative">
      <div className='p-2 flex justify-between items-center'>
        <Link className='cursor-pointer' href='/'>
          <Image src="/logo-light.png" alt="logo" width={100} height={32} />
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
          <ResizableHandle />
          <ResizablePanel>
            <div className='border rounded-sm h-full bg-white'>
              2
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>

  );
}
