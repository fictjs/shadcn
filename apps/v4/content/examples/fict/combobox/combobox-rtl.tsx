import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue } from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'

const translations = {
  ar: { dir: 'rtl', label: 'الفئات', placeholder: 'أضف فئات', empty: 'لم يتم العثور على فئات.', values: ['التكنولوجيا', 'التصميم', 'الأعمال'] },
  he: { dir: 'rtl', label: 'קטגוריות', placeholder: 'הוסף קטגוריות', empty: 'לא נמצאו קטגוריות.', values: ['טכנולוגיה', 'עיצוב', 'עסקים'] },
  en: { dir: 'ltr', label: 'Categories', placeholder: 'Add categories', empty: 'No categories found.', values: ['Technology', 'Design', 'Business'] },
} as const

export default function ComboboxRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]

  return (
    <Field dir={text().dir} class="mx-auto w-full max-w-xs">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <FieldLabel>{text().label}</FieldLabel>
      <Combobox multiple autoHighlight defaultValue={['technology']}>
        <ComboboxChips><ComboboxValue>{values => <>{values.map(value => <ComboboxChip value={value}>{text().values[['technology', 'design', 'business'].indexOf(value)]}</ComboboxChip>)}<ComboboxChipsInput placeholder={text().placeholder} /></>}</ComboboxValue></ComboboxChips>
        <ComboboxContent dir={text().dir}><ComboboxEmpty>{text().empty}</ComboboxEmpty><ComboboxList>{['technology', 'design', 'business'].map((value, index) => <ComboboxItem value={value}>{text().values[index]}</ComboboxItem>)}</ComboboxList></ComboboxContent>
      </Combobox>
    </Field>
  )
}
