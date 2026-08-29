import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function SpinnerEmptyExample() { return <div class="grid justify-items-center gap-3 text-center"><Spinner /><h3 class="font-semibold">Processing your request</h3><p class="text-sm text-muted-foreground">Please wait while we process your request. Do not refresh the page.</p><Button variant="outline">Cancel</Button></div> }
