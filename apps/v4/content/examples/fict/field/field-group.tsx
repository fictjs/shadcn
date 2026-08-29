import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field'

export default function FieldGroupExample() {
  return (
    <FieldGroup class="w-80"><FieldSet><FieldLabel>Responses</FieldLabel><FieldDescription>Get notified when ChatGPT responds to requests that take time, like research or image generation.</FieldDescription><Field orientation="horizontal"><Checkbox id="response-push" defaultChecked disabled /><FieldLabel for="response-push">Push notifications</FieldLabel></Field></FieldSet><FieldSeparator /><FieldSet><FieldContent><FieldLabel>Tasks</FieldLabel><FieldDescription>Get notified when tasks you&apos;ve created have updates. <a href="#">Manage tasks</a></FieldDescription></FieldContent><Field orientation="horizontal"><Checkbox id="task-push" /><FieldLabel for="task-push">Push notifications</FieldLabel></Field><Field orientation="horizontal"><Checkbox id="task-email" /><FieldLabel for="task-email">Email notifications</FieldLabel></Field></FieldSet></FieldGroup>
  )
}
