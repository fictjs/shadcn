import { AspectRatio } from '@/components/ui/aspect-ratio'

export default function AspectRatioSquareExample() {
  return (
    <AspectRatio ratio={1} class="w-48 overflow-hidden rounded-md">
      <img class="h-full w-full object-cover grayscale dark:brightness-20" src="https://avatar.vercel.sh/shadcn1" alt="Photo" />
    </AspectRatio>
  )
}
