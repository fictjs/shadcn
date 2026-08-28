import { RangeCalendar } from '@/components/ui/range-calendar'

export default function RangeCalendarDemoExample() {
  return (
    <RangeCalendar
      startMonth={new Date(2026, 7, 1)}
      endMonth={new Date(2026, 8, 1)}
    />
  )
}
