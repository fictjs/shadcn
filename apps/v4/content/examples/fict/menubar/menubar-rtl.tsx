import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'

export default function MenubarRtlExample() {
  return (
    <Menubar dir="rtl"><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New Tab</MenubarItem><MenubarItem>Rtl</MenubarItem><MenubarItem>Print</MenubarItem></MenubarContent></MenubarMenu></Menubar>
  )
}
