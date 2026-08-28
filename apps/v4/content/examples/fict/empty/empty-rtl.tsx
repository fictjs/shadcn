import { Empty, EmptyAction, EmptyDescription, EmptyTitle } from '@/components/ui/empty'

export default function EmptyRtlExample() {
  return (
    <Empty dir="rtl"><EmptyTitle>Rtl</EmptyTitle><EmptyDescription>No items were found.</EmptyDescription><EmptyAction><button type="button">Create item</button></EmptyAction></Empty>
  )
}
