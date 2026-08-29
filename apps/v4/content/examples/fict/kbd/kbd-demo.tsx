import { Kbd, KbdGroup } from '@/components/ui/kbd'

export default function KbdDemoExample() {
  return <div class="grid gap-4"><KbdGroup><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>⌥</Kbd><Kbd>⌃</Kbd></KbdGroup><KbdGroup><Kbd>Ctrl</Kbd><span>+</span><Kbd>B</Kbd></KbdGroup></div>
}
