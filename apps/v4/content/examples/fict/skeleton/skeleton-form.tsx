import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonFormExample() {
  return <div class="grid gap-4"><div class="grid gap-2"><Skeleton class="h-4 w-20" /><Skeleton class="h-9 w-80" /></div><div class="grid gap-2"><Skeleton class="h-4 w-24" /><Skeleton class="h-9 w-80" /></div><Skeleton class="h-9 w-24" /></div>
}
