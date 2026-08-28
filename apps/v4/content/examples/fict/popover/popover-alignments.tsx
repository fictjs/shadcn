import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function PopoverAlignmentsExample() {
  return (
    <Popover><PopoverTrigger>Open Alignments</PopoverTrigger><PopoverContent><p class="text-sm">Configure your preferences.</p><PopoverClose>Close</PopoverClose></PopoverContent></Popover>
  )
}
