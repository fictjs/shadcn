import { Calendar } from '@/components/ui/calendar'

export default function DatePickerRangeExample() {
  return (
    <div><label class="mb-2 block text-sm font-medium">Picker Range</label><Calendar defaultValue={new Date(2026, 7, 29)} /></div>
  )
}
