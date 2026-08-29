import { Switch } from '@/components/ui/switch'

export default function SwitchInvalidExample() {
  return (
    <div class="flex w-full max-w-sm items-center justify-between gap-4">
      <div>
        <label for="switch-terms" class="font-medium">
          Accept terms and conditions
        </label>
        <p class="text-sm text-destructive">
          You must accept the terms and conditions to continue.
        </p>
      </div>
      <Switch id="switch-terms" aria-invalid="true" />
    </div>
  )
}
