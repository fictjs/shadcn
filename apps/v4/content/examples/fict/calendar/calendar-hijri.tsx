import { Calendar } from '@/components/ui/calendar'

export default function CalendarHijriExample() {
  let date = $state(new Date(2025, 5, 12))

  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={() => date}
      onSelect={next => { if (next instanceof Date) date = next }}
      locale="fa-IR-u-ca-persian"
      dir="rtl"
    />
  )
}
