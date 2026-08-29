import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTriggerEl } from '@/components/ui/tooltip'

export default function KbdTooltipExample() {
  return <TooltipProvider><div class="flex"><Tooltip><TooltipTriggerEl asChild><Button variant="outline">Save</Button></TooltipTriggerEl><TooltipContent>Save Changes <Kbd>S</Kbd></TooltipContent></Tooltip><Tooltip><TooltipTriggerEl asChild><Button variant="outline">Print</Button></TooltipTriggerEl><TooltipContent>Print Document <KbdGroup><Kbd>Ctrl</Kbd><Kbd>P</Kbd></KbdGroup></TooltipContent></Tooltip></div></TooltipProvider>
}
