import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 3 2.8 19h18.4L12 3Z" />
      <path d="M12 9v4M12 16h.01" />
    </svg>
  )
}

export default function AlertColorsExample() {
  return (
    <Alert class="border-amber-500/50 text-amber-700 dark:text-amber-300">
      <WarningIcon />
      <AlertTitle>Your subscription will expire in 3 days.</AlertTitle>
      <AlertDescription>
        Renew now to avoid service interruption or upgrade to a paid plan to continue using the service.
      </AlertDescription>
    </Alert>
  )
}
