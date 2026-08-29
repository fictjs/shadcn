import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

export default function InputGroupTextareaExample() {
  return (
    <div class="grid w-full max-w-md gap-4">
      <InputGroup>
        <InputGroupTextarea
          id="textarea-code-32"
          placeholder="console.log('Hello, world!');"
          class="min-h-[200px]"
        />
        <InputGroupAddon align="block-end" class="border-t">
          <InputGroupText>Line 1, Column 1</InputGroupText>
          <InputGroupButton size="sm" class="ml-auto" variant="default">
            Run <span aria-hidden="true">↵</span>
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupAddon align="block-start" class="border-b">
          <InputGroupText class="font-mono font-medium">
            <span aria-hidden="true">JS</span>
            script.js
          </InputGroupText>
          <InputGroupButton class="ml-auto" size="icon-xs">
            <span aria-hidden="true">↻</span>
          </InputGroupButton>
          <InputGroupButton variant="ghost" size="icon-xs">
            <span aria-hidden="true">□</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
