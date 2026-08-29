import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

const presets = [
  ['Today', 0],
  ['Tomorrow', 1],
  ['In 3 days', 3],
  ['In a week', 7],
  ['In 2 weeks', 14],
] as const

export default function CalendarPresetsExample() {
  let date = $state(new Date())
  let month = $state(new Date(date.getFullYear(), date.getMonth(), 1))

  return (
    <Card class="mx-auto w-fit max-w-[300px]" size="sm">
      <CardContent>
        <Calendar mode="single" selected={() => date} onSelect={next => { if (next instanceof Date) date = next }} month={() => month} onMonthChange={next => { month = next }} fixedWeeks class="border-0 p-0" />
      </CardContent>
      <CardFooter class="flex flex-wrap gap-2 border-t">
        {presets.map(([label, offset]) => <Button variant="outline" size="sm" class="flex-1" onClick={() => { const next = new Date(); next.setDate(next.getDate() + offset); date = next; month = new Date(next.getFullYear(), next.getMonth(), 1) }}>{label}</Button>)}
      </CardFooter>
    </Card>
  )
}
