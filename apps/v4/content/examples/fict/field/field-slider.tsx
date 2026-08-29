import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'

export default function FieldSliderExample() {
  let value = $state([200, 800])
  return (
    <Field class="w-80"><FieldLabel>Price Range</FieldLabel><FieldDescription>Set your budget range (${value[0]} - ${value[1]}).</FieldDescription><Slider value={() => value} onValueChange={next => value = next} min={0} max={1000} step={10} aria-label="Price Range" /></Field>
  )
}
