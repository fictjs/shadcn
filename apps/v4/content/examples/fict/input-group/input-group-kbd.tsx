import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'

export default function InputGroupKbdExample() {
  return (
    <InputGroup class="max-w-sm">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <span aria-hidden="true">•</span>
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <Kbd>⌘K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  )
}
