import { AspectRatio } from '@/components/ui/aspect-ratio'

export default function AspectRatioDemoExample() {
  return (
    <AspectRatio ratio={16 / 9} class="w-96 overflow-hidden rounded-md">
      <img class="h-full w-full object-cover grayscale dark:brightness-20" src="https://avatar.vercel.sh/shadcn1" alt="Photo" />
    </AspectRatio>
  )
}
