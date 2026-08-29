import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function DatePickerNaturalLanguageExample() {
  let value = $state('In 2 days')
  return (
    <label class="grid gap-2">
      Schedule Date
      <div class="flex">
        <Input
          value={value}
          onInput={event => {
            value = event.currentTarget.value
          }}
          placeholder="Tomorrow or next week"
        />
        <Popover>
          <PopoverTrigger aria-label="Select date">▣</PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar captionLayout="dropdown" />
          </PopoverContent>
        </Popover>
      </div>
      <small>
        Your post will be published on <strong>August 27, 2026</strong>.
      </small>
    </label>
  )
}
