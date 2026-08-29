import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from '@/components/ui/menubar'

function Icon(props: { name: string }) {
  return <svg aria-label={props.name} viewBox="0 0 24 24"><path d="M4 4h16v16H4zM8 9h8M8 13h6" /></svg>
}

export default function MenubarIconsExample() {
  return (
    <Menubar class="w-72"><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem><Icon name="File" />New File <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem><MenubarItem><Icon name="Folder" />Open Folder</MenubarItem><MenubarSeparator /><MenubarItem><Icon name="Save" />Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem></MenubarContent></MenubarMenu><MenubarMenu><MenubarTrigger>More</MenubarTrigger><MenubarContent><MenubarItem><Icon name="Settings" />Settings</MenubarItem><MenubarItem><Icon name="Help" />Help</MenubarItem><MenubarSeparator /><MenubarItem variant="destructive"><Icon name="Trash" />Delete</MenubarItem></MenubarContent></MenubarMenu></Menubar>
  )
}
