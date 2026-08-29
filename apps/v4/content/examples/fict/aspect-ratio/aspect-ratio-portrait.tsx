import { AspectRatio } from '@/components/ui/aspect-ratio'

export default function AspectRatioPortraitExample() {
  return (
    <AspectRatio ratio={9 / 16} class="w-40 overflow-hidden rounded-md">
      <img class="h-full w-full object-cover grayscale dark:brightness-20" src="https://avatar.vercel.sh/shadcn1" alt="Photo" />
    </AspectRatio>
  )
}
