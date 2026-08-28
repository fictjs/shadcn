import { BarSparkline, ChartContainer, ChartLegend } from '@/components/ui/chart'

export default function ChartRtlExample() {
  return (
    <ChartContainer dir="rtl"><h3>Rtl</h3><BarSparkline data={[{ label: "Jan", value: 42 }, { label: "Feb", value: 68 }, { label: "Mar", value: 51 }]} /><ChartLegend items={[{ label: "Visitors", colorClass: "bg-blue-500" }]} /></ChartContainer>
  )
}
