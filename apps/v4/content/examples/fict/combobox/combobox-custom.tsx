import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

const countries = [
  ['argentina', 'Argentina', 'South America (ar)'],
  ['australia', 'Australia', 'Oceania (au)'],
  ['brazil', 'Brazil', 'South America (br)'],
  ['canada', 'Canada', 'North America (ca)'],
  ['china', 'China', 'Asia (cn)'],
  ['colombia', 'Colombia', 'South America (co)'],
  ['egypt', 'Egypt', 'Africa (eg)'],
  ['france', 'France', 'Europe (fr)'],
  ['germany', 'Germany', 'Europe (de)'],
  ['italy', 'Italy', 'Europe (it)'],
  ['japan', 'Japan', 'Asia (jp)'],
  ['kenya', 'Kenya', 'Africa (ke)'],
  ['mexico', 'Mexico', 'North America (mx)'],
  ['new-zealand', 'New Zealand', 'Oceania (nz)'],
  ['nigeria', 'Nigeria', 'Africa (ng)'],
  ['south-africa', 'South Africa', 'Africa (za)'],
  ['south-korea', 'South Korea', 'Asia (kr)'],
  ['united-kingdom', 'United Kingdom', 'Europe (gb)'],
  ['united-states', 'United States', 'North America (us)'],
] as const

export default function ComboboxCustomExample() {
  return (
    <Combobox><ComboboxInput placeholder="Search countries..." /><ComboboxContent><ComboboxEmpty>No countries found.</ComboboxEmpty><ComboboxList>{countries.map(([value, label, description]) => <ComboboxItem value={value}><Item size="xs" class="p-0"><ItemContent><ItemTitle>{label}</ItemTitle><ItemDescription>{description}</ItemDescription></ItemContent></Item></ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>
  )
}
