import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const plans = [['monthly', 'Monthly ($9.99/month)'], ['yearly', 'Yearly ($99.99/year)'], ['lifetime', 'Lifetime ($299.99)']] as const

export default function FieldRadioExample() {
  return (
    <FieldSet class="w-80"><FieldLegend variant="label">Subscription Plan</FieldLegend><FieldDescription>Yearly and lifetime plans offer significant savings.</FieldDescription><RadioGroup defaultValue="monthly">{plans.map(([value, label]) => <Field orientation="horizontal"><RadioGroupItem id={`plan-${value}`} value={value} /><FieldLabel for={`plan-${value}`}>{label}</FieldLabel></Field>)}</RadioGroup></FieldSet>
  )
}
