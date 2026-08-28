import { Calendar } from '@/components/ui/calendar'

export default function CalendarDemoExample() {
  return (
    <Calendar defaultValue={new Date(2026, 7, 29)} defaultMonth={new Date(2026, 7, 1)} />
  )
}
