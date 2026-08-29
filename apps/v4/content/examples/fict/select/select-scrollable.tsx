import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const zones = {
  'North America': [
    'Eastern Standard Time',
    'Central Standard Time',
    'Mountain Standard Time',
    'Pacific Standard Time',
    'Alaska Standard Time',
    'Hawaii Standard Time',
  ],
  'Europe & Africa': [
    'Greenwich Mean Time',
    'Central European Time',
    'Eastern European Time',
    'Western European Summer Time',
    'Central Africa Time',
    'East Africa Time',
  ],
  Asia: [
    'Moscow Time',
    'India Standard Time',
    'China Standard Time',
    'Japan Standard Time',
    'Korea Standard Time',
    'Indonesia Central Standard Time',
  ],
  'Australia & Pacific': [
    'Australian Western Standard Time',
    'Australian Central Standard Time',
    'Australian Eastern Standard Time',
    'New Zealand Standard Time',
    'Fiji Time',
  ],
  'South America': ['Argentina Time', 'Bolivia Time', 'Brasilia Time', 'Chile Standard Time'],
}

export default function SelectScrollableExample() {
  return (
    <Select>
      <SelectTrigger class="w-full max-w-64">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(zones).map(([region, items]) => (
          <SelectGroup>
            <SelectLabel>{region}</SelectLabel>
            {items.map((item, index) => (
              <SelectItem value={`${region}-${index}`}>{item}</SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
