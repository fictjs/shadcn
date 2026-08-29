import { Calendar, type CalendarDateRange } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'

export default function CalendarCustomDaysExample() {
  const year = new Date().getFullYear()
  let range = $state<CalendarDateRange>({ from: new Date(year, 11, 8), to: new Date(year, 11, 18) })

  return (
    <Card class="mx-auto w-fit p-0">
      <CardContent class="p-0">
        <Calendar
          mode="range"
          defaultMonth={range.from}
          selected={() => range}
          onSelect={next => { if (next && !(next instanceof Date)) range = next }}
          captionLayout="dropdown"
          dayContent={(day, modifiers) => <>{day.getDate()}{!modifiers.outside ? <small>{day.getDay() % 6 === 0 ? '$120' : '$100'}</small> : null}</>}
        />
      </CardContent>
    </Card>
  )
}
