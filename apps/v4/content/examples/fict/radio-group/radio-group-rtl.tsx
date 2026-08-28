import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RadioGroupRtlExample() {
  return (
    <RadioGroup dir="rtl" defaultValue="comfortable"><label><RadioGroupItem value="default" /> Default</label><label><RadioGroupItem value="comfortable" /> Group Rtl</label></RadioGroup>
  )
}
