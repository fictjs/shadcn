import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupInlineStartExample() {
  return (
    <InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Inline Start" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
