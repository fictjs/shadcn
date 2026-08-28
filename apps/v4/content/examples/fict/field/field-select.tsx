import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

export default function FieldSelectExample() {
  return (
    <Field><FieldLabel for="example">Select</FieldLabel><FieldControl><input id="example" placeholder="Enter a value" /></FieldControl><FieldDescription>Fict field composition.</FieldDescription></Field>
  )
}
