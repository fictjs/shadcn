import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ButtonGroupSelectExample() {
  let currency = $state('$')
  return (
    <ButtonGroup>
      <Select
        value={() => currency}
        onValueChange={value => {
          currency = value
        }}
      >
        <SelectTrigger class="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="$">$</SelectItem>
          <SelectItem value="€">€</SelectItem>
          <SelectItem value="£">£</SelectItem>
        </SelectContent>
      </Select>
      <Input aria-label="Amount" placeholder="0.00" />
      <Button variant="outline" size="icon" aria-label="Continue">
        →
      </Button>
    </ButtonGroup>
  )
}
