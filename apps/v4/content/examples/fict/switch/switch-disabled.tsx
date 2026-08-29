import { Switch } from '@/components/ui/switch'

export default function SwitchDisabledExample() {
  return (
    <label class="flex items-center gap-2 opacity-50">
      <Switch id="switch-disabled-unchecked" disabled /> Disabled
    </label>
  )
}
