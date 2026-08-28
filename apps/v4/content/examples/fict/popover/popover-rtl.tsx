import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function PopoverRtlExample() {
  return (
    <Popover dir="rtl"><PopoverTrigger>Open Rtl</PopoverTrigger><PopoverContent><p class="text-sm">Configure your preferences.</p><PopoverClose>Close</PopoverClose></PopoverContent></Popover>
  )
}
