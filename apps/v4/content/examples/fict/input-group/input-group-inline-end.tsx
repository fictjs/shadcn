import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupInlineEndExample() {
  return (
    <Field class="max-w-sm">
      <FieldLabel for="inline-end-input">Input</FieldLabel>
      <InputGroup>
        <InputGroupInput id="inline-end-input" type="password" placeholder="Enter password" />
        <InputGroupAddon align="inline-end">
          <span aria-hidden="true">•</span>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription>Icon positioned at the end.</FieldDescription>
    </Field>
  )
}
