import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxSeparator } from '@/components/ui/combobox'

const timezones = [
  ['Americas', ['(GMT-5) New York', '(GMT-8) Los Angeles', '(GMT-6) Chicago', '(GMT-5) Toronto', '(GMT-8) Vancouver', '(GMT-3) São Paulo']],
  ['Europe', ['(GMT+0) London', '(GMT+1) Paris', '(GMT+1) Berlin', '(GMT+1) Rome', '(GMT+1) Madrid', '(GMT+1) Amsterdam']],
  ['Asia/Pacific', ['(GMT+9) Tokyo', '(GMT+8) Shanghai', '(GMT+8) Singapore', '(GMT+4) Dubai', '(GMT+11) Sydney', '(GMT+9) Seoul']],
] as const

export default function ComboboxGroupsExample() {
  return (
    <Combobox><ComboboxInput placeholder="Select a timezone" /><ComboboxContent><ComboboxEmpty>No timezones found.</ComboboxEmpty><ComboboxList>{timezones.map(([group, items], index) => <><ComboboxGroup><ComboboxLabel>{group}</ComboboxLabel>{items.map(item => <ComboboxItem value={item}>{item}</ComboboxItem>)}</ComboboxGroup>{index < timezones.length - 1 ? <ComboboxSeparator /> : null}</>)}</ComboboxList></ComboboxContent></Combobox>
  )
}
