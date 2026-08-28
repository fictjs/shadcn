import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupInlineEndExample() {
  return (
    <InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Inline End" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
