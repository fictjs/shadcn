import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function TextareaInvalidExample() {
  return (
    <div class="grid gap-2"><Label for="message-invalid">Message</Label><Textarea id="message-invalid" aria-invalid="true" placeholder="Type your message here." rows={4} /><p class="text-sm text-destructive">Please enter a valid message.</p></div>
  )
}
