import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function InputInvalidExample() {
  return (
    <Field data-invalid>
      <FieldLabel for="input-invalid">Invalid Input</FieldLabel>
      <Input id="input-invalid" placeholder="Error" aria-invalid />
      <FieldDescription>This field contains validation errors.</FieldDescription>
    </Field>
  )
}
