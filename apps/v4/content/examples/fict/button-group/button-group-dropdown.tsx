import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ButtonGroupDropdownExample() {
  return (
    <ButtonGroup>
      <Button variant="outline">Follow</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" class="pl-2!">
            <span aria-hidden="true">•</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-44">
            <DropdownMenuItem>
              <span aria-hidden="true">•</span>
              Mute Conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span aria-hidden="true">•</span>
              Mark as Read
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span aria-hidden="true">•</span>
              Report Conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span aria-hidden="true">•</span>
              Block User
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span aria-hidden="true">•</span>
              Share Conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span aria-hidden="true">•</span>
              Copy Conversation
            </DropdownMenuItem>
          <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <span aria-hidden="true">•</span>
              Delete Conversation
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
