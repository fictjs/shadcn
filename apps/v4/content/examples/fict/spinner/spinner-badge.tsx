import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

export default function SpinnerBadgeExample() { return <div class="flex gap-2"><Badge><Spinner size="sm" />Syncing</Badge><Badge variant="secondary"><Spinner size="sm" />Updating</Badge><Badge variant="outline"><Spinner size="sm" />Processing</Badge></div> }
