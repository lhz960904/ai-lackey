
import { Command, CommandItem, } from "@/components/ui/command"
import { Earth, List } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"

export function AppSidebar() {
  return (
    <div className="w-50 h-[calc(100vh-70px)]">
      <Button variant="outline" className="w-full mb-4 cursor-pointer">New Chat</Button>
      <Command className="h-[calc(100%-36px)]">
        <Link href="/projects">
          <CommandItem>
            <List />
            Projects
          </CommandItem>
        </Link>
        <Link href="/community">
          <CommandItem>
            <Earth />
            <span>Community</span>
          </CommandItem>
        </Link>
      </Command>
    </div >
  )
}