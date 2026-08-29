import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RadioGroupDemoExample() {
  return (
    <RadioGroup defaultValue="comfortable" class="grid gap-3">
      {[
        ['default', 'Default'],
        ['comfortable', 'Comfortable'],
        ['compact', 'Compact'],
      ].map(([value, label]) => (
        <label class="flex items-center gap-3">
          <RadioGroupItem value={value} />
          {label}
        </label>
      ))}
    </RadioGroup>
  )
}
