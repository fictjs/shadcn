import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxSeparator } from '@/components/ui/combobox'

const timezones = [
  ['Americas', ['(GMT-5) New York', '(GMT-8) Los Angeles', '(GMT-6) Chicago']],
  ['Europe', ['(GMT+0) London', '(GMT+1) Paris', '(GMT+1) Berlin']],
  ['Asia/Pacific', ['(GMT+9) Tokyo', '(GMT+8) Shanghai', '(GMT+8) Singapore']],
] as const

export default function ComboboxGroupsExample() {
  return (
    <Combobox><ComboboxInput placeholder="Select a timezone" /><ComboboxContent><ComboboxEmpty>No timezones found.</ComboboxEmpty><ComboboxList>{timezones.map(([group, items], index) => <><ComboboxGroup><ComboboxLabel>{group}</ComboboxLabel>{items.map(item => <ComboboxItem value={item}>{item}</ComboboxItem>)}</ComboboxGroup>{index < timezones.length - 1 ? <ComboboxSeparator /> : null}</>)}</ComboboxList></ComboboxContent></Combobox>
  )
}
