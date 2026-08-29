import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DropdownMenuCheckboxesIconsExample() {
  let bookmarks = $state(true)
  let history = $state(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Show</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={() => bookmarks}
          onCheckedChange={value => {
            bookmarks = value
          }}
        >
          ★ Bookmarks
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={() => history}
          onCheckedChange={value => {
            history = value
          }}
        >
          ◷ History
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
