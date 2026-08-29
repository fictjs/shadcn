import { Calendar } from '@/components/ui/calendar'

const languages = {
  ar: { dir: 'rtl', locale: 'ar-SA' },
  he: { dir: 'rtl', locale: 'he-IL' },
  en: { dir: 'ltr', locale: 'en-US' },
} as const

export default function CalendarRtlExample() {
  let language = $state<keyof typeof languages>('ar')
  let date = $state(new Date())
  const settings = () => languages[language]

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof languages }}>
        <option value="ar">Arabic (العربية)</option>
        <option value="he">Hebrew (עברית)</option>
        <option value="en">English</option>
      </select>
      <Calendar mode="single" selected={() => date} onSelect={next => { if (next instanceof Date) date = next }} captionLayout="dropdown" dir={settings().dir} locale={() => settings().locale} />
    </div>
  )
}
