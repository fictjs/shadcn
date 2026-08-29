import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function MenuIcon() { return <span aria-hidden="true">◇</span> }

export default function DropdownMenuComplexExample() {
  let view = $state({ sidebar: true, status: false })
  let theme = $state('light')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline">Complex Menu</Button></DropdownMenuTrigger>
      <DropdownMenuContent class="max-h-72 w-44 overflow-y-auto">
        <DropdownMenuGroup><DropdownMenuLabel>File</DropdownMenuLabel>
          <DropdownMenuItem><MenuIcon />New File<DropdownMenuShortcut>⌘N</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem><MenuIcon />New Folder<DropdownMenuShortcut>⇧⌘N</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuSub><DropdownMenuSubTrigger><MenuIcon />Open Recent</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent><DropdownMenuGroup><DropdownMenuLabel>Recent Projects</DropdownMenuLabel><DropdownMenuItem><MenuIcon />Project Alpha</DropdownMenuItem><DropdownMenuItem><MenuIcon />Project Beta</DropdownMenuItem><DropdownMenuSub><DropdownMenuSubTrigger>More Projects</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent><DropdownMenuItem>Project Gamma</DropdownMenuItem><DropdownMenuItem>Project Delta</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuItem><MenuIcon />Browse...</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub>
          <DropdownMenuSeparator /><DropdownMenuItem><MenuIcon />Save<DropdownMenuShortcut>⌘S</DropdownMenuShortcut></DropdownMenuItem><DropdownMenuItem><MenuIcon />Export<DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut></DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup><DropdownMenuLabel>View</DropdownMenuLabel><DropdownMenuCheckboxItem checked={() => view.sidebar} onCheckedChange={sidebar => { view = { ...view, sidebar } }}><MenuIcon />Show Sidebar</DropdownMenuCheckboxItem><DropdownMenuCheckboxItem checked={() => view.status} onCheckedChange={status => { view = { ...view, status } }}><MenuIcon />Show Status Bar</DropdownMenuCheckboxItem><DropdownMenuSub><DropdownMenuSubTrigger><MenuIcon />Theme</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent><DropdownMenuLabel>Appearance</DropdownMenuLabel><DropdownMenuRadioGroup value={() => theme} onValueChange={value => { theme = value }}>{['Light', 'Dark', 'System'].map(label => <DropdownMenuRadioItem value={label.toLowerCase()}>{label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub></DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup><DropdownMenuLabel>Account</DropdownMenuLabel><DropdownMenuItem><MenuIcon />Profile<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem><DropdownMenuItem><MenuIcon />Billing</DropdownMenuItem><DropdownMenuSub><DropdownMenuSubTrigger><MenuIcon />Settings</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent><DropdownMenuLabel>Preferences</DropdownMenuLabel><DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem><DropdownMenuItem>Language</DropdownMenuItem><DropdownMenuSub><DropdownMenuSubTrigger>Notifications</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent><DropdownMenuLabel>Notification Types</DropdownMenuLabel><DropdownMenuCheckboxItem checked>Push Notifications</DropdownMenuCheckboxItem><DropdownMenuCheckboxItem checked>Email Notifications</DropdownMenuCheckboxItem></DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub><DropdownMenuSeparator /><DropdownMenuItem>Privacy &amp; Security</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub></DropdownMenuGroup>
        <DropdownMenuSeparator /><DropdownMenuItem>Help &amp; Support</DropdownMenuItem><DropdownMenuItem>Documentation</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive"><MenuIcon />Sign Out<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
