import { Separator } from '@/components/ui/separator'

const entries = [['Settings', 'Manage preferences'], ['Account', 'Profile & security'], ['Help', 'Support & docs']]
export default function SeparatorMenuExample() { return <div class="flex items-center gap-4">{entries.map((entry, index) => <>{index ? <Separator orientation="vertical" class="h-10" /> : null}<div><strong>{entry[0]}</strong><small class="block text-muted-foreground">{entry[1]}</small></div></>)}</div> }
