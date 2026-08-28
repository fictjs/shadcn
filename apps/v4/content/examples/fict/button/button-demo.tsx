import { Button } from '@/components/ui/button'

function ArrowUpIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 7-7 7 7M12 19V5" /></svg>
}

export default function ButtonDemoExample() {
  return (
    <div class="flex flex-wrap items-center gap-2">
      <Button variant="outline">Button</Button>
      <Button variant="outline" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
    </div>
  )
}
