import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

export default function FieldCheckboxExample() {
  return (
    <Field><FieldLabel for="example">Checkbox</FieldLabel><FieldControl><input id="example" placeholder="Enter a value" /></FieldControl><FieldDescription>Fict field composition.</FieldDescription></Field>
  )
}
