import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

export default function DrawerScrollableContentExample() {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild><Button variant="outline">Scrollable Content</Button></DrawerTrigger>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>Move Goal</DrawerTitle><DrawerDescription>Set your daily activity goal.</DrawerDescription></DrawerHeader>
        <div class="overflow-y-auto px-4">
          {Array.from({ length: 10 }, (_, index) => <p class="mb-4 leading-normal">Paragraph {index + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>)}
        </div>
        <DrawerFooter><Button>Submit</Button><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
