import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const invoices = [
  ['INV001', 'Paid', 'Credit Card', '$250.00'],
  ['INV002', 'Pending', 'PayPal', '$150.00'],
  ['INV003', 'Unpaid', 'Bank Transfer', '$350.00'],
] as const

export default function TableFooterExample() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader><TableRow><TableHead class="w-[100px]">Invoice</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead><TableHead class="text-right">Amount</TableHead></TableRow></TableHeader>
      <TableBody>{invoices.map(invoice => <TableRow><TableCell class="font-medium">{invoice[0]}</TableCell><TableCell>{invoice[1]}</TableCell><TableCell>{invoice[2]}</TableCell><TableCell class="text-right">{invoice[3]}</TableCell></TableRow>)}</TableBody>
      <TableFooter><TableRow><TableCell colSpan={3}>Total</TableCell><TableCell class="text-right">$2,500.00</TableCell></TableRow></TableFooter>
    </Table>
  )
}
