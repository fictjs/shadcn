import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from '@/components/ui/pagination'

const translations = {
  ar: { dir: 'rtl', previous: 'السابق', next: 'التالي', pages: ['١', '٢', '٣'] },
  he: { dir: 'rtl', previous: 'הקודם', next: 'הבא', pages: ['1', '2', '3'] },
  en: { dir: 'ltr', previous: 'Previous', next: 'Next', pages: ['1', '2', '3'] },
} as const

export default function PaginationRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]
  return <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><Pagination dir={text().dir}><PaginationContent><PaginationItem><PaginationLink href="#" class="w-auto px-3">{text().previous}</PaginationLink></PaginationItem>{text().pages.map((page, index) => <PaginationItem><PaginationLink href="#" isActive={index === 1}>{page}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationEllipsis /></PaginationItem><PaginationItem><PaginationLink href="#" class="w-auto px-3">{text().next}</PaginationLink></PaginationItem></PaginationContent></Pagination></div>
}
