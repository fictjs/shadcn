import { Tooltip, TooltipContent, TooltipProvider, TooltipTriggerEl } from '@/components/ui/tooltip'

export default function TooltipDisabledExample() {
  return (
    <TooltipProvider><Tooltip><TooltipTriggerEl asChild><button type="button">Hover</button></TooltipTriggerEl><TooltipContent>Disabled</TooltipContent></Tooltip></TooltipProvider>
  )
}
