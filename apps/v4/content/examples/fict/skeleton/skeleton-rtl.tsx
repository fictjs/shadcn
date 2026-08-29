import { Skeleton } from '@/components/ui/skeleton'

const directions = { ar: 'rtl', he: 'rtl', en: 'ltr' } as const

export default function SkeletonRtlExample() {
  let language = $state<keyof typeof directions>('ar')
  return <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof directions }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><div class="flex items-center gap-4" dir={directions[language]}><Skeleton class="size-12 rounded-full" /><div class="grid gap-2"><Skeleton class="h-4 w-[250px]" /><Skeleton class="h-4 w-[200px]" /></div></div></div>
}
