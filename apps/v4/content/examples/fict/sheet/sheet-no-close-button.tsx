import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default function SheetNoCloseButtonExample() {
  return (
    <Sheet><SheetTrigger>Open No Close Button</SheetTrigger><SheetContent><SheetHeader><SheetTitle>No Close Button</SheetTitle><SheetDescription>Edit your settings.</SheetDescription></SheetHeader><SheetFooter><SheetClose>Close</SheetClose></SheetFooter></SheetContent></Sheet>
  )
}
