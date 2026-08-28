import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

export default function DrawerRtlExample() {
  return (
    <Drawer dir="rtl"><DrawerTrigger>Open Rtl</DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Rtl</DrawerTitle><DrawerDescription>Adjust the value, then save.</DrawerDescription></DrawerHeader><div class="p-4">Goal: 350</div><DrawerFooter><button type="button">Save</button><DrawerClose>Cancel</DrawerClose></DrawerFooter></DrawerContent></Drawer>
  )
}
