import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function DropdownMenuRadioIconsExample() {
  return (
    <DropdownMenu><DropdownMenuTrigger>Open Menu Radio Icons</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem>Profile</DropdownMenuItem><DropdownMenuCheckboxItem checked>Notifications</DropdownMenuCheckboxItem><DropdownMenuItem>Log out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
  )
}
