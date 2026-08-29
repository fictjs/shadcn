import { AspectRatio } from '@/components/ui/aspect-ratio'

const translations = {
  ar: 'منظر طبيعي جميل',
  he: 'נוף יפה',
  en: 'Beautiful landscape',
} as const

export default function AspectRatioRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const direction = () => language === 'en' ? 'ltr' : 'rtl'

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <figure class="grid gap-2" dir={direction()}>
        <AspectRatio ratio={16 / 9} class="w-96 overflow-hidden rounded-md">
          <img class="h-full w-full object-cover grayscale dark:brightness-20" src="https://avatar.vercel.sh/shadcn1" alt="Photo" />
        </AspectRatio>
        <figcaption class="text-sm text-muted-foreground">{translations[language]}</figcaption>
      </figure>
    </div>
  )
}
