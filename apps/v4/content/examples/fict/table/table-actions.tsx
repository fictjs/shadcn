import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const products = [['Wireless Mouse', '$29.99'], ['Mechanical Keyboard', '$129.99'], ['USB-C Hub', '$49.99']] as const

function MoreIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>
}

export default function TableActionsExample() {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead class="text-right">Actions</TableHead></TableRow></TableHeader>
      <TableBody>{products.map(([product, price]) => (
        <TableRow>
          <TableCell class="font-medium">{product}</TableCell><TableCell>{price}</TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" class="size-8" aria-label={`Open menu for ${product}`}><MoreIcon /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Duplicate</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem class="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  )
}
