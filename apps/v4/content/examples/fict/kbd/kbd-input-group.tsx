import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'

function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg> }

export default function KbdInputGroupExample() {
  return <InputGroup class="w-80"><InputGroupAddon><SearchIcon /></InputGroupAddon><InputGroupInput aria-label="Search" placeholder="Search..." /><InputGroupAddon><Kbd>⌘</Kbd><Kbd>K</Kbd></InputGroupAddon></InputGroup>
}
