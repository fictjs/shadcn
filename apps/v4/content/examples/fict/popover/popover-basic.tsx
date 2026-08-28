import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function PopoverBasicExample() {
  return (
    <Popover><PopoverTrigger>Open Basic</PopoverTrigger><PopoverContent><p class="text-sm">Configure your preferences.</p><PopoverClose>Close</PopoverClose></PopoverContent></Popover>
  )
}
