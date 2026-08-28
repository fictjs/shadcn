import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function DropdownMenuAvatarExample() {
  return (
    <DropdownMenu><DropdownMenuTrigger>Open Menu Avatar</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem>Profile</DropdownMenuItem><DropdownMenuCheckboxItem checked>Notifications</DropdownMenuCheckboxItem><DropdownMenuItem>Log out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
  )
}
