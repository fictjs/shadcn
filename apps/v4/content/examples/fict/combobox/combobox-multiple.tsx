import { Combobox, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'

export default function ComboboxMultipleExample() {
  return (
    <Combobox defaultValue="Fict"><ComboboxInput placeholder="Search framework..." /><ComboboxList forceMount><ComboboxItem value="Fict">Fict</ComboboxItem><ComboboxItem value="Vue">Vue</ComboboxItem><ComboboxItem value="React">React</ComboboxItem></ComboboxList></Combobox>
  )
}
