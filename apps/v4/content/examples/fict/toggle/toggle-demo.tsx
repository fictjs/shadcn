import { Toggle } from '@/components/ui/toggle'

function BookmarkIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z" /></svg>
}

export default function ToggleDemoExample() {
  return <Toggle variant="outline" size="sm" aria-label="Toggle bookmark"><BookmarkIcon />Bookmark</Toggle>
}
