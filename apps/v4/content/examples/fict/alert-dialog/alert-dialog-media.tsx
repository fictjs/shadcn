import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

function ShareIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m12 8 3 3-3 3M9 11h6" /></svg>
}

export default function AlertDialogMediaExample() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="outline">Share Project</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogMedia><ShareIcon /></AlertDialogMedia><AlertDialogTitle>Share this project?</AlertDialogTitle><AlertDialogDescription>Anyone with the link will be able to view and edit this project.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Share</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
