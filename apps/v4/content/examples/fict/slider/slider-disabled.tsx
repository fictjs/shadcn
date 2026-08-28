import { Slider } from '@/components/ui/slider'

export default function SliderDisabledExample() {
  return (
    <Slider disabled defaultValue={[50]} min={0} max={100} />
  )
}
