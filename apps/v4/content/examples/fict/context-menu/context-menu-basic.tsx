import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu'

export default function ContextMenuBasicExample() {
  return (
    <ContextMenu><ContextMenuTrigger class="flex h-36 w-64 items-center justify-center rounded-md border border-dashed">Right click here</ContextMenuTrigger><ContextMenuContent><ContextMenuItem>Menu Basic</ContextMenuItem><ContextMenuSub><ContextMenuSubTrigger>More</ContextMenuSubTrigger><ContextMenuSubContent><ContextMenuItem>Save</ContextMenuItem></ContextMenuSubContent></ContextMenuSub></ContextMenuContent></ContextMenu>
  )
}
