import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

const translations = {
  ar: {
    dir: 'rtl',
    options: [
      ['', 'اختر الحالة'],
      ['todo', 'مهام'],
      ['in-progress', 'قيد التنفيذ'],
      ['done', 'منجز'],
      ['cancelled', 'ملغي'],
    ],
  },
  he: {
    dir: 'rtl',
    options: [
      ['', 'בחר סטטוס'],
      ['todo', 'לעשות'],
      ['in-progress', 'בתהליך'],
      ['done', 'הושלם'],
      ['cancelled', 'בוטל'],
    ],
  },
  en: {
    dir: 'ltr',
    options: [
      ['', 'Select status'],
      ['todo', 'Todo'],
      ['in-progress', 'In Progress'],
      ['done', 'Done'],
      ['cancelled', 'Cancelled'],
    ],
  },
} as const

export default function NativeSelectRtlExample() {
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
      <NativeSelect dir={text().dir}>
        {text().options.map(([value, label]) => (
          <NativeSelectOption value={value}>{label}</NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}
