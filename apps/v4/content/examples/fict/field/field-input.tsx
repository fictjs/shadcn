import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function FieldInputExample() {
  return (
    <FieldSet class="w-80">
      <FieldGroup>
        <Field><FieldLabel for="username">Username</FieldLabel><Input id="username" placeholder="Max Leiter" /><FieldDescription>Choose a unique username for your account.</FieldDescription></Field>
        <Field><FieldLabel for="password">Password</FieldLabel><FieldDescription>Must be at least 8 characters long.</FieldDescription><Input id="password" type="password" placeholder="••••••••" /></Field>
      </FieldGroup>
    </FieldSet>
  )
}
