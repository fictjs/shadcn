import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function StatusIcon(props: { kind: 'check' | 'info' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      {props.kind === 'check' ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 12 2 2 4-4" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </>
      )}
    </svg>
  )
}

export default function AlertDemoExample() {
  return (
    <div class="grid gap-4">
      <Alert>
        <StatusIcon kind="check" />
        <AlertTitle>Payment successful</AlertTitle>
        <AlertDescription>
          Your payment of $29.99 has been processed. A receipt has been sent to your email address.
        </AlertDescription>
      </Alert>
      <Alert>
        <StatusIcon kind="info" />
        <AlertTitle>New feature available</AlertTitle>
        <AlertDescription>
          We've added dark mode support. You can enable it in your account settings.
        </AlertDescription>
      </Alert>
    </div>
  )
}
