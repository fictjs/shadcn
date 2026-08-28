import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function InputGroupRtlExample() {
  return (
    <InputGroup dir="rtl"><InputGroupAddon>@</InputGroupAddon><InputGroupInput placeholder="Group Rtl" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
  )
}
