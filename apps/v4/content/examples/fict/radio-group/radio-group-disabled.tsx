import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RadioGroupDisabledExample() {
  return (
    <RadioGroup defaultValue="option2" class="grid gap-3">
      <label class="flex items-center gap-3 opacity-50">
        <RadioGroupItem value="option1" disabled />
        Disabled
      </label>
      <label class="flex items-center gap-3">
        <RadioGroupItem value="option2" />
        Option 2
      </label>
      <label class="flex items-center gap-3">
        <RadioGroupItem value="option3" />
        Option 3
      </label>
    </RadioGroup>
  )
}
