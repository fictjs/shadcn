import { Button } from '@/components/ui/button'
import { SonnerProvider, SonnerViewport, useSonner } from '@/components/ui/sonner'

const positions = [
  ['Top Left', 'top-left'],
  ['Top Center', 'top-center'],
  ['Top Right', 'top-right'],
  ['Bottom Left', 'bottom-left'],
  ['Bottom Center', 'bottom-center'],
  ['Bottom Right', 'bottom-right'],
] as const

function PositionButtons() {
  const { show } = useSonner()
  return (
    <div class="flex flex-wrap gap-2">
      {positions.map(([label, position]) => (
        <Button variant="outline" onClick={() => show({ title: 'Event has been created', position })}>
          {label}
        </Button>
      ))}
    </div>
  )
}

export default function SonnerPositionExample() {
  return (
    <SonnerProvider>
      <PositionButtons />
      <SonnerViewport />
    </SonnerProvider>
  )
}
