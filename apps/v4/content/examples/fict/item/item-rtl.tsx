import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'

const translations = {
  ar: { dir: 'rtl', basic: 'عنصر أساسي', description: 'عنصر بسيط يحتوي على عنوان ووصف.', action: 'إجراء', verified: 'تم التحقق من ملفك الشخصي.' },
  he: { dir: 'rtl', basic: 'פריט בסיסי', description: 'פריט פשוט עם כותרת ותיאור.', action: 'פעולה', verified: 'הפרופיל שלך אומת.' },
  en: { dir: 'ltr', basic: 'Basic Item', description: 'A simple item with title and description.', action: 'Action', verified: 'Your profile has been verified.' },
} as const

export default function ItemRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const t = translations[language]
  return (
    <div><select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><ItemGroup class="w-md" dir={t.dir}><Item variant="outline"><ItemContent><ItemTitle>{t.basic}</ItemTitle><ItemDescription>{t.description}</ItemDescription></ItemContent><ItemActions><Button variant="outline" size="sm">{t.action}</Button></ItemActions></Item><Item variant="outline" size="sm" asChild><a href="#"><ItemMedia>✓</ItemMedia><ItemContent><ItemTitle>{t.verified}</ItemTitle></ItemContent><ItemActions>›</ItemActions></a></Item></ItemGroup></div>
  )
}
