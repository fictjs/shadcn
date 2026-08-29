import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

export default function PopoverFormExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent class="w-64" align="start">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <div class="mt-4 grid gap-4">
          <label for="width" class="grid grid-cols-2 items-center">
            Width
            <Input id="width" defaultValue="100%" />
          </label>
          <label for="height" class="grid grid-cols-2 items-center">
            Height
            <Input id="height" defaultValue="25px" />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
