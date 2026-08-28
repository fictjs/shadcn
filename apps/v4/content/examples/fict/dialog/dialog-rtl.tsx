import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const translations = {
  ar: { open: 'فتح الحوار', title: 'تعديل الملف الشخصي', description: 'قم بإجراء تغييرات على ملفك الشخصي هنا. انقر فوق حفظ عند الانتهاء.', name: 'الاسم', username: 'اسم المستخدم', cancel: 'إلغاء', save: 'حفظ التغييرات' },
  he: { open: 'פתח דיאלוג', title: 'ערוך פרופיל', description: 'בצע שינויים בפרופיל שלך כאן. לחץ על שמור כשתסיים.', name: 'שם', username: 'שם משתמש', cancel: 'בטל', save: 'שמור שינויים' },
  en: { open: 'Open Dialog', title: 'Edit profile', description: "Make changes to your profile here. Click save when you're done.", name: 'Name', username: 'Username', cancel: 'Cancel', save: 'Save changes' },
} as const

export default function DialogRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]
  const direction = () => language === 'en' ? 'ltr' : 'rtl'

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}>
        <option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option>
      </select>
      <Dialog>
        <DialogTrigger asChild><Button variant="outline">{text().open}</Button></DialogTrigger>
        <DialogContent class="sm:max-w-sm" dir={direction()}>
          <DialogHeader><DialogTitle>{text().title}</DialogTitle><DialogDescription>{text().description}</DialogDescription></DialogHeader>
          <div class="grid gap-4">
            <Field><Label for="name-rtl">{text().name}</Label><Input id="name-rtl" value="Pedro Duarte" /></Field>
            <Field><Label for="username-rtl">{text().username}</Label><Input id="username-rtl" value="@peduarte" /></Field>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">{text().cancel}</Button></DialogClose>
            <DialogClose asChild><Button>{text().save}</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
