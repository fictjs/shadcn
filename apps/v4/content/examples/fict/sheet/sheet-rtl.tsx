import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default function SheetRtlExample() {
  return (
    <Sheet dir="rtl"><SheetTrigger>Open Rtl</SheetTrigger><SheetContent><SheetHeader><SheetTitle>Rtl</SheetTitle><SheetDescription>Edit your settings.</SheetDescription></SheetHeader><SheetFooter><SheetClose>Close</SheetClose></SheetFooter></SheetContent></Sheet>
  )
}
