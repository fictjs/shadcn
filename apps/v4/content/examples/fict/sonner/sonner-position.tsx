import { Sonner, SonnerDescription, SonnerProvider, SonnerTitle, SonnerViewport } from '@/components/ui/sonner'

export default function SonnerPositionExample() {
  return (
    <SonnerProvider><SonnerViewport><Sonner><SonnerTitle>Position</SonnerTitle><SonnerDescription>Event has been created.</SonnerDescription></Sonner></SonnerViewport></SonnerProvider>
  )
}
