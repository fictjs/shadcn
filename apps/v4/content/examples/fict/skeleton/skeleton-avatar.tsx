import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonAvatarExample() {
  return <div class="flex items-center gap-4"><Skeleton class="size-10 rounded-full" /><div class="grid gap-2"><Skeleton class="h-4 w-[150px]" /><Skeleton class="h-4 w-[100px]" /></div></div>
}
