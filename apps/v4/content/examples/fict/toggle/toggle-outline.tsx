import { Toggle } from '@/components/ui/toggle'

export default function ToggleOutlineExample() {
  return (
    <div class="flex gap-2"><Toggle variant="outline" aria-label="Toggle italic">Italic</Toggle><Toggle variant="outline" aria-label="Toggle bold">Bold</Toggle></div>
  )
}
