import { Slider } from '@/components/ui/slider'

export default function SliderControlledExample() {
  let values = $state([0.3, 0.7])
  return <div class="grid w-full max-w-sm gap-3"><div class="flex justify-between"><label>Temperature</label><span>{values[0]}, {values[1]}</span></div><Slider value={values} min={0} max={1} step={0.1} onValueChange={next => { values = next }} /></div>
}
