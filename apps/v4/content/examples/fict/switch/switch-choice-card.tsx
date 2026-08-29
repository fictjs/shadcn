import { Switch } from '@/components/ui/switch'

export default function SwitchChoiceCardExample() {
  return (
    <div class="grid w-full max-w-sm gap-4">
      <label
        for="switch-share"
        class="flex items-center justify-between gap-4 rounded-lg border p-4"
      >
        <span>
          <strong class="block">Share across devices</strong>
          <small class="text-muted-foreground">
            Focus is shared across devices, and turns off when you leave the app.
          </small>
        </span>
        <Switch id="switch-share" />
      </label>
      <label
        for="switch-notifications"
        class="flex items-center justify-between gap-4 rounded-lg border p-4"
      >
        <span>
          <strong class="block">Enable notifications</strong>
          <small class="text-muted-foreground">
            Receive notifications when focus mode is enabled or disabled.
          </small>
        </span>
        <Switch id="switch-notifications" defaultChecked />
      </label>
    </div>
  )
}
