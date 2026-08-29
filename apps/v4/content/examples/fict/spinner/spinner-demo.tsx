import { Spinner } from '@/components/ui/spinner'

export default function SpinnerDemoExample() { return <div class="flex w-80 items-center gap-3 rounded-lg border p-4"><Spinner /><div class="grid"><strong>Processing payment...</strong><span class="text-sm text-muted-foreground">$100.00</span></div></div> }
