import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupCustomExample() {
  return (
    <InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Custom" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
