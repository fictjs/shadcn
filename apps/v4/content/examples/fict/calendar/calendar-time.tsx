import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

function ClockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
}

export default function CalendarTimeExample() {
  let date = $state(new Date(new Date().getFullYear(), new Date().getMonth(), 12))

  return (
    <Card size="sm" class="mx-auto w-fit">
      <CardContent><Calendar mode="single" selected={() => date} onSelect={next => { if (next instanceof Date) date = next }} class="border-0 p-0" /></CardContent>
      <CardFooter class="border-t bg-card">
        <FieldGroup>
          <Field><FieldLabel for="time-from">Start Time</FieldLabel><InputGroup><InputGroupInput id="time-from" type="time" step="1" value="10:30:00" /><InputGroupAddon><ClockIcon /></InputGroupAddon></InputGroup></Field>
          <Field><FieldLabel for="time-to">End Time</FieldLabel><InputGroup><InputGroupInput id="time-to" type="time" step="1" value="12:30:00" /><InputGroupAddon><ClockIcon /></InputGroupAddon></InputGroup></Field>
        </FieldGroup>
      </CardFooter>
    </Card>
  )
}
