import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function DatePickerTimeExample() {
  return (
    <div class="grid grid-cols-2 gap-4">
      <label class="grid gap-2">
        Date
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Select date</Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar />
          </PopoverContent>
        </Popover>
      </label>
      <label class="grid gap-2">
        Time
        <Input type="time" step="1" defaultValue="10:30:00" />
      </label>
    </div>
  )
}
