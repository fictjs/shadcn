import { Field, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

export default function InputInputGroupExample() {
  return (
    <Field>
      <FieldLabel for="input-group-url">Website URL</FieldLabel>
      <InputGroup>
        <InputGroupInput id="input-group-url" placeholder="example.com" />
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <span aria-hidden="true">ⓘ</span>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
