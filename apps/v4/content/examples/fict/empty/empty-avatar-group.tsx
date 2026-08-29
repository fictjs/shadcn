import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Empty, EmptyAction, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export default function EmptyAvatarGroupExample() { return <Empty><EmptyHeader><AvatarGroup><Avatar size="lg"><AvatarImage src="/avatars/shadcn.jpg" alt="shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar><Avatar size="lg"><AvatarImage src="/avatars/02.png" alt="maxleiter" /><AvatarFallback>ML</AvatarFallback></Avatar><Avatar size="lg"><AvatarImage src="/avatars/03.png" alt="evilrabbit" /><AvatarFallback>ER</AvatarFallback></Avatar></AvatarGroup><EmptyTitle>No Team Members</EmptyTitle><EmptyDescription>Invite your team to collaborate on this project.</EmptyDescription></EmptyHeader><EmptyAction><Button size="sm">Invite Members</Button></EmptyAction></Empty> }
