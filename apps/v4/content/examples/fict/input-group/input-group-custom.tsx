import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'

export default function InputGroupCustomExample() {
  return (
    <InputGroup>
      <InputGroupTextarea class="min-h-24" placeholder="Autoresize textarea..." />
      <InputGroupAddon align="block-end">
        <InputGroupButton class="ml-auto" variant="default">
          Submit
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
