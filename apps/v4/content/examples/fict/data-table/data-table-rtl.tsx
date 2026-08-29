import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

type Payment = { id: string; status: 'success' | 'processing' | 'failed'; email: string; amount: number }
const payments: Payment[] = [
  { id: 'm5gr84i9', status: 'success', email: 'ken99@example.com', amount: 316 },
  { id: '3u1reuv4', status: 'success', email: 'Abe45@example.com', amount: 242 },
  { id: 'derv1ws0', status: 'processing', email: 'Monserrat44@example.com', amount: 837 },
  { id: '5kma53ae', status: 'success', email: 'Silas22@example.com', amount: 874 },
  { id: 'bhqecj4p', status: 'failed', email: 'carmella@example.com', amount: 721 },
]
const translations = {
  ar: { dir: 'rtl', status: 'الحالة', email: 'البريد الإلكتروني', amount: 'المبلغ', filter: 'تصفية البريد الإلكتروني...', columns: 'الأعمدة', actions: 'الإجراءات', copyId: 'نسخ معرف الدفع', customer: 'عرض العميل', details: 'عرض تفاصيل الدفع', empty: 'لا توجد نتائج.', of: 'من', selected: 'صف(وف) محدد.', previous: 'السابق', next: 'التالي', states: { success: 'ناجح', processing: 'قيد المعالجة', failed: 'فشل' } },
  he: { dir: 'rtl', status: 'סטטוס', email: 'אימייל', amount: 'סכום', filter: 'סנן אימיילים...', columns: 'עמודות', actions: 'פעולות', copyId: 'העתק מזהה תשלום', customer: 'צפה בלקוח', details: 'צפה בפרטי תשלום', empty: 'אין תוצאות.', of: 'מתוך', selected: 'שורות נבחרו.', previous: 'הקודם', next: 'הבא', states: { success: 'הצליח', processing: 'מעבד', failed: 'נכשל' } },
  en: { dir: 'ltr', status: 'Status', email: 'Email', amount: 'Amount', filter: 'Filter emails...', columns: 'Columns', actions: 'Actions', copyId: 'Copy payment ID', customer: 'View customer', details: 'View payment details', empty: 'No results.', of: 'of', selected: 'row(s) selected.', previous: 'Previous', next: 'Next', states: { success: 'Success', processing: 'Processing', failed: 'Failed' } },
} as const

export default function DataTableRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  let filter = $state('')
  let descending = $state(false)
  let selected = $state<string[]>([])
  let visible = $state({ status: true, email: true, amount: true })
  const t = translations[language]
  const rows = () => payments.filter(payment => payment.email.toLowerCase().includes(filter.toLowerCase())).sort((a, b) => (descending ? b.email.localeCompare(a.email) : a.email.localeCompare(b.email)))
  const toggleRow = (id: string) => { selected = selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id] }
  const columns = (): DataTableColumn<Payment>[] => [
    { key: 'select', header: '', cell: row => <Checkbox aria-label="Select row" checked={selected.includes(row.id)} onCheckedChange={() => toggleRow(row.id)} /> },
    ...(visible.status ? [{ key: 'status', header: t.status, cell: (row: Payment) => t.states[row.status] }] : []),
    ...(visible.email ? [{ key: 'email', header: t.email, cell: (row: Payment) => <Button variant="ghost" onClick={() => { descending = !descending }}>↕ {row.email}</Button> }] : []),
    ...(visible.amount ? [{ key: 'amount', header: t.amount, cell: (row: Payment) => <span class="block text-right">${row.amount.toFixed(2)}</span> }] : []),
    { key: 'actions', header: '', cell: row => <DropdownMenu dir={t.dir}><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu">•••</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>{t.actions}</DropdownMenuLabel><DropdownMenuItem onSelect={() => navigator.clipboard.writeText(row.id)}>{t.copyId}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem>{t.customer}</DropdownMenuItem><DropdownMenuItem>{t.details}</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  ]

  return (
    <div class="grid gap-4" dir={t.dir}><select dir="ltr" aria-label="Preview language" value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><div class="flex items-center gap-2"><Input aria-label="Filter emails" placeholder={t.filter} value={filter} onInput={event => { filter = event.currentTarget.value }} /><DropdownMenu dir={t.dir}><DropdownMenuTrigger asChild><Button variant="outline">{t.columns}</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{(['status', 'email', 'amount'] as const).map(column => <DropdownMenuCheckboxItem checked={visible[column]} onCheckedChange={checked => { visible = { ...visible, [column]: checked } }}>{column}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu></div><DataTable columns={columns()} data={rows()} emptyText={t.empty} /><div class="flex items-center justify-between text-sm text-muted-foreground"><span>{selected.length} {t.of} {rows().length} {t.selected}</span><div class="space-x-2"><Button variant="outline" size="sm" disabled>{t.previous}</Button><Button variant="outline" size="sm" disabled>{t.next}</Button></div></div></div>
  )
}
