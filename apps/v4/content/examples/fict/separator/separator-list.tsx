import { Separator } from '@/components/ui/separator'

const entries = [['Item 1', 'Value 1'], ['Item 2', 'Value 2'], ['Item 3', 'Value 3']]
export default function SeparatorListExample() { return <div class="grid w-72 gap-3">{entries.map((entry, index) => <>{index ? <Separator /> : null}<dl class="flex justify-between"><dt>{entry[0]}</dt><dd>{entry[1]}</dd></dl></>)}</div> }
