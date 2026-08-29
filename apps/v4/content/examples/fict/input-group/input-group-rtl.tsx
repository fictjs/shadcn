import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'

const translations = {
  ar: {
    dir: 'rtl',
    search: 'بحث...',
    results: '١٢ نتيجة',
    searching: 'جاري البحث...',
    saving: 'جاري حفظ التغييرات...',
    savingStatus: 'جاري الحفظ...',
    textarea: 'منطقة النص',
    comment: 'اكتب تعليقًا...',
    post: 'نشر',
    footer: 'تذييل موضع أسفل منطقة النص.',
  },
  he: {
    dir: 'rtl',
    search: 'חפש...',
    results: '12 תוצאות',
    searching: 'מחפש...',
    saving: 'שומר שינויים...',
    savingStatus: 'שומר...',
    textarea: 'אזור טקסט',
    comment: 'כתוב תגובה...',
    post: 'פרסם',
    footer: 'כותרת תחתונה ממוקמת מתחת לאזור הטקסט.',
  },
  en: {
    dir: 'ltr',
    search: 'Search...',
    results: '12 results',
    searching: 'Searching...',
    saving: 'Saving changes...',
    savingStatus: 'Saving...',
    textarea: 'Textarea',
    comment: 'Write a comment...',
    post: 'Post',
    footer: 'Footer positioned below the textarea.',
  },
} as const

export default function InputGroupRtlExample() {
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
      <div class="grid gap-3" dir={text().dir}>
        <InputGroup>
          <InputGroupInput placeholder={text().search} dir={text().dir} />
          <InputGroupAddon align="inline-end">{text().results}</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder={text().searching} dir={text().dir} />
          <InputGroupAddon align="inline-end">
            <Spinner />
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder={text().saving} dir={text().dir} />
          <InputGroupAddon align="inline-end">
            <Spinner />
            {text().savingStatus}
          </InputGroupAddon>
        </InputGroup>
        <label class="grid gap-2">
          {text().textarea}
          <InputGroup>
            <InputGroupTextarea placeholder={text().comment} dir={text().dir} />
            <InputGroupAddon align="block-end">
              <span>0/280</span>
              <InputGroupButton class="ml-auto">{text().post}</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <small>{text().footer}</small>
        </label>
      </div>
    </div>
  )
}
