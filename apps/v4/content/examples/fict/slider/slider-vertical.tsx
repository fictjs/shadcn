import { Slider } from '@/components/ui/slider'

export default function SliderVerticalExample() {
  return <div class="flex h-48 gap-8"><Slider orientation="vertical" defaultValue={[50]} min={0} max={100} /><Slider orientation="vertical" defaultValue={[25]} min={0} max={100} /></div>
}
