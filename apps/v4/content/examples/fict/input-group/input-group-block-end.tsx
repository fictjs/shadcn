import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupBlockEndExample() {
  return (
    <InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Block End" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
