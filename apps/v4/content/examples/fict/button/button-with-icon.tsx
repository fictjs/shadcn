import { Button } from '@/components/ui/button'

function BranchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="5" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="19" r="2" /><path d="M6 7v10M8 7c4 0 4 5 8 5" /></svg>
}

export default function ButtonWithIconExample() {
  return <Button variant="outline" size="sm"><BranchIcon />New Branch</Button>
}
