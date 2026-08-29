import { Button } from '@/components/ui/button'
import { SonnerProvider, SonnerViewport, useSonner } from '@/components/ui/sonner'

function TypeButtons() {
  const { show, dismiss } = useSonner()

  const showPromise = () => {
    const id = show({ title: 'Loading...', variant: 'promise', duration: 0 })
    void new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
      dismiss(id)
      show({ title: 'Event has been created', variant: 'success' })
    })
  }

  return (
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => show({ title: 'Event has been created' })}>Default</Button>
      <Button variant="outline" onClick={() => show({ title: 'Event has been created', variant: 'success' })}>Success</Button>
      <Button variant="outline" onClick={() => show({ title: 'Be at the area 10 minutes before the event time', variant: 'info' })}>Info</Button>
      <Button variant="outline" onClick={() => show({ title: 'Event start time cannot be earlier than 8am', variant: 'warning' })}>Warning</Button>
      <Button variant="outline" onClick={() => show({ title: 'Event has not been created', variant: 'error' })}>Error</Button>
      <Button variant="outline" onClick={showPromise}>Promise</Button>
    </div>
  )
}

export default function SonnerTypesExample() {
  return (
    <SonnerProvider>
      <TypeButtons />
      <SonnerViewport />
    </SonnerProvider>
  )
}
