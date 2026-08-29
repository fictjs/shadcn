import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandTrigger } from '@/components/ui/command'

export default function CommandShortcutsExample() {
  return (
    <Command>
      <CommandTrigger class="rounded-md border px-4 py-2">Open Menu</CommandTrigger>
      <CommandDialog aria-label="Command Palette"><CommandInput placeholder="Type a command or search..." /><CommandList><CommandEmpty>No results found.</CommandEmpty><CommandGroup heading="Settings"><CommandItem value="profile">Profile <span class="ml-auto">⌘P</span></CommandItem><CommandItem value="billing">Billing <span class="ml-auto">⌘B</span></CommandItem><CommandItem value="settings">Settings <span class="ml-auto">⌘S</span></CommandItem></CommandGroup></CommandList></CommandDialog>
    </Command>
  )
}
