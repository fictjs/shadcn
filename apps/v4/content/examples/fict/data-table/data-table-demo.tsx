import { DataTable, type DataTableColumn } from '@/components/ui/data-table'

type Payment = { status: string; email: string; amount: number }

const columns: DataTableColumn<Payment>[] = [
  { key: "status", header: "Status" },
  { key: "email", header: "Email" },
  { key: "amount", header: "Amount", cell: row => "$" + row.amount.toFixed(2) },
]

const payments: Payment[] = [
  { status: "Success", email: "m@example.com", amount: 316 },
  { status: "Processing", email: "a@example.com", amount: 242 },
]

export default function DataTableDemoExample() {
  return (
    <DataTable columns={columns} data={payments} />
  )
}
