import { Calendar } from '@/components/ui/calendar'

export default function CalendarWeekNumbersExample() {
  return (
    <Calendar defaultValue={new Date(2026, 7, 29)} defaultMonth={new Date(2026, 7, 1)} />
  )
}
