import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

export default function InputGroupBlockStartExample() {
  return (
    <FieldGroup class="max-w-sm">
      <Field>
        <FieldLabel for="block-start-input">Input</FieldLabel>
        <InputGroup class="h-auto">
          <InputGroupInput id="block-start-input" placeholder="Enter your name" />
          <InputGroupAddon align="block-start">
            <InputGroupText>Full Name</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>Header positioned above the input.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel for="block-start-textarea">Textarea</FieldLabel>
        <InputGroup>
          <InputGroupTextarea
            id="block-start-textarea"
            placeholder="console.log('Hello, world!');"
            class="font-mono text-sm"
          />
          <InputGroupAddon align="block-start">
            <span aria-hidden="true">•</span>
            <InputGroupText class="font-mono">script.js</InputGroupText>
            <InputGroupButton size="icon-xs" class="ml-auto">
              <span aria-hidden="true">•</span>
              <span class="sr-only">Copy</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>Header positioned above the textarea.</FieldDescription>
      </Field>
    </FieldGroup>
  )
}
