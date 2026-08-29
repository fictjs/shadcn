import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function FieldResponsiveExample() {
  return (
    <form class="w-full max-w-lg"><FieldSet><FieldLegend>Profile</FieldLegend><FieldDescription>Fill in your profile information.</FieldDescription><FieldGroup><Field orientation="responsive"><FieldContent><FieldLabel for="profile-name">Name</FieldLabel><FieldDescription>Provide your full name for identification</FieldDescription></FieldContent><Input id="profile-name" placeholder="Evil Rabbit" required /></Field><Field orientation="responsive"><span /><div class="flex gap-2"><Button type="submit">Submit</Button><Button type="button" variant="outline">Cancel</Button></div></Field></FieldGroup></FieldSet></form>
  )
}
