import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

function BluetoothIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m7 7 10 10-5 4V3l5 4L7 17" /></svg>
}

export default function AlertDialogSmallMediaExample() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="outline">Show Dialog</Button></AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader><AlertDialogMedia><BluetoothIcon /></AlertDialogMedia><AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle><AlertDialogDescription>Do you want to allow the USB accessory to connect to this device?</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Don't allow</AlertDialogCancel><AlertDialogAction>Allow</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
