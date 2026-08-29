import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

export default function FieldTextareaExample() {
  return (
    <FieldSet class="w-80"><FieldGroup><Field><FieldLabel for="feedback">Feedback</FieldLabel><Textarea id="feedback" placeholder="Your feedback helps us improve..." rows={4} /><FieldDescription>Share your thoughts about our service.</FieldDescription></Field></FieldGroup></FieldSet>
  )
}
