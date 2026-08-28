import { Tooltip, TooltipContent, TooltipProvider, TooltipTriggerEl } from '@/components/ui/tooltip'

export default function TooltipDemoExample() {
  return (
    <TooltipProvider><Tooltip><TooltipTriggerEl asChild><button type="button">Hover</button></TooltipTriggerEl><TooltipContent>Demo</TooltipContent></Tooltip></TooltipProvider>
  )
}
