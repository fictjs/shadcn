import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonAvatarExample() {
  return (
    <div class="flex items-center gap-4"><Skeleton class="h-12 w-12 rounded-full" /><div class="space-y-2"><Skeleton class="h-4 w-48" /><Skeleton class="h-4 w-32" /></div></div>
  )
}
