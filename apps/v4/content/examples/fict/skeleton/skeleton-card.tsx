import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonCardExample() {
  return <div class="grid w-80 gap-4 rounded-lg border p-4"><header class="grid gap-2"><Skeleton class="h-4 w-48" /><Skeleton class="h-4 w-36" /></header><Skeleton class="aspect-video w-72" /></div>
}
