import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

export default function FieldRtlExample() {
  return (
    <Field dir="rtl"><FieldLabel for="example">Rtl</FieldLabel><FieldControl><input id="example" placeholder="Enter a value" /></FieldControl><FieldDescription>Fict field composition.</FieldDescription></Field>
  )
}
