import { Switch } from '@/components/ui/switch'

const translations = {
  ar: {
    dir: 'rtl',
    label: 'المشاركة عبر الأجهزة',
    description: 'يتم مشاركة التركيز عبر الأجهزة، ويتم إيقاف تشغيله عند مغادرة التطبيق.',
  },
  he: {
    dir: 'rtl',
    label: 'שיתוף בין מכשירים',
    description: 'המיקוד משותף בין מכשירים, וכבה כשאתה עוזב את האפליקציה.',
  },
  en: {
    dir: 'ltr',
    label: 'Share across devices',
    description: 'Focus is shared across devices, and turns off when you leave the app.',
  },
} as const

export default function SwitchRtlExample() {
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
      <div class="flex w-full max-w-sm items-center justify-between gap-4" dir={text().dir}>
        <div>
          <label for="switch-focus-mode-rtl" class="font-medium">
            {text().label}
          </label>
          <p class="text-sm text-muted-foreground">{text().description}</p>
        </div>
        <Switch id="switch-focus-mode-rtl" dir={text().dir} />
      </div>
    </div>
  )
}
