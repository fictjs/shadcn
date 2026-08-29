import { Checkbox } from '@/components/ui/checkbox'

const items = [['hard-disks', 'Hard disks', true], ['external-disks', 'External disks', true], ['cds', 'CDs, DVDs, and iPods', false], ['servers', 'Connected servers', false]] as const

export default function CheckboxGroupExample() {
  return <fieldset class="grid gap-3"><legend>Show these items on the desktop:</legend><p class="text-sm text-muted-foreground">Select the items you want to show on the desktop.</p>{items.map(([id, label, checked]) => <label class="flex items-center gap-2"><Checkbox id={id} defaultChecked={checked} />{label}</label>)}</fieldset>
}
