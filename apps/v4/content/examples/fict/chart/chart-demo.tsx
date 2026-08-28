import { BarSparkline, ChartContainer, ChartLegend } from '@/components/ui/chart'

export default function ChartDemoExample() {
  return (
    <ChartContainer><h3>Demo</h3><BarSparkline data={[{ label: "Jan", value: 42 }, { label: "Feb", value: 68 }, { label: "Mar", value: 51 }]} /><ChartLegend items={[{ label: "Visitors", colorClass: "bg-blue-500" }]} /></ChartContainer>
  )
}
