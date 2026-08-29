import { Switch } from '@/components/ui/switch'

export default function SwitchSizesExample() {
  return (
    <div class="grid gap-4">
      <label class="flex items-center gap-2">
        <Switch id="switch-size-sm" size="sm" /> Small
      </label>
      <label class="flex items-center gap-2">
        <Switch id="switch-size-default" /> Default
      </label>
    </div>
  )
}
