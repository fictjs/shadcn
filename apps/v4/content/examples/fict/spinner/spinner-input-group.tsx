import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'

export default function SpinnerInputGroupExample() { return <div class="grid w-80 gap-3"><InputGroup><InputGroupInput placeholder="Send a message..." disabled /><InputGroupAddon><Spinner /></InputGroupAddon></InputGroup><InputGroup class="items-end"><textarea class="min-h-20 flex-1 resize-none bg-transparent p-3" placeholder="Send a message..." disabled /><InputGroupAddon><Spinner />Validating...</InputGroupAddon></InputGroup></div> }
