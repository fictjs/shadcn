import { Button } from '@/components/ui/button'

function CircleArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 13 4-4 4 4M12 9v6" /></svg>
}

export default function ButtonIconExample() {
  return <Button variant="outline" size="icon" aria-label="Submit"><CircleArrowIcon /></Button>
}
