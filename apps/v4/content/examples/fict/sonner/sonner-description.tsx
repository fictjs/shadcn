import { Sonner, SonnerDescription, SonnerProvider, SonnerTitle, SonnerViewport } from '@/components/ui/sonner'

export default function SonnerDescriptionExample() {
  return (
    <SonnerProvider><SonnerViewport><Sonner><SonnerTitle>Description</SonnerTitle><SonnerDescription>Event has been created.</SonnerDescription></Sonner></SonnerViewport></SonnerProvider>
  )
}
