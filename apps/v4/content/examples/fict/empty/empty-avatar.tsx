import { Empty, EmptyAction, EmptyDescription, EmptyTitle } from '@/components/ui/empty'

export default function EmptyAvatarExample() {
  return (
    <Empty><EmptyTitle>Avatar</EmptyTitle><EmptyDescription>No items were found.</EmptyDescription><EmptyAction><button type="button">Create item</button></EmptyAction></Empty>
  )
}
