import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function TooltipDisabledExample() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild><span class="inline-block w-fit"><Button variant="outline" disabled>Disabled</Button></span></TooltipTrigger>
        <TooltipContent><p>This feature is currently unavailable</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
