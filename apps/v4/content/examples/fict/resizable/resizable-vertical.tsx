import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function ResizableVerticalExample() {
  return (
    <ResizablePanelGroup direction="vertical" class="min-h-[200px] max-w-md">
      <ResizablePanel defaultSize={25} class="flex items-center justify-center"><strong>Header</strong></ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75} class="flex items-center justify-center"><strong>Content</strong></ResizablePanel>
    </ResizablePanelGroup>
  )
}
