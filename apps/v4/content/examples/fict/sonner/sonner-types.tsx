import { Sonner, SonnerDescription, SonnerProvider, SonnerTitle, SonnerViewport } from '@/components/ui/sonner'

export default function SonnerTypesExample() {
  return (
    <SonnerProvider><SonnerViewport><Sonner><SonnerTitle>Types</SonnerTitle><SonnerDescription>Event has been created.</SonnerDescription></Sonner></SonnerViewport></SonnerProvider>
  )
}
