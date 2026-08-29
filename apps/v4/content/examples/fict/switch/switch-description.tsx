import { Switch } from '@/components/ui/switch'

export default function SwitchDescriptionExample() {
  return (
    <div class="flex w-full max-w-sm items-center justify-between gap-4">
      <div>
        <label for="switch-focus-mode" class="font-medium">
          Share across devices
        </label>
        <p class="text-sm text-muted-foreground">
          Focus is shared across devices, and turns off when you leave the app.
        </p>
      </div>
      <Switch id="switch-focus-mode" />
    </div>
  )
}
