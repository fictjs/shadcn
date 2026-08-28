import { Slider } from '@/components/ui/slider'

export default function SliderRangeExample() {
  return (
    <Slider defaultValue={[25, 75]} min={0} max={100} />
  )
}
