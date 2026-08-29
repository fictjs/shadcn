import { BarSparkline, ChartContainer, ChartLegend } from '@/components/ui/chart'

const data = [
  { label: 'Jan', value: 186, secondaryValue: 80 }, { label: 'Feb', value: 305, secondaryValue: 200 },
  { label: 'Mar', value: 237, secondaryValue: 120 }, { label: 'Apr', value: 73, secondaryValue: 190 },
  { label: 'May', value: 209, secondaryValue: 130 }, { label: 'Jun', value: 214, secondaryValue: 140 },
]

export default function ChartExampleLegendExample() {
  return <ChartContainer><BarSparkline data={data} showGrid showAxis showTooltip primaryLabel="Desktop" secondaryLabel="Mobile" /><ChartLegend items={[{ label: 'Desktop', colorClass: 'bg-primary' }, { label: 'Mobile', colorClass: 'bg-primary/45' }]} /></ChartContainer>
}
