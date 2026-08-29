import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination'

export default function PaginationSimpleExample() {
  return <Pagination><PaginationContent>{[1, 2, 3, 4, 5].map(page => <PaginationItem><PaginationLink href="#" isActive={page === 2}>{page}</PaginationLink></PaginationItem>)}</PaginationContent></Pagination>
}
