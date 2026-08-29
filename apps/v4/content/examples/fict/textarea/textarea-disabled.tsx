import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function TextareaDisabledExample() {
  return (
    <div class="grid gap-2"><Label for="message-disabled">Message</Label><Textarea id="message-disabled" disabled placeholder="Type your message here." rows={4} /></div>
  )
}
