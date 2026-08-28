import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RadioGroupChoiceCardExample() {
  return (
    <RadioGroup defaultValue="comfortable"><label><RadioGroupItem value="default" /> Default</label><label><RadioGroupItem value="comfortable" /> Group Choice Card</label></RadioGroup>
  )
}
