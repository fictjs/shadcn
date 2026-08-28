import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'

export default function MenubarRadioExample() {
  return (
    <Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New Tab</MenubarItem><MenubarItem>Radio</MenubarItem><MenubarItem>Print</MenubarItem></MenubarContent></MenubarMenu></Menubar>
  )
}
