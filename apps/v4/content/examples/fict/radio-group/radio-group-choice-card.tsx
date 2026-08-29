import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const plans = [
  ['plus', 'Plus', 'For individuals and small teams.'],
  ['pro', 'Pro', 'For growing businesses.'],
  ['enterprise', 'Enterprise', 'For large teams and enterprises.'],
]

export default function RadioGroupChoiceCardExample() {
  return (
    <RadioGroup defaultValue="plus" class="grid w-full max-w-sm gap-3">
      {plans.map(([value, title, description]) => (
        <label class="flex items-center justify-between gap-4 rounded-lg border p-4">
          <span>
            <strong class="block">{title}</strong>
            <small class="text-muted-foreground">{description}</small>
          </span>
          <RadioGroupItem value={value} />
        </label>
      ))}
    </RadioGroup>
  )
}
