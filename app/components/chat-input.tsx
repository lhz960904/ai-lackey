'use client'

import { CirclePause, Paperclip, Send, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"


export interface ChatInputProps {
  loading?: boolean
  streaming?: boolean
  placeholder?: string
  onSubmit?: (value?: string) => void
  onStop?: () => void
}

export function ChatInput(props: ChatInputProps) {
  const { placeholder, loading, streaming, onSubmit, onStop } = props

  const [value, setValue] = useState('')

  const disabled = !value.trim()

  const handleSubmit = () => {
    onSubmit?.(value)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full border rounded-lg">
      <textarea
        placeholder={placeholder}
        className="w-full px-4 py-3 resize-none outline-none"
        onKeyDown={handleKeyDown}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}>
      </textarea>
      <div className="p-2 flex justify-between">
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Paperclip />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Attach Images, PDF, etc.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Sparkles />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Enhance prompt
            </TooltipContent>
          </Tooltip>
        </div>
        {streaming || loading ? (
          <Button variant={loading ? 'secondary' : 'default'} size="sm" onClick={onStop} disabled={loading}>
            <CirclePause />
            Stop
          </Button>
        ) : (
          <Button variant={disabled ? 'secondary' : 'default'} size="sm" disabled={disabled} onClick={handleSubmit} >
            <Send />
          </Button>
        )}
      </div>
    </div >
  )
}