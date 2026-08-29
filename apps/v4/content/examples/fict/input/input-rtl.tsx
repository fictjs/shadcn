import { Input } from '@/components/ui/input'

const translations = {
  ar: { dir: 'rtl', label: 'مفتاح API', description: 'مفتاح API الخاص بك مشفر ومخزن بأمان.' },
  he: { dir: 'rtl', label: 'מפתח API', description: 'מפתח ה-API שלך מוצפן ונשמר בצורה מאובטחת.' },
  en: {
    dir: 'ltr',
    label: 'API Key',
    description: 'Your API key is encrypted and stored securely.',
  },
} as const

export default function InputRtlExample() {
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
      <div class="grid w-80 gap-2" dir={text().dir}>
        <label for="input-rtl">{text().label}</label>
        <Input id="input-rtl" type="password" placeholder="sk-..." dir={text().dir} />
        <p class="text-sm text-muted-foreground">{text().description}</p>
      </div>
    </div>
  )
}
