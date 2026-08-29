import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

function ArrowIcon(props: { direction: 'previous' | 'next' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d={props.direction === 'previous' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} /></svg>
}

export default function PaginationIconsOnlyExample() {
  let rows = $state('25')
  return <div class="flex w-full items-center justify-between"><label class="flex items-center gap-2">Rows per page<NativeSelect value={rows} onChange={event => { rows = event.currentTarget.value }}>{['10', '25', '50', '100'].map(value => <NativeSelectOption value={value}>{value}</NativeSelectOption>)}</NativeSelect></label><Pagination class="mx-0 w-auto"><PaginationContent><PaginationItem><PaginationLink href="#" aria-label="Go to previous page"><ArrowIcon direction="previous" /></PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#" aria-label="Go to next page"><ArrowIcon direction="next" /></PaginationLink></PaginationItem></PaginationContent></Pagination></div>
}
