import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

export default function InputGroupButtonExample() {
  let copied = $state(false)
  let favorite = $state(false)
  return (
    <div class="grid gap-4">
      <InputGroup>
        <InputGroupInput defaultValue="https://x.com/shadcn" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            onClick={() => {
              copied = true
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Favorite"
            aria-pressed={favorite}
            onClick={() => {
              favorite = !favorite
            }}
          >
            {favorite ? '★' : '☆'}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Type to search..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Search</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
