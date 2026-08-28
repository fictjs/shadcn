import { Button } from '@/components/ui/button'

function ArrowUpIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 7-7 7 7M12 19V5" /></svg>
}

export default function ButtonRoundedExample() {
  return <Button variant="outline" size="icon" class="rounded-full" aria-label="Submit"><ArrowUpIcon /></Button>
}
