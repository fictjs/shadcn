import { ChartTooltipContent } from '@/components/ui/chart'

export default function ChartTooltipExample() {
  return (
    <div class="grid grid-cols-2 gap-4">
      <ChartTooltipContent label="Page Views" items={[{ label: 'Desktop', value: 186 }, { label: 'Mobile', value: 80 }]} />
      <ChartTooltipContent items={[{ label: 'Chrome', value: '1,286' }, { label: 'Firefox', value: '1,000' }]} />
      <ChartTooltipContent label="Page Views" items={[{ label: 'Desktop', value: '12,486' }]} />
      <ChartTooltipContent items={[{ label: 'Chrome', value: '1,286' }]} />
    </div>
  )
}
