import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function DropdownMenuRtlExample() {
  return (
    <DropdownMenu dir="rtl"><DropdownMenuTrigger>Open Menu Rtl</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem>Profile</DropdownMenuItem><DropdownMenuCheckboxItem checked>Notifications</DropdownMenuCheckboxItem><DropdownMenuItem>Log out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
  )
}
