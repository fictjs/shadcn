import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

export default function FieldRadioExample() {
  return (
    <Field><FieldLabel for="example">Radio</FieldLabel><FieldControl><input id="example" placeholder="Enter a value" /></FieldControl><FieldDescription>Fict field composition.</FieldDescription></Field>
  )
}
