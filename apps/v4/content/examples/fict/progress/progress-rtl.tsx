import { Progress } from '@/components/ui/progress'

const translations = {
  ar: { dir: 'rtl', label: 'تقدم الرفع', value: '٦٦%' },
  he: { dir: 'rtl', label: 'התקדמות העלאה', value: '66%' },
  en: { dir: 'ltr', label: 'Upload progress', value: '66%' },
} as const

export default function ProgressRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]
  return <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><div class="grid w-full max-w-sm gap-2" dir={text().dir}><label for="upload-progress-rtl" class="flex justify-between"><span>{text().label}</span><span>{text().value}</span></label><Progress id="upload-progress-rtl" value={66} max={100} /></div></div>
}
