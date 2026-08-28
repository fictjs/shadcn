import { Calendar } from '@/components/ui/calendar'

export default function DatePickerBasicExample() {
  return (
    <div><label class="mb-2 block text-sm font-medium">Picker Basic</label><Calendar defaultValue={new Date(2026, 7, 29)} /></div>
  )
}
