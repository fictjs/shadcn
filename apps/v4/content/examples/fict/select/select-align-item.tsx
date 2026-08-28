import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SelectAlignItemExample() {
  return (
    <Select defaultValue="fict"><SelectTrigger><SelectValue placeholder="Align Item" /></SelectTrigger><SelectContent><SelectItem value="fict">Fict</SelectItem><SelectItem value="typescript">TypeScript</SelectItem></SelectContent></Select>
  )
}
