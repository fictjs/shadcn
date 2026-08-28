import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'

export default function CommandDemoExample() {
  return (
    <Command><CommandInput placeholder="Type a command..." /><CommandList><CommandEmpty>No results found.</CommandEmpty><CommandGroup heading="Suggestions"><CommandItem value="calendar">Calendar</CommandItem><CommandItem value="settings">Demo</CommandItem></CommandGroup><CommandSeparator /></CommandList></Command>
  )
}
