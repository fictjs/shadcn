import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupDemoExample() {
  return (
    <InputGroup class="max-w-xs">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <span aria-hidden="true">•</span>
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
    </InputGroup>
  )
}
