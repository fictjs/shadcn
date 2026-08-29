import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const translations = {
  ar: { dir: 'rtl', open: 'افتح القائمة', account: 'الحساب', profile: 'الملف الشخصي', billing: 'الفوترة', settings: 'الإعدادات', logout: 'تسجيل الخروج', team: 'الفريق', invite: 'دعوة المستخدمين', email: 'البريد الإلكتروني', message: 'رسالة', more: 'المزيد', calendar: 'تقويم', chat: 'دردشة', webhook: 'خطاف ويب', advanced: 'متقدم...', newTeam: 'فريق جديد', view: 'عرض', status: 'شريط الحالة', activity: 'شريط النشاط', panel: 'اللوحة', position: 'الموضع', top: 'أعلى', bottom: 'أسفل', right: 'يمين', left: 'يسار' },
  he: { dir: 'rtl', open: 'פתח תפריט', account: 'חשבון', profile: 'פרופיל', billing: 'חיוב', settings: 'הגדרות', logout: 'התנתק', team: 'הצוות', invite: 'הזמן משתמשים', email: 'אימייל', message: 'הודעה', more: 'עוד', calendar: 'יומן', chat: "צ'אט", webhook: 'Webhook', advanced: 'מתקדם...', newTeam: 'צוות חדש', view: 'תצוגה', status: 'שורת סטטוס', activity: 'שורת פעילות', panel: 'לוח', position: 'מיקום', top: 'למעלה', bottom: 'למטה', right: 'ימין', left: 'שמאל' },
  en: { dir: 'ltr', open: 'Open', account: 'Account', profile: 'Profile', billing: 'Billing', settings: 'Settings', logout: 'Log out', team: 'Team', invite: 'Invite users', email: 'Email', message: 'Message', more: 'More', calendar: 'Calendar', chat: 'Chat', webhook: 'Webhook', advanced: 'Advanced...', newTeam: 'New Team', view: 'View', status: 'Status Bar', activity: 'Activity Bar', panel: 'Panel', position: 'Position', top: 'Top', bottom: 'Bottom', right: 'Right', left: 'Left' },
} as const

export default function DropdownMenuRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  let visibility = $state({ status: true, activity: false, panel: false })
  let position = $state('bottom')
  const text = () => translations[language]
  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <DropdownMenu dir={text().dir}><DropdownMenuTrigger asChild><Button variant="outline">{text().open}</Button></DropdownMenuTrigger><DropdownMenuContent class="w-36" dir={text().dir}>
        <DropdownMenuGroup><DropdownMenuSub><DropdownMenuSubTrigger>{text().account}</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent dir={text().dir}><DropdownMenuItem>{text().profile}</DropdownMenuItem><DropdownMenuItem>{text().billing}</DropdownMenuItem><DropdownMenuItem>{text().settings}</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub></DropdownMenuGroup>
        <DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuLabel>{text().team}</DropdownMenuLabel><DropdownMenuItem>{text().team}</DropdownMenuItem><DropdownMenuSub><DropdownMenuSubTrigger>{text().invite}</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent dir={text().dir}><DropdownMenuItem>{text().email}</DropdownMenuItem><DropdownMenuItem>{text().message}</DropdownMenuItem><DropdownMenuSub><DropdownMenuSubTrigger>{text().more}</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent dir={text().dir}><DropdownMenuItem>{text().calendar}</DropdownMenuItem><DropdownMenuItem>{text().chat}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem>{text().webhook}</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub><DropdownMenuSeparator /><DropdownMenuItem>{text().advanced}</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub><DropdownMenuItem>{text().newTeam}<DropdownMenuShortcut>⌘+T</DropdownMenuShortcut></DropdownMenuItem></DropdownMenuGroup>
        <DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuLabel>{text().view}</DropdownMenuLabel>{(['status', 'activity', 'panel'] as const).map(key => <DropdownMenuCheckboxItem checked={() => visibility[key]} onCheckedChange={value => { visibility = { ...visibility, [key]: value } }}>{text()[key]}</DropdownMenuCheckboxItem>)}</DropdownMenuGroup>
        <DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuLabel>{text().position}</DropdownMenuLabel><DropdownMenuRadioGroup value={() => position} onValueChange={value => { position = value }}>{(['top', 'bottom', 'right', 'left'] as const).map(value => <DropdownMenuRadioItem value={value}>{text()[value]}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuGroup>
        <DropdownMenuSeparator /><DropdownMenuItem variant="destructive">{text().logout}</DropdownMenuItem>
      </DropdownMenuContent></DropdownMenu>
    </div>
  )
}
