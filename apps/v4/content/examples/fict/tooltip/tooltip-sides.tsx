import { Tooltip, TooltipContent, TooltipProvider, TooltipTriggerEl } from '@/components/ui/tooltip'

export default function TooltipSidesExample() {
  return (
    <TooltipProvider><Tooltip><TooltipTriggerEl asChild><button type="button">Hover</button></TooltipTriggerEl><TooltipContent>Sides</TooltipContent></Tooltip></TooltipProvider>
  )
}
