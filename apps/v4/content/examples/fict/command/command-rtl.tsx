import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'

const translations = {
  ar: { dir: 'rtl', placeholder: 'اكتب أمرًا أو ابحث...', empty: 'لم يتم العثور على نتائج.', suggestions: 'اقتراحات', settings: 'الإعدادات', items: ['التقويم', 'البحث عن الرموز التعبيرية', 'الآلة الحاسبة', 'الملف الشخصي', 'الفوترة', 'الإعدادات'] },
  he: { dir: 'rtl', placeholder: 'הקלד פקודה או חפש...', empty: 'לא נמצאו תוצאות.', suggestions: 'הצעות', settings: 'הגדרות', items: ['לוח שנה', "חפש אמוג'י", 'מחשבון', 'פרופיל', 'חיוב', 'הגדרות'] },
  en: { dir: 'ltr', placeholder: 'Type a command or search...', empty: 'No results found.', suggestions: 'Suggestions', settings: 'Settings', items: ['Calendar', 'Search Emoji', 'Calculator', 'Profile', 'Billing', 'Settings'] },
} as const

export default function CommandRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const t = translations[language]
  return (
    <div>
      <select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <Command dir={t.dir} class="w-96 rounded-lg border"><CommandInput placeholder={t.placeholder} /><CommandList><CommandEmpty>{t.empty}</CommandEmpty><CommandGroup heading={t.suggestions}>{t.items.slice(0, 3).map((item, index) => <CommandItem value={String(index)} disabled={index === 2}>{item}</CommandItem>)}</CommandGroup><CommandSeparator /><CommandGroup heading={t.settings}>{t.items.slice(3).map((item, index) => <CommandItem value={String(index + 3)}>{item}</CommandItem>)}</CommandGroup></CommandList></Command>
    </div>
  )
}
