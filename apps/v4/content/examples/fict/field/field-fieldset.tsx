import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function FieldFieldsetExample() {
  return (
    <FieldSet class="w-96"><FieldLegend>Address Information</FieldLegend><FieldDescription>We need your address to deliver your order.</FieldDescription><FieldGroup><Field><FieldLabel for="street">Street Address</FieldLabel><Input id="street" placeholder="123 Main St" /></Field><div class="grid grid-cols-2 gap-4"><Field><FieldLabel for="city">City</FieldLabel><Input id="city" placeholder="New York" /></Field><Field><FieldLabel for="postal-code">Postal Code</FieldLabel><Input id="postal-code" placeholder="90502" /></Field></div></FieldGroup></FieldSet>
  )
}
