import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function TextareaButtonExample() {
  return (
    <div class="grid gap-2"><Textarea placeholder="Type your message here." rows={4} /><Button>Send message</Button></div>
  )
}
