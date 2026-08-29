import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field'

const desktopItems = ['Hard disks', 'External disks', 'CDs, DVDs, and iPods', 'Connected servers']

export default function FieldCheckboxExample() {
  return (
    <FieldGroup class="w-80"><FieldSet><FieldLegend variant="label">Show these items on the desktop</FieldLegend><FieldDescription>Select the items you want to show on the desktop.</FieldDescription><FieldGroup>{desktopItems.map((label, index) => <Field orientation="horizontal"><Checkbox id={`desktop-${index}`} /><FieldLabel for={`desktop-${index}`}>{label}</FieldLabel></Field>)}</FieldGroup></FieldSet><FieldSeparator /><Field orientation="horizontal"><Checkbox id="sync-folders" defaultChecked /><FieldContent><FieldLabel for="sync-folders">Sync Desktop &amp; Documents folders</FieldLabel><FieldDescription>Your Desktop &amp; Documents folders are being synced with iCloud Drive. You can access them from other devices.</FieldDescription></FieldContent></Field></FieldGroup>
  )
}
