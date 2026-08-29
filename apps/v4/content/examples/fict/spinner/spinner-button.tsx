import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function SpinnerButtonExample() { return <div class="flex gap-2"><Button disabled><Spinner />Loading...</Button><Button variant="outline" disabled><Spinner />Please wait</Button><Button variant="secondary" disabled><Spinner />Processing</Button></div> }
