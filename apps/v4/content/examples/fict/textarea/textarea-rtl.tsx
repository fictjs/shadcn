import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const translations = {
  ar: { dir: 'rtl', label: 'التعليقات', description: 'شاركنا أفكارك حول خدمتنا.', placeholder: 'تعليقاتك تساعدنا على التحسين...' },
  he: { dir: 'rtl', label: 'משוב', description: 'שתף את מחשבותיך על השירות שלנו.', placeholder: 'המשוב שלך עוזר לנו להשתפר...' },
  en: { dir: 'ltr', label: 'Feedback', description: 'Share your thoughts about our service.', placeholder: 'Your feedback helps us improve...' },
} as const

export default function TextareaRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]

  return (
    <div class="grid gap-2" dir={text().dir}><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><Label for="feedback">{text().label}</Label><p class="text-sm text-muted-foreground">{text().description}</p><Textarea id="feedback" dir={text().dir} placeholder={text().placeholder} rows={4} /></div>
  )
}
