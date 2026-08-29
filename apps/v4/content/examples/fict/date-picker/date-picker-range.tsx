import { Button } from '@/components/ui/button'
import { Calendar, type CalendarDateRange } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function DatePickerRangeExample() {
  const year = new Date().getFullYear()
  let range = $state<CalendarDateRange>({ from: new Date(year, 0, 20), to: new Date(year, 1, 9) })
  return (
    <label class="grid gap-2">
      Date Picker Range
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            Jan 20, {year} - Feb 09, {year}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Calendar
            mode="range"
            numberOfMonths={2}
            value={() => range}
            onValueChange={value => {
              range = value as CalendarDateRange
            }}
          />
        </PopoverContent>
      </Popover>
    </label>
  )
}
