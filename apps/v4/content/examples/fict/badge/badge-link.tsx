import { Badge } from '@/components/ui/badge'

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-icon="inline-end" aria-hidden="true">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  )
}

export default function BadgeLinkExample() {
  return (
    <Badge asChild>
      <a href="#link">Open Link<ExternalLinkIcon /></a>
    </Badge>
  )
}
