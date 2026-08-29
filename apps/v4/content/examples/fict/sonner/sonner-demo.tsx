import { Button } from '@/components/ui/button'
import { SonnerProvider, SonnerViewport, useSonner } from '@/components/ui/sonner'

function ToastButton() {
  const { show } = useSonner()

  const showToast = () => {
    show({
      title: 'Event has been created',
      description: 'Sunday, December 03, 2023 at 9:00 AM',
      action: { label: 'Undo' },
    })
  }

  return <Button variant="outline" onClick={showToast}>Show Toast</Button>
}

export default function SonnerDemoExample() {
  return (
    <SonnerProvider>
      <ToastButton />
      <SonnerViewport />
    </SonnerProvider>
  )
}
