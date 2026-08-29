import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RadioGroupFieldsetExample() {
  return (
    <fieldset class="w-full max-w-xs">
      <legend class="font-medium">Subscription Plan</legend>
      <p class="mb-4 text-sm text-muted-foreground">
        Yearly and lifetime plans offer significant savings.
      </p>
      <RadioGroup defaultValue="monthly" class="grid gap-3">
        {[
          ['monthly', 'Monthly ($9.99/month)'],
          ['yearly', 'Yearly ($99.99/year)'],
          ['lifetime', 'Lifetime ($299.99)'],
        ].map(([value, label]) => (
          <label class="flex items-center gap-3">
            <RadioGroupItem value={value} />
            {label}
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  )
}
