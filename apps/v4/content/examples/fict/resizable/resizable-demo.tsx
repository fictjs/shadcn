import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function ResizableDemoExample() {
  return (
    <ResizablePanelGroup direction="horizontal" class="max-w-md">
      <ResizablePanel defaultSize={50} class="flex items-center justify-center"><strong>One</strong></ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={25} class="flex items-center justify-center"><strong>Two</strong></ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75} class="flex items-center justify-center"><strong>Three</strong></ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
