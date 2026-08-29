import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const options = [
  ['default', 'Default', 'Standard spacing for most use cases.'],
  ['comfortable', 'Comfortable', 'More space between elements.'],
  ['compact', 'Compact', 'Minimal spacing for dense layouts.'],
]

export default function RadioGroupDescriptionExample() {
  return (
    <RadioGroup defaultValue="comfortable" class="grid gap-4">
      {options.map(([value, label, description]) => (
        <label class="flex items-start gap-3">
          <RadioGroupItem value={value} />
          <span>
            <strong class="block">{label}</strong>
            <small class="text-muted-foreground">{description}</small>
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}
