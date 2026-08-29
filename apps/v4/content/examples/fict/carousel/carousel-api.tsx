import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

export default function CarouselApiExample() {
  let api = $state<CarouselApi | null>(null)
  let current = $state(1)
  let count = $state(0)

  return (
    <div class="mx-auto max-w-[10rem] sm:max-w-xs">
      <Carousel setApi={next => { api = next; count = next.scrollSnapList().length; current = next.selectedScrollSnap() + 1; next.on('select', selected => { current = selected.selectedScrollSnap() + 1 }) }} class="w-full max-w-xs">
        <CarouselContent>
          {Array.from({ length: 5 }, (_, index) => <CarouselItem><Card class="m-px"><CardContent class="flex aspect-square items-center justify-center p-6"><span class="text-4xl font-semibold">{index + 1}</span></CardContent></Card></CarouselItem>)}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div class="py-2 text-center text-sm text-muted-foreground">Slide {current} of {count}</div>
      {api ? null : <span class="sr-only">Loading carousel</span>}
    </div>
  )
}
