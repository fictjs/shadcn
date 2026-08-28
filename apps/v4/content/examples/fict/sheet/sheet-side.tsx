import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default function SheetSideExample() {
  return (
    <Sheet><SheetTrigger>Open Side</SheetTrigger><SheetContent><SheetHeader><SheetTitle>Side</SheetTitle><SheetDescription>Edit your settings.</SheetDescription></SheetHeader><SheetFooter><SheetClose>Close</SheetClose></SheetFooter></SheetContent></Sheet>
  )
}
