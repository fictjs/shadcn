import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function DatePickerDobExample() {
  let date = $state<Date | null>(null)
  return (
    <label class="grid gap-2">
      Date of birth
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{date ? date.toLocaleDateString() : 'Select date'}</Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Calendar
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear()}
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
