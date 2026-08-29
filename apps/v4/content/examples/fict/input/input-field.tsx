import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function InputFieldExample() {
  return (
    <Field>
      <FieldLabel for="input-field-username">Username</FieldLabel>
      <Input id="input-field-username" type="text" placeholder="Enter your username" />
      <FieldDescription>Choose a unique username for your account.</FieldDescription>
    </Field>
  )
}
