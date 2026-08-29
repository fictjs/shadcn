import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupOutlineExample() {
  return (
    <ToggleGroup variant="outline" type="single" defaultValue="all">
      <ToggleGroupItem value="all" aria-label="Toggle all">All</ToggleGroupItem>
      <ToggleGroupItem value="missed" aria-label="Toggle missed">Missed</ToggleGroupItem>
    </ToggleGroup>
  )
}
