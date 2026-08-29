import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SelectDemoExample() {
  return (
    <Select>
      <SelectTrigger class="w-full max-w-48">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          {['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'].map(fruit => (
            <SelectItem value={fruit.toLowerCase()}>{fruit}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
