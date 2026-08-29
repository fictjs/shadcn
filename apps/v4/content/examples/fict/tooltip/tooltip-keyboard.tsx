import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function SaveIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M15.2 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.8zM17 21v-8H7v8M7 3v5h8" /></svg>
}

export default function TooltipKeyboardExample() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="outline" size="icon-sm" aria-label="Save changes"><SaveIcon /></Button></TooltipTrigger>
        <TooltipContent class="pr-1.5"><div class="flex items-center gap-2">Save Changes <Kbd>S</Kbd></div></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
