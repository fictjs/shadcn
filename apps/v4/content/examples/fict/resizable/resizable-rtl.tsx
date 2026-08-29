import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

const translations = {
  ar: { dir: 'rtl', one: 'واحد', two: 'اثنان', three: 'ثلاثة' },
  he: { dir: 'rtl', one: 'אחד', two: 'שניים', three: 'שלושה' },
  en: { dir: 'ltr', one: 'One', two: 'Two', three: 'Three' },
} as const

export default function ResizableRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}>
        <option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option>
      </select>
      <ResizablePanelGroup dir={text().dir} direction="horizontal" class="max-w-md">
        <ResizablePanel defaultSize={50} class="flex items-center justify-center"><strong>{text().one}</strong></ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={25} class="flex items-center justify-center"><strong>{text().two}</strong></ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75} class="flex items-center justify-center"><strong>{text().three}</strong></ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
