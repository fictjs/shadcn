import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

const sides = ['top', 'right', 'bottom', 'left'] as const

export default function DrawerSidesExample() {
  return (
    <div class="flex flex-wrap gap-2">
      {sides.map(side => (
        <Drawer direction={side}>
          <DrawerTrigger asChild><Button variant="outline" class="capitalize">{side}</Button></DrawerTrigger>
          <DrawerContent>
            <DrawerHeader><DrawerTitle>Move Goal</DrawerTitle><DrawerDescription>Set your daily activity goal.</DrawerDescription></DrawerHeader>
            <div class="overflow-y-auto px-4">
              {Array.from({ length: 10 }, (_, index) => <p class="mb-4">Paragraph {index + 1}: Lorem ipsum dolor sit amet.</p>)}
            </div>
            <DrawerFooter><Button>Submit</Button><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  )
}
