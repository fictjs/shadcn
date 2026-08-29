import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

export default function ButtonGroupInputGroupExample() {
  let voiceEnabled = $state(false)
  return (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Add">
        +
      </Button>
      <InputGroup>
        <InputGroupInput placeholder="Send a message..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-pressed={voiceEnabled}
            onClick={() => {
              voiceEnabled = !voiceEnabled
            }}
            aria-label="Voice input"
          >
            {voiceEnabled ? '●' : '○'}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </ButtonGroup>
  )
}
