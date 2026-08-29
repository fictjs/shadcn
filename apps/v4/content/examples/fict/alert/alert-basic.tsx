import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export default function AlertBasicExample() {
  return (
    <Alert>
      <CheckIcon />
      <AlertTitle>Account updated successfully</AlertTitle>
      <AlertDescription>
        Your profile information has been saved. Changes will be reflected immediately.
      </AlertDescription>
    </Alert>
  )
}
