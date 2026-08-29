import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const environments = [['kubernetes', 'Kubernetes', 'Run GPU workloads on a K8s cluster.'], ['vm', 'Virtual Machine', 'Access a cluster to run GPU workloads.']] as const

export default function FieldChoiceCardExample() {
  return (
    <FieldSet class="w-80"><FieldLegend variant="label">Compute Environment</FieldLegend><FieldDescription>Select the compute environment for your cluster.</FieldDescription><RadioGroup defaultValue="kubernetes"><FieldGroup>{environments.map(([value, label, description]) => <FieldLabel class="rounded-lg border p-3" for={`environment-${value}`}><Field orientation="horizontal"><FieldContent><span class="font-medium">{label}</span><FieldDescription>{description}</FieldDescription></FieldContent><RadioGroupItem id={`environment-${value}`} value={value} /></Field></FieldLabel>)}</FieldGroup></RadioGroup></FieldSet>
  )
}
