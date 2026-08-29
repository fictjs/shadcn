import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function AlertActionExample() {
  return (
    <Alert class="grid grid-cols-[1fr_auto] items-center gap-x-4">
      <div>
        <AlertTitle>Dark mode is now available</AlertTitle>
        <AlertDescription>Enable it under your profile settings to get started.</AlertDescription>
      </div>
      <Button size="sm" variant="outline">
        Enable
      </Button>
    </Alert>
  )
}
