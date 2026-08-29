import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'

type Payment = { status: 'success' | 'processing' | 'failed'; email: string; amount: number }
const payments: Payment[] = [
  { status: 'success', email: 'ken99@example.com', amount: 316 },
  { status: 'success', email: 'Abe45@example.com', amount: 242 },
  { status: 'processing', email: 'Monserrat44@example.com', amount: 837 },
  { status: 'success', email: 'Silas22@example.com', amount: 874 },
  { status: 'failed', email: 'carmella@example.com', amount: 721 },
]
const translations = {
  ar: { dir: 'rtl', status: 'الحالة', email: 'البريد الإلكتروني', amount: 'المبلغ', filter: 'تصفية البريد الإلكتروني...', empty: 'لا توجد نتائج.', states: { success: 'ناجح', processing: 'قيد المعالجة', failed: 'فشل' } },
  he: { dir: 'rtl', status: 'סטטוס', email: 'אימייל', amount: 'סכום', filter: 'סנן אימיילים...', empty: 'אין תוצאות.', states: { success: 'הצליח', processing: 'מעבד', failed: 'נכשל' } },
  en: { dir: 'ltr', status: 'Status', email: 'Email', amount: 'Amount', filter: 'Filter emails...', empty: 'No results.', states: { success: 'Success', processing: 'Processing', failed: 'Failed' } },
} as const

export default function DataTableRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  let filter = $state('')
  const text = () => translations[language]
  const rows = () => payments.filter(payment => payment.email.toLowerCase().includes(filter.toLowerCase()))
  const columns = (): DataTableColumn<Payment>[] => [
    { key: 'status', header: text().status, cell: row => text().states[row.status] },
    { key: 'email', header: text().email },
    { key: 'amount', header: text().amount, cell: row => `$${row.amount.toFixed(2)}` },
  ]

  return (
    <div class="grid gap-4" dir={text().dir}>
      <select dir="ltr" value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <Input aria-label="Filter emails" placeholder={text().filter} value={filter} onInput={event => { filter = event.currentTarget.value }} />
      <DataTable columns={columns()} data={rows()} emptyText={text().empty} />
    </div>
  )
}
