import { Calendar } from '@/components/ui/calendar'

export default function CalendarRtlExample() {
  return (
    <Calendar dir="rtl" defaultValue={new Date(2026, 7, 29)} defaultMonth={new Date(2026, 7, 1)} />
  )
}
