import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

export default function ContextMenuRadioExample() {
  let person = $state('pedro')
  return (
    <ContextMenu>
      <ContextMenuTrigger class="flex h-40 w-72 items-center justify-center rounded-md border border-dashed">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>People</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup
          value={() => person}
          onValueChange={value => {
            person = value
          }}
        >
          <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
          <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
