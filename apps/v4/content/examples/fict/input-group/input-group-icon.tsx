import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupIconExample() {
  return (
    <div class="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <span aria-hidden="true">•</span>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput type="email" placeholder="Enter your email" />
        <InputGroupAddon>
          <span aria-hidden="true">•</span>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Card number" />
        <InputGroupAddon>
          <span aria-hidden="true">•</span>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <span aria-hidden="true">•</span>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Card number" />
        <InputGroupAddon align="inline-end">
          <span aria-hidden="true">•</span>
          <span aria-hidden="true">•</span>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
