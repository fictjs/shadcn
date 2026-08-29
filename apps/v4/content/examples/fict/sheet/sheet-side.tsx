import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const sides = ['top', 'right', 'bottom', 'left'] as const

export default function SheetSideExample() {
  return (
    <div class="flex flex-wrap gap-2">
      {sides.map(side => (
        <Sheet>
          <SheetTrigger asChild><Button variant="outline" class="capitalize">{side}</Button></SheetTrigger>
          <SheetContent side={side} class="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]">
            <SheetClose class="absolute right-4 top-4" aria-label="Close">×</SheetClose>
            <SheetHeader>
              <SheetTitle>Edit profile {side}</SheetTitle>
              <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
            </SheetHeader>
            <div class="overflow-y-auto px-4">
              {Array.from({ length: 10 }, (_, index) => (
                <p class="mb-2 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              ))}
            </div>
            <SheetFooter>
              <Button type="submit">Save changes</Button>
              <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
