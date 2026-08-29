import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const translations = {
  ar: { dir: 'rtl', pick: 'اختر تاريخًا' },
  he: { dir: 'rtl', pick: 'בחר תאריך' },
  en: { dir: 'ltr', pick: 'Pick a date' },
} as const

export default function DatePickerRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]
  return (
    <div class="grid gap-4">
      <select
        value={language}
        onChange={event => {
          language = event.currentTarget.value as keyof typeof translations
        }}
      >
        <option value="ar">Arabic (العربية)</option>
        <option value="he">Hebrew (עברית)</option>
        <option value="en">English</option>
      </select>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" dir={text().dir}>
            {text().pick}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" dir={text().dir}>
          <Calendar dir={text().dir} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
