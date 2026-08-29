import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function DatePickerInputExample() {
  let value = $state('June 01, 2025')
  return (
    <label class="grid gap-2">
      Subscription Date
      <div class="flex">
        <Input
          value={value}
          onInput={event => {
            value = event.currentTarget.value
          }}
          placeholder="June 01, 2025"
        />
        <Popover>
          <PopoverTrigger aria-label="Select date">▣</PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar defaultValue={new Date(2025, 5, 1)} />
          </PopoverContent>
        </Popover>
      </div>
    </label>
  )
}
