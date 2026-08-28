import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function ResizableVerticalExample() {
  return (
    <ResizablePanelGroup orientation="vertical" direction="vertical"><ResizablePanel defaultSize={40}>One</ResizablePanel><ResizableHandle withHandle /><ResizablePanel defaultSize={60}>Two</ResizablePanel></ResizablePanelGroup>
  )
}
