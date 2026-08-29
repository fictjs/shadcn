import { Toggle } from '@/components/ui/toggle'

export default function ToggleSizesExample() {
  return (
    <div class="flex items-center gap-2"><Toggle variant="outline" size="sm" aria-label="Toggle small">Small</Toggle><Toggle variant="outline" aria-label="Toggle default">Default</Toggle><Toggle variant="outline" size="lg" aria-label="Toggle large">Large</Toggle></div>
  )
}
