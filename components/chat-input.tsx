'use client'

import { Paperclip, Send, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"


export interface ChatInputProps {
  placeholder?: string
}

export function ChatInput(props: ChatInputProps) {

  const [value, setValue] = useState('')

  const { placeholder } = props

  return (
    <div className="w-full border rounded-lg">
      <textarea placeholder={placeholder} className="w-full px-4 py-3 resize-none outline-none"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}>
      </textarea>
      <div className="p-2 flex justify-between">
        <div>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="sm" >
                <Paperclip />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Attach Images, PDF, etc.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="sm" >
                <Sparkles />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Enhance prompt
            </TooltipContent>
          </Tooltip>
        </div>
        <Button variant="secondary" size="sm" disabled={!value.trim()}>
          <Send />
        </Button>
      </div>
    </div>
  )
}