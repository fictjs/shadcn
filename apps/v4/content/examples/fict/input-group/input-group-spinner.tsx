import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupSpinnerExample() {
  return (
    <InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Spinner" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
