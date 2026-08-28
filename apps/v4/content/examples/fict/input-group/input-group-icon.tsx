import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupIconExample() {
  return (
    <InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Icon" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
