import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'

export default function MenubarCheckboxExample() {
  return (
    <Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New Tab</MenubarItem><MenubarItem>Checkbox</MenubarItem><MenubarItem>Print</MenubarItem></MenubarContent></MenubarMenu></Menubar>
  )
}
