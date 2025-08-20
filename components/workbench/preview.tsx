'use client';

import { WorkbenchStore } from "@/lib/store/workbench";
import { useRef } from "react";
import { useStore } from "zustand";

interface EditorPanelProps {
  workbenchStore: WorkbenchStore
}


export function Preview({ workbenchStore }: EditorPanelProps) {

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewInfo = useStore(workbenchStore.state, (state) => state.previewInfo);

  return (
    <div>
      <iframe src={previewInfo?.baseUrl} ref={iframeRef} className="h-full w-full"></iframe>
    </div>
  )
}