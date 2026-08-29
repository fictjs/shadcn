import { Toggle } from '@/components/ui/toggle'

export default function ToggleDisabledExample() {
  return (
    <div class="flex gap-2"><Toggle disabled aria-label="Toggle disabled">Disabled</Toggle><Toggle disabled variant="outline" aria-label="Toggle disabled outline">Disabled</Toggle></div>
  )
}
