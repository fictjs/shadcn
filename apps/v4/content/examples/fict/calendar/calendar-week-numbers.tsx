import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'

export default function CalendarWeekNumbersExample() {
  const year = new Date().getFullYear()
  let date = $state(new Date(year, 1, 3))

  return (
    <Card class="mx-auto w-fit p-0">
      <CardContent class="p-0">
        <Calendar mode="single" defaultMonth={date} selected={() => date} onSelect={next => { if (next instanceof Date) date = next }} showWeekNumber />
      </CardContent>
    </Card>
  )
}
