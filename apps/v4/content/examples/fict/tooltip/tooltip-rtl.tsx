import { Tooltip, TooltipContent, TooltipProvider, TooltipTriggerEl } from '@/components/ui/tooltip'

export default function TooltipRtlExample() {
  return (
    <TooltipProvider dir="rtl"><Tooltip><TooltipTriggerEl asChild><button type="button">Hover</button></TooltipTriggerEl><TooltipContent>Rtl</TooltipContent></Tooltip></TooltipProvider>
  )
}
