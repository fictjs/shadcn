import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Customer Support', 'Human Resources', 'Finance', 'Operations']

export default function FieldSelectExample() {
  return (
    <Field class="w-80"><FieldLabel for="department">Department</FieldLabel><Select><SelectTrigger id="department"><SelectValue placeholder="Choose department" /></SelectTrigger><SelectContent>{departments.map(department => <SelectItem value={department.toLowerCase().replaceAll(' ', '-')}>{department}</SelectItem>)}</SelectContent></Select><FieldDescription>Select your department or area of work.</FieldDescription></Field>
  )
}
