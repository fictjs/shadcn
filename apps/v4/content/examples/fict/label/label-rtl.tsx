import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const translations = { ar: 'قبول الشروط والأحكام', he: 'קבל תנאים והגבלות', en: 'Accept terms and conditions' } as const

export default function LabelRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const direction = () => language === 'en' ? 'ltr' : 'rtl'
  return <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><div class="flex items-center gap-2" dir={direction()}><Checkbox id="label-terms-rtl" /><Label for="label-terms-rtl">{translations[language]}</Label></div></div>
}
