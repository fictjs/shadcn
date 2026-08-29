import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const directions = ['top', 'bottom', 'left', 'right'] as const

export default function ToggleGroupSizesExample() {
  return (
    <div class="flex flex-col gap-4">
      <ToggleGroup type="single" size="sm" defaultValue="top" variant="outline">
        {directions.map(value => <ToggleGroupItem value={value} aria-label={`Toggle ${value}`}>{value[0].toUpperCase() + value.slice(1)}</ToggleGroupItem>)}
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="top" variant="outline">
        {directions.map(value => <ToggleGroupItem value={value} aria-label={`Toggle ${value}`}>{value[0].toUpperCase() + value.slice(1)}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
  )
}
