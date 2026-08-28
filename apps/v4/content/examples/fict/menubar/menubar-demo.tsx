import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'

export default function MenubarDemoExample() {
  return (
    <Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New Tab</MenubarItem><MenubarItem>Demo</MenubarItem><MenubarItem>Print</MenubarItem></MenubarContent></MenubarMenu></Menubar>
  )
}
