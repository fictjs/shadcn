import { BarSparkline, ChartContainer } from '@/components/ui/chart'

const visitors = [
  [222, 150], [97, 180], [167, 120], [242, 260], [373, 290], [301, 340], [245, 180], [409, 320], [59, 110], [261, 190],
  [327, 350], [292, 210], [342, 380], [137, 220], [120, 170], [138, 190], [446, 360], [364, 410], [243, 180], [89, 150],
  [137, 200], [224, 170], [138, 230], [387, 290], [215, 250], [75, 130], [383, 420], [122, 180], [315, 240], [454, 380],
]

export default function ChartDemoExample() {
  let series = $state<'desktop' | 'mobile'>('desktop')
  const data = () => visitors.map((values, index) => ({ label: `Apr ${index + 1}`, value: values[series === 'desktop' ? 0 : 1] }))

  return (
    <ChartContainer class="w-full max-w-2xl">
      <header class="flex items-start justify-between gap-4"><div><h3>Bar Chart - Interactive</h3><p>Showing total visitors for the last 3 months</p></div><div class="flex"><button type="button" aria-pressed={series === 'desktop'} onClick={() => { series = 'desktop' }}>Desktop<strong>7,324</strong></button><button type="button" aria-pressed={series === 'mobile'} onClick={() => { series = 'mobile' }}>Mobile<strong>7,250</strong></button></div></header>
      <BarSparkline data={data} showGrid showAxis showTooltip primaryLabel={series === 'desktop' ? 'Desktop' : 'Mobile'} />
    </ChartContainer>
  )
}
