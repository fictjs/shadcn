import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function InputDisabledExample() {
  return (
    <Field data-disabled>
      <FieldLabel for="input-demo-disabled">Email</FieldLabel>
      <Input id="input-demo-disabled" type="email" placeholder="Email" disabled />
      <FieldDescription>This field is currently disabled.</FieldDescription>
    </Field>
  )
}
