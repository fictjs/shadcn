import { Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

export default function FieldSwitchExample() {
  return (
    <Field orientation="horizontal" class="w-fit"><FieldLabel for="multi-factor">Multi-factor authentication</FieldLabel><Switch id="multi-factor" /></Field>
  )
}
