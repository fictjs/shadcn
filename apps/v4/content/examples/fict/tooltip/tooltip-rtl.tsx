import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const translations = {
  ar: { dir: 'rtl', content: 'إضافة إلى المكتبة', left: 'يسار', top: 'أعلى', bottom: 'أسفل', right: 'يمين' },
  he: { dir: 'rtl', content: 'הוסף לספרייה', left: 'שמאל', top: 'למעלה', bottom: 'למטה', right: 'ימין' },
  en: { dir: 'ltr', content: 'Add to library', left: 'Left', top: 'Top', bottom: 'Bottom', right: 'Right' },
} as const

const sides = ['left', 'top', 'bottom', 'right'] as const

export default function TooltipRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const t = translations[language]
  return (
    <div>
      <select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}>
        <option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option>
      </select>
      <TooltipProvider dir={t.dir}>
        <div class="flex flex-wrap gap-2" dir={t.dir}>
          {sides.map(side => (
            <Tooltip>
              <TooltipTrigger asChild><Button variant="outline" class="w-fit capitalize">{t[side]}</Button></TooltipTrigger>
              <TooltipContent side={side}>{t.content}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  )
}
