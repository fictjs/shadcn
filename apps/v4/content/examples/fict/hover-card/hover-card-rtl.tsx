import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTriggerEl } from '@/components/ui/hover-card'

const translations = {
  ar: { dir: 'rtl', sides: ['يسار', 'أعلى', 'أسفل', 'يمين', 'بداية السطر', 'نهاية السطر'], product: 'سماعات لاسلكية', price: '٩٩.٩٩ $' },
  he: { dir: 'rtl', sides: ['שמאל', 'למעלה', 'למטה', 'ימין', 'תחילת השורה', 'סוף השורה'], product: 'אוזניות אלחוטיות', price: '99.99 $' },
  en: { dir: 'ltr', sides: ['Left', 'Top', 'Bottom', 'Right', 'Inline Start', 'Inline End'], product: 'Wireless Headphones', price: '$99.99' },
} as const
const positions = ['left', 'top', 'bottom', 'right', 'inline-start', 'inline-end'] as const

export default function HoverCardRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]
  return <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><div class="flex flex-wrap gap-2" dir={text().dir}>{positions.map((side, index) => <HoverCard openDelay={10} closeDelay={100}><HoverCardTriggerEl asChild><Button variant="outline">{text().sides[index]}</Button></HoverCardTriggerEl><HoverCardContent side={side} dir={text().dir}><strong>{text().product}</strong><p>{text().price}</p></HoverCardContent></HoverCard>)}</div></div>
}
