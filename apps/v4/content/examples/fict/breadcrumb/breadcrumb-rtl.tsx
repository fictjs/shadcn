import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const translations = {
  ar: { home: 'الرئيسية', components: 'المكونات', documentation: 'التوثيق', themes: 'السمات', github: 'جيت هاب', breadcrumb: 'مسار التنقل' },
  he: { home: 'בית', components: 'רכיבים', documentation: 'תיעוד', themes: 'ערכות נושא', github: 'גיטהאב', breadcrumb: 'פירורי לחם' },
  en: { home: 'Home', components: 'Components', documentation: 'Documentation', themes: 'Themes', github: 'GitHub', breadcrumb: 'Breadcrumb' },
} as const

function DotIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="2.5" /></svg> }
function ChevronDownIcon() { return <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg> }

export default function BreadcrumbRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const direction = () => language === 'en' ? 'ltr' : 'rtl'
  const text = () => translations[language]

  return (
    <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <Breadcrumb dir={direction()}><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">{text().home}</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator><DotIcon /></BreadcrumbSeparator><BreadcrumbItem><DropdownMenu><DropdownMenuTrigger asChild><button class="flex items-center gap-1">{text().components}<ChevronDownIcon /></button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>{text().documentation}</DropdownMenuItem><DropdownMenuItem>{text().themes}</DropdownMenuItem><DropdownMenuItem>{text().github}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></BreadcrumbItem><BreadcrumbSeparator><DotIcon /></BreadcrumbSeparator><BreadcrumbItem><BreadcrumbPage>{text().breadcrumb}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
    </div>
  )
}
