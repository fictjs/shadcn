import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'

export default function MenubarIconsExample() {
  return (
    <Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New Tab</MenubarItem><MenubarItem>Icons</MenubarItem><MenubarItem>Print</MenubarItem></MenubarContent></MenubarMenu></Menubar>
  )
}
