import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function SheetDemoExample() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetClose class="absolute right-4 top-4" aria-label="Close">×</SheetClose>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
        </SheetHeader>
        <div class="grid flex-1 gap-4 py-4">
          <div class="grid gap-2">
            <Label for="sheet-demo-name">Name</Label>
            <Input id="sheet-demo-name" value="Pedro Duarte" />
          </div>
          <div class="grid gap-2">
            <Label for="sheet-demo-username">Username</Label>
            <Input id="sheet-demo-username" value="@peduarte" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild><Button variant="outline">Close</Button></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
