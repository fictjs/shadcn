import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const weights = ['light', 'normal', 'medium', 'bold'] as const

export default function ToggleGroupFontWeightSelectorExample() {
  let fontWeight = $state<(typeof weights)[number]>('normal')

  return (
    <Field>
      <FieldLabel>Font Weight</FieldLabel>
      <ToggleGroup type="single" value={fontWeight} onValueChange={value => { if (value) fontWeight = value as typeof fontWeight }} variant="outline" spacing={2} size="lg">
        {weights.map(value => (
          <ToggleGroupItem value={value} aria-label={value[0].toUpperCase() + value.slice(1)} class="flex size-16 flex-col items-center justify-center rounded-xl">
            <span class={`text-2xl leading-none font-${value}`}>Aa</span>
            <span class="text-xs text-muted-foreground">{value[0].toUpperCase() + value.slice(1)}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FieldDescription>Use <code class="rounded-md bg-muted px-1 py-0.5 font-mono">font-{fontWeight}</code> to set the font weight.</FieldDescription>
    </Field>
  )
}
