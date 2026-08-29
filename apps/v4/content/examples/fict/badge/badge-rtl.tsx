import { Badge } from '@/components/ui/badge'

const translations = {
  ar: ['شارة', 'ثانوي', 'مدمر', 'مخطط', 'متحقق', 'إشارة مرجعية'],
  he: ['תג', 'משני', 'הרסני', 'קווי מתאר', 'מאומת', 'סימנייה'],
  en: ['Badge', 'Secondary', 'Destructive', 'Outline', 'Verified', 'Bookmark'],
} as const

function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m7 12 3 3 7-7" /></svg>
}

function BookmarkIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z" /></svg>
}

export default function BadgeRtlExample() {
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
      <div class="flex flex-wrap justify-center gap-2" dir={direction()}>
        <Badge>{text()[0]}</Badge>
        <Badge variant="secondary">{text()[1]}</Badge>
        <Badge variant="destructive">{text()[2]}</Badge>
        <Badge variant="outline">{text()[3]}</Badge>
        <Badge variant="secondary"><CheckIcon />{text()[4]}</Badge>
        <Badge variant="outline">{text()[5]}<BookmarkIcon /></Badge>
      </div>
    </div>
  )
}
