import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const translations = {
  ar: { button: 'زر', delete: 'حذف', submit: 'إرسال', loading: 'جاري التحميل' },
  he: { button: 'כפתור', delete: 'מחק', submit: 'שלח', loading: 'טוען' },
  en: { button: 'Button', delete: 'Delete', submit: 'Submit', loading: 'Loading' },
} as const

export default function ButtonRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]
  const direction = () => language === 'en' ? 'ltr' : 'rtl'

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}>
        <option value="ar">Arabic (العربية)</option>
        <option value="he">Hebrew (עברית)</option>
        <option value="en">English</option>
      </select>
      <div class="flex flex-wrap items-center gap-2" dir={direction()}>
        <Button variant="outline">{text().button}</Button>
        <Button variant="destructive">{text().delete}</Button>
        <Button variant="outline">{text().submit} →</Button>
        <Button variant="outline" size="icon" aria-label="Add">+</Button>
        <Button variant="secondary" disabled><Spinner />{text().loading}</Button>
      </div>
    </div>
  )
}
