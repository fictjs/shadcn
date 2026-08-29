import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const translations = {
  ar: { dir: 'rtl', open: 'فتح', title: 'تعديل الملف الشخصي', description: 'قم بإجراء تغييرات على ملفك الشخصي هنا. انقر حفظ عند الانتهاء.', name: 'الاسم', username: 'اسم المستخدم', save: 'حفظ التغييرات', close: 'إغلاق' },
  he: { dir: 'rtl', open: 'פתח', title: 'עריכת פרופיל', description: 'בצע שינויים בפרופיל שלך כאן. לחץ שמור כשתסיים.', name: 'שם', username: 'שם משתמש', save: 'שמור שינויים', close: 'סגור' },
  en: { dir: 'ltr', open: 'Open', title: 'Edit profile', description: "Make changes to your profile here. Click save when you're done.", name: 'Name', username: 'Username', save: 'Save changes', close: 'Close' },
} as const

export default function SheetRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}>
        <option value="ar">Arabic (العربية)</option>
        <option value="he">Hebrew (עברית)</option>
        <option value="en">English</option>
      </select>
      <Sheet>
        <SheetTrigger asChild><Button variant="outline">{text().open}</Button></SheetTrigger>
        <SheetContent dir={text().dir} side={text().dir === 'rtl' ? 'left' : 'right'}>
          <SheetClose class="absolute right-4 top-4" aria-label={text().close}>×</SheetClose>
          <SheetHeader><SheetTitle>{text().title}</SheetTitle><SheetDescription>{text().description}</SheetDescription></SheetHeader>
          <div class="grid gap-4 py-4">
            <Label for="sheet-rtl-name">{text().name}</Label><Input id="sheet-rtl-name" value="Pedro Duarte" />
            <Label for="sheet-rtl-username">{text().username}</Label><Input id="sheet-rtl-username" value="peduarte" />
          </div>
          <SheetFooter><Button type="submit">{text().save}</Button><SheetClose asChild><Button variant="outline">{text().close}</Button></SheetClose></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
