import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

function ChevronDownIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg> }

export default function CollapsibleBasicExample() {
  return <Card class="w-full max-w-sm"><CardContent><Collapsible class="rounded-md data-[state=open]:bg-muted"><CollapsibleTrigger asChild><Button variant="ghost" class="group w-full">Product details<ChevronDownIcon /></Button></CollapsibleTrigger><CollapsibleContent class="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm"><div>This panel can be expanded or collapsed to reveal additional content.</div><Button size="xs">Learn More</Button></CollapsibleContent></Collapsible></CardContent></Card>
}
