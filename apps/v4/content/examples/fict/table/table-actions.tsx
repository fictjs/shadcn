import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TableActionsExample() {
  return (
    <Table><TableCaption>Actions</TableCaption><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>INV001</TableCell><TableCell>Paid</TableCell><TableCell>$250.00</TableCell></TableRow></TableBody></Table>
  )
}
