import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function CollapsibleRtlExample() {
  return (
    <Collapsible dir="rtl" defaultOpen><CollapsibleTrigger>Rtl</CollapsibleTrigger><CollapsibleContent><div class="mt-2 rounded-md border p-3">Collapsible content</div></CollapsibleContent></Collapsible>
  )
}
