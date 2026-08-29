import { BarSparkline, ChartContainer, ChartLegend } from '@/components/ui/chart'

const translations = {
  ar: { dir: 'rtl', months: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون'], desktop: 'سطح المكتب', mobile: 'الجوال' },
  he: { dir: 'rtl', months: ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ'], desktop: 'שולחן עבודה', mobile: 'נייד' },
  en: { dir: 'ltr', months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], desktop: 'Desktop', mobile: 'Mobile' },
} as const
const values = [[186, 80], [305, 200], [237, 120], [73, 190], [209, 130], [214, 140]]

export default function ChartRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]
  const data = () => values.map((value, index) => ({ label: text().months[index], value: value[0], secondaryValue: value[1] })).reverse()

  return (
    <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><ChartContainer dir={text().dir}><BarSparkline data={data} dir={text().dir} showGrid showAxis showTooltip primaryLabel={text().desktop} secondaryLabel={text().mobile} /><ChartLegend items={[{ label: text().desktop }, { label: text().mobile, colorClass: 'bg-primary/45' }]} /></ChartContainer></div>
  )
}
