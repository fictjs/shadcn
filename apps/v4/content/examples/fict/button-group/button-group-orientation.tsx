import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

export default function ButtonGroupOrientationExample() {
  return (
    <ButtonGroup orientation="vertical" aria-label="Media controls" class="h-fit">
      <Button variant="outline" size="icon">
        <span aria-hidden="true">•</span>
      </Button>
      <Button variant="outline" size="icon">
        <span aria-hidden="true">•</span>
      </Button>
    </ButtonGroup>
  )
}
