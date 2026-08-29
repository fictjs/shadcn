import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarTrigger } from '@/components/ui/menubar'

export default function MenubarRadioExample() {
  let user = $state('benoit')
  let theme = $state('system')
  return (
    <Menubar class="w-72"><MenubarMenu><MenubarTrigger>Profiles</MenubarTrigger><MenubarContent><MenubarRadioGroup value={() => user} onValueChange={value => user = value}><MenubarRadioItem value="andy">Andy</MenubarRadioItem><MenubarRadioItem value="benoit">Benoit</MenubarRadioItem><MenubarRadioItem value="luis">Luis</MenubarRadioItem></MenubarRadioGroup><MenubarSeparator /><MenubarItem inset>Edit...</MenubarItem><MenubarItem inset>Add Profile...</MenubarItem></MenubarContent></MenubarMenu><MenubarMenu><MenubarTrigger>Theme</MenubarTrigger><MenubarContent><MenubarRadioGroup value={() => theme} onValueChange={value => theme = value}><MenubarRadioItem value="light">Light</MenubarRadioItem><MenubarRadioItem value="dark">Dark</MenubarRadioItem><MenubarRadioItem value="system">System</MenubarRadioItem></MenubarRadioGroup></MenubarContent></MenubarMenu></Menubar>
  )
}
