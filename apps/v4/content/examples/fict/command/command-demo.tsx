import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'

export default function CommandDemoExample() {
  return (
    <Command class="w-96 rounded-lg border">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions"><CommandItem value="calendar">Calendar</CommandItem><CommandItem value="emoji">Search Emoji</CommandItem><CommandItem value="calculator" disabled>Calculator</CommandItem></CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings"><CommandItem value="profile">Profile <span class="ml-auto">⌘P</span></CommandItem><CommandItem value="billing">Billing <span class="ml-auto">⌘B</span></CommandItem><CommandItem value="settings">Settings <span class="ml-auto">⌘S</span></CommandItem></CommandGroup>
      </CommandList>
    </Command>
  )
}
