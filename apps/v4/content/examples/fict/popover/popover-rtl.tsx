import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

const translations = {
  ar: {
    dir: 'rtl',
    title: 'الأبعاد',
    description: 'تعيين الأبعاد للطبقة.',
    sides: { left: 'يسار', top: 'أعلى', bottom: 'أسفل', right: 'يمين' },
  },
  he: {
    dir: 'rtl',
    title: 'מימדים',
    description: 'הגדר את המימדים לשכבה.',
    sides: { left: 'שמאל', top: 'למעלה', bottom: 'למטה', right: 'ימין' },
  },
  en: {
    dir: 'ltr',
    title: 'Dimensions',
    description: 'Set the dimensions for the layer.',
    sides: { left: 'Left', top: 'Top', bottom: 'Bottom', right: 'Right' },
  },
} as const

export default function PopoverRtlExample() {
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
      <div class="flex flex-wrap justify-center gap-2" dir={text().dir}>
        {(['left', 'top', 'bottom', 'right'] as const).map(side => (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">{text().sides[side]}</Button>
            </PopoverTrigger>
            <PopoverContent side={side} dir={text().dir}>
              <PopoverHeader>
                <PopoverTitle>{text().title}</PopoverTitle>
                <PopoverDescription>{text().description}</PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  )
}
