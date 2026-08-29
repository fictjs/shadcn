import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

const languages = {
  ar: { dir: 'rtl', digits: ['٠', '١', '٢', '٣', '٤', '٥'] },
  he: { dir: 'rtl', digits: ['0', '1', '2', '3', '4', '5'] },
  en: { dir: 'ltr', digits: ['0', '1', '2', '3', '4', '5'] },
} as const

export default function CarouselRtlExample() {
  let language = $state<keyof typeof languages>('ar')
  const settings = () => languages[language]

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof languages }}>
        <option value="ar">Arabic (العربية)</option>
        <option value="he">Hebrew (עברית)</option>
        <option value="en">English</option>
      </select>
      <Carousel dir={settings().dir} opts={{ direction: settings().dir }} class="w-full max-w-[12rem] sm:max-w-xs">
        <CarouselContent>
          {Array.from({ length: 5 }, (_, index) => <CarouselItem><div class="p-1"><Card dir={settings().dir}><CardContent class="flex aspect-square items-center justify-center p-6"><span class="text-4xl font-semibold">{settings().digits[index + 1]}</span></CardContent></Card></div></CarouselItem>)}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
