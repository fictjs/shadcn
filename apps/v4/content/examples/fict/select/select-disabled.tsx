import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SelectDisabledExample() {
  return (
    <Select defaultValue="fict"><SelectTrigger><SelectValue placeholder="Disabled" /></SelectTrigger><SelectContent><SelectItem value="fict">Fict</SelectItem><SelectItem value="typescript">TypeScript</SelectItem></SelectContent></Select>
  )
}
