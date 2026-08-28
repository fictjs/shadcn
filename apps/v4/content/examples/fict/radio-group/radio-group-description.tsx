import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RadioGroupDescriptionExample() {
  return (
    <RadioGroup defaultValue="comfortable"><label><RadioGroupItem value="default" /> Default</label><label><RadioGroupItem value="comfortable" /> Group Description</label></RadioGroup>
  )
}
