import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function PopoverDemoExample() {
  return (
    <Popover><PopoverTrigger>Open Demo</PopoverTrigger><PopoverContent><p class="text-sm">Configure your preferences.</p><PopoverClose>Close</PopoverClose></PopoverContent></Popover>
  )
}
