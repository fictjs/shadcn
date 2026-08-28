import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

export default function CarouselRtlExample() {
  return (
    <Carousel dir="rtl"><CarouselContent>{[1, 2, 3].map(item => <CarouselItem><div class="rounded-md border p-8">Slide {item}</div></CarouselItem>)}</CarouselContent><CarouselPrevious /><CarouselNext /></Carousel>
  )
}
