import { Sonner, SonnerDescription, SonnerProvider, SonnerTitle, SonnerViewport } from '@/components/ui/sonner'

export default function SonnerDemoExample() {
  return (
    <SonnerProvider><SonnerViewport><Sonner><SonnerTitle>Demo</SonnerTitle><SonnerDescription>Event has been created.</SonnerDescription></Sonner></SonnerViewport></SonnerProvider>
  )
}
