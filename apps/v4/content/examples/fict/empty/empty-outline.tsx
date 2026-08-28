import { Empty, EmptyAction, EmptyDescription, EmptyTitle } from '@/components/ui/empty'

export default function EmptyOutlineExample() {
  return (
    <Empty><EmptyTitle>Outline</EmptyTitle><EmptyDescription>No items were found.</EmptyDescription><EmptyAction><button type="button">Create item</button></EmptyAction></Empty>
  )
}
