import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'

export default function ButtonGroupInputExample() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button variant="outline" aria-label="Search">
        <span aria-hidden="true">•</span>
      </Button>
    </ButtonGroup>
  )
}
