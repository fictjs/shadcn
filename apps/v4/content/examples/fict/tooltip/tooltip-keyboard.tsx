import { Tooltip, TooltipContent, TooltipProvider, TooltipTriggerEl } from '@/components/ui/tooltip'

export default function TooltipKeyboardExample() {
  return (
    <TooltipProvider><Tooltip><TooltipTriggerEl asChild><button type="button">Hover</button></TooltipTriggerEl><TooltipContent>Keyboard</TooltipContent></Tooltip></TooltipProvider>
  )
}
