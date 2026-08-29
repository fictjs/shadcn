import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

const translations = {
  ar: { dir: 'rtl', locale: 'ar-EG', trigger: 'فتح الدرج', title: 'نقل الهدف', description: 'حدد هدف نشاطك اليومي.', calories: 'سعرات حرارية/يوم', decrease: 'تقليل', increase: 'زيادة', submit: 'إرسال', cancel: 'إلغاء' },
  he: { dir: 'rtl', locale: 'he-IL', trigger: 'פתח מגירה', title: 'הזז מטרה', description: 'הגדר את יעד הפעילות היומי שלך.', calories: 'קלוריות/יום', decrease: 'הקטן', increase: 'הגדל', submit: 'שלח', cancel: 'בטל' },
  en: { dir: 'ltr', locale: 'en-US', trigger: 'Open Drawer', title: 'Move Goal', description: 'Set your daily activity goal.', calories: 'Calories/day', decrease: 'Decrease', increase: 'Increase', submit: 'Submit', cancel: 'Cancel' },
} as const

export default function DrawerRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  let goal = $state(350)
  const text = () => translations[language]
  const adjust = (amount: number) => { goal = Math.max(200, Math.min(400, goal + amount)) }

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <Drawer>
        <DrawerTrigger asChild><Button variant="outline">{text().trigger}</Button></DrawerTrigger>
        <DrawerContent dir={text().dir} data-lang={text().dir === 'rtl' ? language : undefined}>
          <div class="mx-auto w-full max-w-sm">
            <DrawerHeader><DrawerTitle>{text().title}</DrawerTitle><DrawerDescription>{text().description}</DrawerDescription></DrawerHeader>
            <div class="flex items-center justify-center gap-2 p-4"><Button variant="outline" size="icon" onClick={() => adjust(-10)} disabled={goal <= 200} aria-label={text().decrease}>−</Button><div class="text-center"><strong class="text-7xl">{goal.toLocaleString(text().locale)}</strong><div>{text().calories}</div></div><Button variant="outline" size="icon" onClick={() => adjust(10)} disabled={goal >= 400} aria-label={text().increase}>+</Button></div>
            <DrawerFooter><Button>{text().submit}</Button><DrawerClose asChild><Button variant="outline">{text().cancel}</Button></DrawerClose></DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
