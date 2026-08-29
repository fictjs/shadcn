import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const translations = {
  ar: { dir: 'rtl', caption: 'قائمة بفواتيرك الأخيرة.', headings: ['الفاتورة', 'الحالة', 'الطريقة', 'المبلغ'], statuses: ['مدفوع', 'قيد الانتظار', 'غير مدفوع'], methods: ['بطاقة ائتمانية', 'PayPal', 'تحويل بنكي'], total: 'المجموع' },
  he: { dir: 'rtl', caption: 'רשימת החשבוניות האחרונות שלך.', headings: ['חשבונית', 'סטטוס', 'שיטה', 'סכום'], statuses: ['שולם', 'ממתין', 'לא שולם'], methods: ['כרטיס אשראי', 'PayPal', 'העברה בנקאית'], total: 'סה״כ' },
  en: { dir: 'ltr', caption: 'A list of your recent invoices.', headings: ['Invoice', 'Status', 'Method', 'Amount'], statuses: ['Paid', 'Pending', 'Unpaid'], methods: ['Credit Card', 'PayPal', 'Bank Transfer'], total: 'Total' },
} as const

const invoices = [
  ['INV001', 0, 0, '$250.00'], ['INV002', 1, 1, '$150.00'], ['INV003', 2, 2, '$350.00'],
  ['INV004', 0, 0, '$450.00'], ['INV005', 0, 1, '$550.00'], ['INV006', 1, 2, '$200.00'], ['INV007', 2, 0, '$300.00'],
] as const

export default function TableRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const t = translations[language]
  return (
    <div>
      <select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}>
        <option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option>
      </select>
      <Table dir={t.dir}>
        <TableCaption>{t.caption}</TableCaption>
        <TableHeader><TableRow>{t.headings.map(heading => <TableHead>{heading}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{invoices.map(invoice => <TableRow><TableCell class="font-medium">{invoice[0]}</TableCell><TableCell>{t.statuses[invoice[1]]}</TableCell><TableCell>{t.methods[invoice[2]]}</TableCell><TableCell class="text-right">{invoice[3]}</TableCell></TableRow>)}</TableBody>
        <TableFooter><TableRow><TableCell colSpan={3}>{t.total}</TableCell><TableCell class="text-right">$2,500.00</TableCell></TableRow></TableFooter>
      </Table>
    </div>
  )
}
