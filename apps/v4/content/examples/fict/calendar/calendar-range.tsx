import { Calendar, type CalendarDateRange } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'

export default function CalendarRangeExample() {
  const year = new Date().getFullYear()
  let range = $state<CalendarDateRange>({
    from: new Date(year, 0, 12),
    to: new Date(year, 1, 11),
  })

  return (
    <Card class="mx-auto w-fit p-0">
      <CardContent class="p-0">
        <Calendar
          mode="range"
          defaultMonth={range.from}
          selected={() => range}
          onSelect={next => { if (next && !(next instanceof Date)) range = next }}
          numberOfMonths={2}
        />
      </CardContent>
    </Card>
  )
}
