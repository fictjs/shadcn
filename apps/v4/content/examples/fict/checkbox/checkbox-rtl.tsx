import { Checkbox } from '@/components/ui/checkbox'

const translations = {
  ar: { dir: 'rtl', terms: 'قبول الشروط والأحكام', termsDescription: 'بالنقر على هذا المربع، فإنك توافق على الشروط.', notifications: 'تفعيل الإشعارات', notificationsDescription: 'يمكنك تفعيل أو إلغاء تفعيل الإشعارات في أي وقت.' },
  he: { dir: 'rtl', terms: 'קבל תנאים והגבלות', termsDescription: 'על ידי לחיצה על תיבת הסימון הזו, אתה מסכים לתנאים.', notifications: 'הפעל התראות', notificationsDescription: 'אתה יכול להפעיל או להשבית התראות בכל עת.' },
  en: { dir: 'ltr', terms: 'Accept terms and conditions', termsDescription: 'By clicking this checkbox, you agree to the terms.', notifications: 'Enable notifications', notificationsDescription: 'You can enable or disable notifications at any time.' },
} as const

export default function CheckboxRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]
  return <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><div class="grid gap-4" dir={text().dir}><label class="flex items-center gap-2"><Checkbox />{text().terms}</label><label class="flex items-start gap-2"><Checkbox defaultChecked /><span><strong>{text().terms}</strong><small class="block">{text().termsDescription}</small></span></label><label class="flex items-center gap-2"><Checkbox disabled />{text().notifications}</label><label class="flex items-start gap-2"><Checkbox /><span><strong>{text().notifications}</strong><small class="block">{text().notificationsDescription}</small></span></label></div></div>
}
