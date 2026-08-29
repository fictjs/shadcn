import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const translations = {
  ar: { order: 'الطلب #4189', status: 'الحالة', shipped: 'تم الشحن', addressTitle: 'عنوان الشحن', address: '100 Market St, San Francisco', items: 'العناصر', item: '2x سماعات الاستوديو' },
  he: { order: 'הזמנה #4189', status: 'סטטוס', shipped: 'נשלח', addressTitle: 'כתובת משלוח', address: '100 Market St, San Francisco', items: 'פריטים', item: '2x אוזניות סטודיו' },
  en: { order: 'Order #4189', status: 'Status', shipped: 'Shipped', addressTitle: 'Shipping address', address: '100 Market St, San Francisco', items: 'Items', item: '2x Studio Headphones' },
} as const

function ToggleIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m7 15 5 5 5-5M7 9l5-5 5 5" /></svg> }

export default function CollapsibleRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  let open = $state(false)
  const direction = () => language === 'en' ? 'ltr' : 'rtl'
  const text = () => translations[language]
  return <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><Collapsible open={open} onOpenChange={value => { open = value }} class="flex w-[350px] flex-col gap-2" dir={direction()}><div class="flex items-center justify-between gap-4 px-4"><h4 class="text-sm font-semibold">{text().order}</h4><CollapsibleTrigger asChild><Button variant="ghost" size="icon" class="size-8"><ToggleIcon /><span class="sr-only">Toggle details</span></Button></CollapsibleTrigger></div><div class="flex items-center justify-between rounded-md border px-4 py-2 text-sm"><span>{text().status}</span><strong>{text().shipped}</strong></div><CollapsibleContent class="flex flex-col gap-2"><div class="rounded-md border px-4 py-2 text-sm"><strong>{text().addressTitle}</strong><p>{text().address}</p></div><div class="rounded-md border px-4 py-2 text-sm"><strong>{text().items}</strong><p>{text().item}</p></div></CollapsibleContent></Collapsible></div>
}
