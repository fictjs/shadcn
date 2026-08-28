import { Button } from '@/components/ui/button'

function ArrowUpRightIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
}

export default function ButtonSizeExample() {
  return (
    <div class="flex flex-col items-start gap-8 sm:flex-row">
      <div class="flex items-start gap-2">
        <Button variant="outline" size="xs">Extra Small</Button>
        <Button variant="outline" size="icon-xs" aria-label="Extra small submit"><ArrowUpRightIcon /></Button>
      </div>
      <div class="flex items-start gap-2">
        <Button variant="outline" size="sm">Small</Button>
        <Button variant="outline" size="icon-sm" aria-label="Small submit"><ArrowUpRightIcon /></Button>
      </div>
      <div class="flex items-start gap-2">
        <Button variant="outline">Default</Button>
        <Button variant="outline" size="icon" aria-label="Default submit"><ArrowUpRightIcon /></Button>
      </div>
      <div class="flex items-start gap-2">
        <Button variant="outline" size="lg">Large</Button>
        <Button variant="outline" size="icon-lg" aria-label="Large submit"><ArrowUpRightIcon /></Button>
      </div>
    </div>
  )
}
