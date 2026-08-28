import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function CollapsibleSettingsExample() {
  return (
    <Collapsible defaultOpen><CollapsibleTrigger>Settings</CollapsibleTrigger><CollapsibleContent><div class="mt-2 rounded-md border p-3">Collapsible content</div></CollapsibleContent></Collapsible>
  )
}
