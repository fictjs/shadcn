import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function DatePickerBasicExample() {
  let date = $state<Date | null>(null)
  return (
    <label class="grid gap-2">
      Date
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{date ? date.toLocaleDateString() : 'Pick a date'}</Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Calendar
            value={() => date}
            onValueChange={value => {
              date = value as Date
            }}
          />
        </PopoverContent>
      </Popover>
    </label>
  )
}
