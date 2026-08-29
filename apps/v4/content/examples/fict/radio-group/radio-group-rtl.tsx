import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const translations = {
  ar: {
    dir: 'rtl',
    options: [
      ['default', 'افتراضي', 'تباعد قياسي لمعظم حالات الاستخدام.'],
      ['comfortable', 'مريح', 'مساحة أكبر بين العناصر.'],
      ['compact', 'مضغوط', 'تباعد أدنى للتخطيطات الكثيفة.'],
    ],
  },
  he: {
    dir: 'rtl',
    options: [
      ['default', 'ברירת מחדל', 'ריווח סטנדרטי לרוב מקרי השימוש.'],
      ['comfortable', 'נוח', 'יותר מקום בין האלמנטים.'],
      ['compact', 'קומפקטי', 'ריווח מינימלי לפריסות צפופות.'],
    ],
  },
  en: {
    dir: 'ltr',
    options: [
      ['default', 'Default', 'Standard spacing for most use cases.'],
      ['comfortable', 'Comfortable', 'More space between elements.'],
      ['compact', 'Compact', 'Minimal spacing for dense layouts.'],
    ],
  },
} as const

export default function RadioGroupRtlExample() {
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
      <RadioGroup defaultValue="comfortable" class="grid gap-4" dir={text().dir}>
        {text().options.map(([value, label, description]) => (
          <label class="flex items-start gap-3">
            <RadioGroupItem value={value} dir={text().dir} />
            <span>
              <strong class="block">{label}</strong>
              <small>{description}</small>
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
