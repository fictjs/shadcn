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

export default function PopoverDemoExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent class="w-80">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <div class="mt-4 grid gap-2">
          {[
            ['width', 'Width', '100%'],
            ['max-width', 'Max. width', '300px'],
            ['height', 'Height', '25px'],
            ['max-height', 'Max. height', 'none'],
          ].map(([id, label, value]) => (
            <label for={id} class="grid grid-cols-3 items-center gap-4">
              {label}
              <Input id={id} defaultValue={value} class="col-span-2 h-8" />
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
