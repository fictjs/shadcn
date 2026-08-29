import { Button } from '@/components/ui/button'
import { SonnerProvider, SonnerViewport, useSonner } from '@/components/ui/sonner'

function ToastButton() {
  const { show } = useSonner()
  return (
    <Button
      variant="outline"
      onClick={() => show({
        title: 'Event has been created',
        description: 'Monday, January 3rd at 6:00pm',
      })}
    >
      Show Toast
    </Button>
  )
}

export default function SonnerDescriptionExample() {
  return (
    <SonnerProvider>
      <ToastButton />
      <SonnerViewport />
    </SonnerProvider>
  )
}
