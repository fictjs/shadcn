import { BarSparkline, ChartContainer } from '@/components/ui/chart'

const data = [
  { label: 'Jan', value: 186, secondaryValue: 80 }, { label: 'Feb', value: 305, secondaryValue: 200 },
  { label: 'Mar', value: 237, secondaryValue: 120 }, { label: 'Apr', value: 73, secondaryValue: 190 },
  { label: 'May', value: 209, secondaryValue: 130 }, { label: 'Jun', value: 214, secondaryValue: 140 },
]

export default function ChartExampleGridExample() {
  return <ChartContainer><BarSparkline data={data} showGrid primaryLabel="Desktop" secondaryLabel="Mobile" /></ChartContainer>
}
