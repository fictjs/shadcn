import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'

export default function ProgressControlledExample() {
  let value = $state(50)
  return <div class="grid w-full max-w-sm gap-3"><Progress value={value} max={100} /><Slider value={[value]} min={0} max={100} step={1} aria-label="Progress" onValueChange={next => { value = next[0] }} /></div>
}
