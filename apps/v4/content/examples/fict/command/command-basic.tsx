import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandTrigger } from '@/components/ui/command'

export default function CommandBasicExample() {
  return (
    <Command>
      <CommandTrigger class="rounded-md border px-4 py-2">Open Menu</CommandTrigger>
      <CommandDialog aria-label="Command Palette">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList><CommandEmpty>No results found.</CommandEmpty><CommandGroup heading="Suggestions"><CommandItem value="calendar">Calendar</CommandItem><CommandItem value="emoji">Search Emoji</CommandItem><CommandItem value="calculator">Calculator</CommandItem></CommandGroup></CommandList>
      </CommandDialog>
    </Command>
  )
}
