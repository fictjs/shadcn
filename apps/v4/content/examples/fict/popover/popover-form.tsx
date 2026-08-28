import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function PopoverFormExample() {
  return (
    <Popover><PopoverTrigger>Open Form</PopoverTrigger><PopoverContent><p class="text-sm">Configure your preferences.</p><PopoverClose>Close</PopoverClose></PopoverContent></Popover>
  )
}
