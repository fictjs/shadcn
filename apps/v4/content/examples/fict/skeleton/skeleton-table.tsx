import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonTableExample() {
  return <div class="grid w-96 gap-3">{Array.from({ length: 5 }, () => <div class="grid grid-cols-[1fr_6rem_5rem] gap-4"><Skeleton class="h-4 w-full" /><Skeleton class="h-4 w-24" /><Skeleton class="h-4 w-20" /></div>)}</div>
}
