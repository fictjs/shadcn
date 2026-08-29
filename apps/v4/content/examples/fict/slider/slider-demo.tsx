import { Slider } from '@/components/ui/slider'

export default function SliderDemoExample() {
  return (
    <Slider defaultValue={[75]} min={0} max={100} step={1} />
  )
}
