import { Slider } from '@/components/ui/slider'

const directions = { ar: 'rtl', he: 'rtl', en: 'ltr' } as const

export default function SliderRtlExample() {
  let language = $state<keyof typeof directions>('ar')
  return <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof directions }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><Slider dir={directions[language]} defaultValue={[75]} min={0} max={100} /></div>
}
