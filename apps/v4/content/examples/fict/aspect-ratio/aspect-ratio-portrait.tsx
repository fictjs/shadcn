import { AspectRatio } from '@/components/ui/aspect-ratio'

export default function AspectRatioPortraitExample() {
  return (
    <AspectRatio ratio={3 / 4}><img class="h-full w-full rounded-md object-cover" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" alt="Landscape" /></AspectRatio>
  )
}
