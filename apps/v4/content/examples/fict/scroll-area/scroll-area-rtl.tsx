import { ScrollArea, ScrollAreaViewport, ScrollBar } from '@/components/ui/scroll-area'

const translations = {
  ar: { dir: 'rtl', tags: 'العلامات' },
  he: { dir: 'rtl', tags: 'תגיות' },
  en: { dir: 'ltr', tags: 'Tags' },
} as const

const tags = Array.from({ length: 50 }, (_, index) => `v1.2.0-beta.${50 - index}`)

export default function ScrollAreaRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}>
        <option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option>
      </select>
      <ScrollArea dir={text().dir} class="h-72 w-48"><ScrollAreaViewport><div class="p-4"><h4 class="mb-4 text-sm font-medium">{text().tags}</h4>{tags.map(tag => <div class="border-b py-2 text-sm">{tag}</div>)}</div></ScrollAreaViewport><ScrollBar /></ScrollArea>
    </div>
  )
}
