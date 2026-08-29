import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function TextareaFieldExample() {
  return (
    <div class="grid gap-2"><Label for="message">Message</Label><p class="text-sm text-muted-foreground">Enter your message below.</p><Textarea id="message" placeholder="Type your message here." rows={4} /></div>
  )
}
