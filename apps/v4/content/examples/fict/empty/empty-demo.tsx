import { Empty, EmptyAction, EmptyDescription, EmptyTitle } from '@/components/ui/empty'

export default function EmptyDemoExample() {
  return (
    <Empty><EmptyTitle>Demo</EmptyTitle><EmptyDescription>No items were found.</EmptyDescription><EmptyAction><button type="button">Create item</button></EmptyAction></Empty>
  )
}
