import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function ResizableDemoExample() {
  return (
    <ResizablePanelGroup direction="horizontal"><ResizablePanel defaultSize={40}>One</ResizablePanel><ResizableHandle withHandle /><ResizablePanel defaultSize={60}>Two</ResizablePanel></ResizablePanelGroup>
  )
}
