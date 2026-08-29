import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SelectDisabledExample() {
  return (
    <Select disabled>
      <SelectTrigger class="w-full max-w-48">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'].map(fruit => (
            <SelectItem value={fruit.toLowerCase()} disabled={fruit === 'Grapes'}>
              {fruit}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
