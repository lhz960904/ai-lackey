import { ChatInput } from '@/app/components/chat-input';
import { AppSidebar } from '@/app/components/sidebar';
import { ThemeHandle } from '@/app/components/theme-handle';
import Image from 'next/image'
import Link from 'next/link';

export default function Home() {

  return (
    <div className="min-h-screen relative">
      {/* header */}
      <div className='p-2 flex justify-between items-center'>
        <Link className='cursor-pointer' href='/'>
          <Image src="/logo-light.png" alt="logo" width={100} height={32} priority />
        </Link>
        <div>
          <ThemeHandle />
        </div>
      </div>
      {/* main content */}
      <div className='flex gap-2 mx-2'>
        <AppSidebar />
        <div className='bg-white dark:bg-black border rounded-lg pt-40 min-h-[calc(100vh-60px)] flex-1 px-40'>
          <h1 className='text-5xl font-bold text-center text-foreground mb-16'>
            What should we build today?
          </h1>
          <ChatInput placeholder="Tell us and we'll build it together" />
        </div>
      </div>
    </div>

  );
}
