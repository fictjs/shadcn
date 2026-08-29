import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

const translations = {
  ar: { dir: 'rtl', buttons: ['أرشفة', 'تقرير', 'تأجيل'] },
  he: { dir: 'rtl', buttons: ['ארכיון', 'דוח', 'דחה'] },
  en: { dir: 'ltr', buttons: ['Archive', 'Report', 'Snooze'] },
} as const

export default function ButtonGroupRtlExample() {
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
      <ButtonGroup dir={text().dir}>
        {text().buttons.map(label => (
          <Button variant="outline">{label}</Button>
        ))}
      </ButtonGroup>
    </div>
  )
}
