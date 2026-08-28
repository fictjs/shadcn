import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadio,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function MoreIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>
}

export default function ButtonGroupDemoExample() {
  let label = $state('personal')

  return (
    <div class="flex flex-wrap gap-2">
      <ButtonGroup><Button variant="outline" size="icon" aria-label="Go back">←</Button></ButtonGroup>
      <ButtonGroup><Button variant="outline">Archive</Button><Button variant="outline">Report</Button></ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Snooze</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="More options"><MoreIcon /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as Read</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Snooze</DropdownMenuItem>
            <DropdownMenuItem>Add to Calendar</DropdownMenuItem>
            <DropdownMenuItem>Add to List</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Label As...</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadio value={label} onValueChange={value => { label = String(value) }}>
                  <DropdownMenuRadioItem value="personal">Personal</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="work">Work</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="other">Other</DropdownMenuRadioItem>
                </DropdownMenuRadio>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Trash</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  )
}
