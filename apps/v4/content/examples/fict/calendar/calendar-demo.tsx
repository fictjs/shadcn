import { Calendar } from '@/components/ui/calendar'

export default function CalendarDemoExample() {
  let date = $state(new Date())

  return (
    <Calendar
      mode="single"
      selected={() => date}
      onSelect={next => { if (next instanceof Date) date = next }}
      captionLayout="dropdown"
      class="rounded-lg border"
    />
  )
}
