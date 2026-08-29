import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

function PaymentIcon(props: { kind: 'card' | 'wallet' | 'bank' }) {
  return <span aria-hidden="true">{props.kind === 'card' ? '▤' : props.kind === 'wallet' ? '▱' : '▥'}</span>
}

export default function DropdownMenuRadioIconsExample() {
  let paymentMethod = $state('card')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline">Payment Method</Button></DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Select Payment Method</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={() => paymentMethod} onValueChange={value => { paymentMethod = value }}>
            <DropdownMenuRadioItem value="card"><PaymentIcon kind="card" />Credit Card</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="paypal"><PaymentIcon kind="wallet" />PayPal</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bank"><PaymentIcon kind="bank" />Bank Transfer</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
