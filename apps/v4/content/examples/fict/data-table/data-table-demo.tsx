import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

type Payment = { id: string; status: string; email: string; amount: number }
const payments: Payment[] = [
  { id: 'm5gr84i9', status: 'Success', email: 'ken99@example.com', amount: 316 },
  { id: '3u1reuv4', status: 'Success', email: 'Abe45@example.com', amount: 242 },
  { id: 'derv1ws0', status: 'Processing', email: 'Monserrat44@example.com', amount: 837 },
  { id: '5kma53ae', status: 'Success', email: 'Silas22@example.com', amount: 874 },
  { id: 'bhqecj4p', status: 'Failed', email: 'carmella@example.com', amount: 721 },
]

export default function DataTableDemoExample() {
  let filter = $state('')
  let descending = $state(false)
  let selected = $state<string[]>([])
  let visible = $state({ status: true, email: true, amount: true })
  const rows = () => payments.filter(payment => payment.email.toLowerCase().includes(filter.toLowerCase())).sort((a, b) => (descending ? b.email.localeCompare(a.email) : a.email.localeCompare(b.email)))
  const toggleRow = (id: string) => { selected = selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id] }
  const columns = (): DataTableColumn<Payment>[] => [
    { key: 'select', header: '', cell: row => <Checkbox aria-label="Select row" checked={selected.includes(row.id)} onCheckedChange={() => toggleRow(row.id)} /> },
    ...(visible.status ? [{ key: 'status', header: 'Status' }] : []),
    ...(visible.email ? [{ key: 'email', header: 'Email', cell: row => <Button variant="ghost" onClick={() => { descending = !descending }}>↕ {row.email}</Button> }] : []),
    ...(visible.amount ? [{ key: 'amount', header: 'Amount', cell: row => <span class="block text-right">${row.amount.toFixed(2)}</span> }] : []),
    { key: 'actions', header: '', cell: row => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu">•••</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onSelect={() => navigator.clipboard.writeText(row.id)}>Copy payment ID</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem>View customer</DropdownMenuItem><DropdownMenuItem>View payment details</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  ]

  return (
    <div class="grid gap-4">
      <div class="flex items-center gap-2"><Input aria-label="Filter emails" placeholder="Filter emails..." value={filter} onInput={event => { filter = event.currentTarget.value }} /><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Columns</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{(['status', 'email', 'amount'] as const).map(column => <DropdownMenuCheckboxItem checked={visible[column]} onCheckedChange={checked => { visible = { ...visible, [column]: checked } }}>{column}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu></div>
      <DataTable columns={columns()} data={rows()} emptyText="No results." />
      <div class="flex items-center justify-between text-sm text-muted-foreground"><span>{selected.length} of {rows().length} row(s) selected.</span><div class="space-x-2"><Button variant="outline" size="sm" disabled>Previous</Button><Button variant="outline" size="sm" disabled>Next</Button></div></div>
    </div>
  )
}
