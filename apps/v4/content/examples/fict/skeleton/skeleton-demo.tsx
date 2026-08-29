import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonDemoExample() {
  return <div class="flex items-center gap-4"><Skeleton class="size-12 rounded-full" /><div class="grid gap-2"><Skeleton class="h-4 w-[250px]" /><Skeleton class="h-4 w-[200px]" /></div></div>
}
