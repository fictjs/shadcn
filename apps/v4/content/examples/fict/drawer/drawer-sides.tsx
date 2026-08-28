import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

export default function DrawerSidesExample() {
  return (
    <Drawer><DrawerTrigger>Open Sides</DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Sides</DrawerTitle><DrawerDescription>Adjust the value, then save.</DrawerDescription></DrawerHeader><div class="p-4">Goal: 350</div><DrawerFooter><button type="button">Save</button><DrawerClose>Cancel</DrawerClose></DrawerFooter></DrawerContent></Drawer>
  )
}
