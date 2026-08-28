import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupDropdownExample() {
  return (
    <InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Dropdown" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
