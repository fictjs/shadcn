import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Empty, EmptyAction, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export default function EmptyAvatarExample() { return <Empty><EmptyHeader><Avatar size="lg"><AvatarImage src="/avatars/shadcn.jpg" alt="shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar><EmptyTitle>User Offline</EmptyTitle><EmptyDescription>This user is currently offline. You can leave a message to notify them or try again later.</EmptyDescription></EmptyHeader><EmptyAction><Button size="sm">Leave Message</Button></EmptyAction></Empty> }
