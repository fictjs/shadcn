import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function ResizableHandleExample() {
  return (
    <ResizablePanelGroup direction="horizontal" class="max-w-md">
      <ResizablePanel defaultSize={25} class="flex items-center justify-center"><strong>Sidebar</strong></ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75} class="flex items-center justify-center"><strong>Content</strong></ResizablePanel>
    </ResizablePanelGroup>
  )
}
