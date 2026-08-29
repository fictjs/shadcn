import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RadioGroupInvalidExample() {
  return (
    <fieldset class="w-full max-w-xs">
      <legend class="font-medium">Notification Preferences</legend>
      <p class="mb-4 text-sm text-muted-foreground">
        Choose how you want to receive notifications.
      </p>
      <RadioGroup defaultValue="email" class="grid gap-3">
        {[
          ['email', 'Email only'],
          ['sms', 'SMS only'],
          ['both', 'Both Email & SMS'],
        ].map(([value, label]) => (
          <label class="flex items-center gap-3 text-destructive">
            <RadioGroupItem value={value} aria-invalid="true" />
            {label}
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  )
}
