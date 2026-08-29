import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function SelectAlignItemExample() {
  let aligned = $state(true)
  return (
    <div class="grid w-full max-w-xs gap-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <label for="align-item">Align Item</label>
          <p class="text-sm text-muted-foreground">Toggle to align the item with the trigger.</p>
        </div>
        <Switch
          id="align-item"
          checked={() => aligned}
          onCheckedChange={value => {
            aligned = value
          }}
        />
      </div>
      <Select defaultValue="banana">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position={aligned ? 'item-aligned' : 'popper'}>
          <SelectGroup>
            {['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'].map(fruit => (
              <SelectItem value={fruit.toLowerCase()}>{fruit}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
