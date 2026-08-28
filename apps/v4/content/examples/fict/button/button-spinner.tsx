import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function ButtonSpinnerExample() {
  return (
    <div class="flex gap-2">
      <Button variant="outline" disabled><Spinner />Generating</Button>
      <Button variant="secondary" disabled>Downloading<Spinner /></Button>
    </div>
  )
}
