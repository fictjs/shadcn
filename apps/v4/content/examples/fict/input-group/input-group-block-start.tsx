import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupBlockStartExample() {
  return (
    <InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Block Start" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
