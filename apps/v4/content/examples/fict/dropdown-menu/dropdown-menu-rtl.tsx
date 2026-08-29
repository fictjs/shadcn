import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const translations = {
  ar: {
    dir: 'rtl',
    open: 'افتح القائمة',
    profile: 'الملف الشخصي',
    invite: 'دعوة مستخدمين',
    email: 'بريد إلكتروني',
  },
  he: { dir: 'rtl', open: 'פתח תפריט', profile: 'פרופיל', invite: 'הזמן משתמשים', email: 'דוא״ל' },
  en: { dir: 'ltr', open: 'Open', profile: 'Profile', invite: 'Invite users', email: 'Email' },
} as const

export default function DropdownMenuRtlExample() {
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
      <DropdownMenu dir={text().dir}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{text().open}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent dir={text().dir}>
          <DropdownMenuItem>{text().profile}</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{text().invite}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent dir={text().dir}>
              <DropdownMenuItem>{text().email}</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
