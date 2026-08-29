import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandTrigger } from '@/components/ui/command'

const groups = [
  ['Navigation', ['Home', 'Inbox', 'Documents', 'Folders']],
  ['Actions', ['New File', 'New Folder', 'Copy', 'Cut', 'Paste', 'Delete']],
  ['View', ['Grid View', 'List View', 'Zoom In', 'Zoom Out']],
  ['Account', ['Profile', 'Billing', 'Settings', 'Notifications', 'Help & Support']],
  ['Tools', ['Calculator', 'Calendar', 'Image Editor', 'Code Editor']],
] as const

export default function CommandScrollableExample() {
  return (
    <Command>
      <CommandTrigger class="rounded-md border px-4 py-2">Open Menu</CommandTrigger>
      <CommandDialog aria-label="Command Palette"><CommandInput placeholder="Type a command or search..." /><CommandList class="max-h-72"><CommandEmpty>No results found.</CommandEmpty>{groups.map(([heading, items]) => <CommandGroup heading={heading}>{items.map(item => <CommandItem value={item.toLowerCase().replaceAll(' ', '-')}>{item}</CommandItem>)}</CommandGroup>)}</CommandList></CommandDialog>
    </Command>
  )
}
