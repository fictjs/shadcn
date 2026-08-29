import { Toggle } from '@/components/ui/toggle'

const translations = {
  ar: { dir: 'rtl', bookmark: 'إشارة مرجعية' },
  he: { dir: 'rtl', bookmark: 'סימנייה' },
  en: { dir: 'ltr', bookmark: 'Bookmark' },
} as const

export default function ToggleRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]

  return (
    <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><Toggle dir={text().dir} variant="outline" size="sm" aria-label="Toggle bookmark">{text().bookmark}</Toggle></div>
  )
}
