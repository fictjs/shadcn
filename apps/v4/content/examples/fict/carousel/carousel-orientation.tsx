import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

export default function CarouselOrientationExample() {
  return (
    <Carousel opts={{ align: 'start' }} orientation="vertical" class="w-full max-w-xs">
      <CarouselContent class="-mt-1 h-[270px] gap-0">
        {Array.from({ length: 5 }, (_, index) => <CarouselItem class="basis-1/2 pt-1"><div class="p-1"><Card><CardContent class="flex items-center justify-center p-6"><span class="text-3xl font-semibold">{index + 1}</span></CardContent></Card></div></CarouselItem>)}
      </CarouselContent>
      <CarouselPrevious>↑</CarouselPrevious>
      <CarouselNext>↓</CarouselNext>
    </Carousel>
  )
}
