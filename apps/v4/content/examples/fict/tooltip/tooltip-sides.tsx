import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const sides = ['left', 'top', 'bottom', 'right'] as const

export default function TooltipSidesExample() {
  return (
    <TooltipProvider>
      <div class="flex flex-wrap gap-2">
        {sides.map(side => (
          <Tooltip>
            <TooltipTrigger asChild><Button variant="outline" class="w-fit capitalize">{side}</Button></TooltipTrigger>
            <TooltipContent side={side}><p>Add to library</p></TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
