import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RadioGroupDisabledExample() {
  return (
    <RadioGroup disabled defaultValue="comfortable"><label><RadioGroupItem value="default" /> Default</label><label><RadioGroupItem value="comfortable" /> Group Disabled</label></RadioGroup>
  )
}
