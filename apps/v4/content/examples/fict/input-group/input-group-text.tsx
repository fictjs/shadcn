import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupTextExample() {
  return (
    <InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Text" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
