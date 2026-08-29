import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const translations = {
  ar: { direction: 'rtl', list: 'قائمة', grid: 'شبكة', cards: 'بطاقات' },
  he: { direction: 'rtl', list: 'רשימה', grid: 'רשת', cards: 'כרטיסים' },
  en: { direction: 'ltr', list: 'List', grid: 'Grid', cards: 'Cards' },
} as const

export default function ToggleGroupRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}>
        <option value="ar">Arabic (العربية)</option>
        <option value="he">Hebrew (עברית)</option>
        <option value="en">English</option>
      </select>
      <ToggleGroup dir={text().direction} variant="outline" type="single" defaultValue="list">
        <ToggleGroupItem value="list" aria-label={text().list}>{text().list}</ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label={text().grid}>{text().grid}</ToggleGroupItem>
        <ToggleGroupItem value="cards" aria-label={text().cards}>{text().cards}</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
