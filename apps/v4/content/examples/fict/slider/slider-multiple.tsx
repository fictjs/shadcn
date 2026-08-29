import { Slider } from '@/components/ui/slider'

export default function SliderMultipleExample() {
  return (
    <Slider defaultValue={[10, 20, 70]} min={0} max={100} step={10} />
  )
}
