import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SelectInvalidExample() {
  return (
    <div class="grid w-full max-w-48 gap-2">
      <label>Fruit</label>
      <Select>
        <SelectTrigger aria-invalid="true">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {['Apple', 'Banana', 'Blueberry'].map(fruit => (
              <SelectItem value={fruit.toLowerCase()}>{fruit}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p class="text-sm text-destructive">Please select a fruit.</p>
    </div>
  )
}
