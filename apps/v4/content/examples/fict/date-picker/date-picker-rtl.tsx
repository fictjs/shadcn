import { Calendar } from '@/components/ui/calendar'

export default function DatePickerRtlExample() {
  return (
    <div dir="rtl"><label class="mb-2 block text-sm font-medium">Picker Rtl</label><Calendar defaultValue={new Date(2026, 7, 29)} /></div>
  )
}
