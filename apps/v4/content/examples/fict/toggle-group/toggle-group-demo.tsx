import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

function FormatIcon(props: { kind: 'bold' | 'italic' | 'underline' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      {props.kind === 'bold' ? <path d="M7 5h6a4 4 0 0 1 0 8H7zm0 8h7a3 3 0 0 1 0 6H7z" /> : null}
      {props.kind === 'italic' ? <path d="M10 4h6M8 20h6M14 4 10 20" /> : null}
      {props.kind === 'underline' ? <><path d="M6 4v6a6 6 0 0 0 12 0V4" /><path d="M4 20h16" /></> : null}
    </svg>
  )
}

export default function ToggleGroupDemoExample() {
  return (
    <ToggleGroup variant="outline" type="multiple">
      <ToggleGroupItem value="bold" aria-label="Toggle bold"><FormatIcon kind="bold" /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic"><FormatIcon kind="italic" /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline"><FormatIcon kind="underline" /></ToggleGroupItem>
    </ToggleGroup>
  )
}
