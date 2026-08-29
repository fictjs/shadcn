import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SelectGroupsExample() {
  return (
    <Select>
      <SelectTrigger class="w-full max-w-48">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          {['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'].map(item => (
            <SelectItem value={item.toLowerCase()}>{item}</SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          {['Carrot', 'Broccoli', 'Spinach'].map(item => (
            <SelectItem value={item.toLowerCase()}>{item}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
