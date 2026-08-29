import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const translations = {
  ar: {
    dir: 'rtl',
    placeholder: 'اختر فاكهة',
    groups: [
      [
        'الفواكه',
        [
          ['apple', 'تفاح'],
          ['banana', 'موز'],
          ['blueberry', 'توت أزرق'],
          ['grapes', 'عنب'],
          ['pineapple', 'أناناس'],
        ],
      ],
      [
        'الخضروات',
        [
          ['carrot', 'جزر'],
          ['broccoli', 'بروكلي'],
          ['spinach', 'سبانخ'],
        ],
      ],
    ],
  },
  he: {
    dir: 'rtl',
    placeholder: 'בחר פרי',
    groups: [
      [
        'פירות',
        [
          ['apple', 'תפוח'],
          ['banana', 'בננה'],
          ['blueberry', 'אוכמניה'],
          ['grapes', 'ענבים'],
          ['pineapple', 'אננס'],
        ],
      ],
      [
        'ירקות',
        [
          ['carrot', 'גזר'],
          ['broccoli', 'ברוקולי'],
          ['spinach', 'תרד'],
        ],
      ],
    ],
  },
  en: {
    dir: 'ltr',
    placeholder: 'Select a fruit',
    groups: [
      [
        'Fruits',
        [
          ['apple', 'Apple'],
          ['banana', 'Banana'],
          ['blueberry', 'Blueberry'],
          ['grapes', 'Grapes'],
          ['pineapple', 'Pineapple'],
        ],
      ],
      [
        'Vegetables',
        [
          ['carrot', 'Carrot'],
          ['broccoli', 'Broccoli'],
          ['spinach', 'Spinach'],
        ],
      ],
    ],
  },
} as const

export default function SelectRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  let value = $state('')
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
      <Select
        value={() => value}
        onValueChange={next => {
          value = next
        }}
      >
        <SelectTrigger class="w-32" dir={text().dir}>
          <SelectValue placeholder={text().placeholder} />
        </SelectTrigger>
        <SelectContent dir={text().dir}>
          {text().groups.map(([label, items], groupIndex) => (
            <>
              <SelectGroup>
                <SelectLabel>{label}</SelectLabel>
                {items.map(([itemValue, itemLabel]) => (
                  <SelectItem value={itemValue}>{itemLabel}</SelectItem>
                ))}
              </SelectGroup>
              {groupIndex === 0 ? <SelectSeparator /> : null}
            </>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
