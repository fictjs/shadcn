import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupRtlExample() {
  return (
    <ToggleGroup dir="rtl" type="single"><ToggleGroupItem value="bold">B</ToggleGroupItem><ToggleGroupItem value="italic">I</ToggleGroupItem><ToggleGroupItem value="underline">U</ToggleGroupItem></ToggleGroup>
  )
}
