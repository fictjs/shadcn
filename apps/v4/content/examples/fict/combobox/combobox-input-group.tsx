import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList } from '@/components/ui/combobox'

const timezones = [['Americas', ['(GMT-5) New York', '(GMT-8) Los Angeles']], ['Europe', ['(GMT+0) London', '(GMT+1) Paris']], ['Asia/Pacific', ['(GMT+9) Tokyo', '(GMT+8) Shanghai']]] as const

function GlobeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
}

export default function ComboboxInputGroupExample() {
  return (
    <Combobox><ComboboxInput placeholder="Select a timezone"><GlobeIcon /></ComboboxInput><ComboboxContent class="w-60"><ComboboxList>{timezones.map(([group, items]) => <ComboboxGroup><ComboboxLabel>{group}</ComboboxLabel>{items.map(item => <ComboboxItem value={item}>{item}</ComboboxItem>)}</ComboboxGroup>)}</ComboboxList></ComboboxContent></Combobox>
  )
}
