import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function PopoverAlignmentsExample() {
  return (
    <div class="flex gap-6">
      {(['start', 'center', 'end'] as const).map(align => (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {align[0].toUpperCase() + align.slice(1)}
            </Button>
          </PopoverTrigger>
          <PopoverContent align={align} class="w-40">
            Aligned to {align}
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}
