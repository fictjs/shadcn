import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const translations = {
  ar: { dir: 'rtl', archive: 'أرشفة', report: 'تقرير', snooze: 'تأجيل', read: 'وضع علامة كمقروء', trash: 'سلة المهملات' },
  he: { dir: 'rtl', archive: 'ארכיון', report: 'דוח', snooze: 'דחה', read: 'סמן כנקרא', trash: 'פח' },
  en: { dir: 'ltr', archive: 'Archive', report: 'Report', snooze: 'Snooze', read: 'Mark as Read', trash: 'Trash' },
} as const

export default function ButtonGroupRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const t = translations[language]
  return (
    <div class="grid gap-4"><select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><div class="flex gap-3" dir={t.dir}><ButtonGroup><Button variant="outline" size="icon" aria-label="Go Back">←</Button></ButtonGroup><ButtonGroup><Button variant="outline">{t.archive}</Button><Button variant="outline">{t.report}</Button></ButtonGroup><ButtonGroup><Button variant="outline">{t.snooze}</Button><DropdownMenu dir={t.dir}><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="More Options">•••</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem>{t.read}</DropdownMenuItem><DropdownMenuItem>{t.archive}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive">{t.trash}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></ButtonGroup></div></div>
  )
}
