import { Kbd, KbdGroup } from '@/components/ui/kbd'

export default function KbdRtlExample() {
  let language = $state<'ar' | 'he' | 'en'>('ar')
  const direction = () => language === 'en' ? 'ltr' : 'rtl'
  return <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as 'ar' | 'he' | 'en' }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><div class="grid gap-4" dir={direction()}><KbdGroup><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>⌥</Kbd><Kbd>⌃</Kbd></KbdGroup><KbdGroup><Kbd>Ctrl</Kbd><span>+</span><Kbd>B</Kbd></KbdGroup></div></div>
}
