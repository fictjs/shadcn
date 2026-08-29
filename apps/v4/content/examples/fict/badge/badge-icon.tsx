import { Badge } from '@/components/ui/badge'

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-icon="inline-start" aria-hidden="true">
      <path d="M12 3l2.1 2.1 3-.4.4 3 2.2 2.3-1.7 2.5.7 2.9-2.9.7-1.8 2.4-2-1.5-2 1.5-1.8-2.4-2.9-.7.7-2.9L4.3 10l2.2-2.3.4-3 3 .4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-icon="inline-end" aria-hidden="true">
      <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z" />
    </svg>
  )
}

export default function BadgeIconExample() {
  return (
    <div class="flex flex-wrap gap-2">
      <Badge variant="secondary"><VerifiedIcon />Verified</Badge>
      <Badge variant="outline">Bookmark<BookmarkIcon /></Badge>
    </div>
  )
}
