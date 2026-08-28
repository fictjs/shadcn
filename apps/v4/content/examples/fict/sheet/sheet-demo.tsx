import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default function SheetDemoExample() {
  return (
    <Sheet><SheetTrigger>Open Demo</SheetTrigger><SheetContent><SheetHeader><SheetTitle>Demo</SheetTitle><SheetDescription>Edit your settings.</SheetDescription></SheetHeader><SheetFooter><SheetClose>Close</SheetClose></SheetFooter></SheetContent></Sheet>
  )
}
