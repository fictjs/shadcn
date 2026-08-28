import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SelectInvalidExample() {
  return (
    <Select defaultValue="fict"><SelectTrigger><SelectValue placeholder="Invalid" /></SelectTrigger><SelectContent><SelectItem value="fict">Fict</SelectItem><SelectItem value="typescript">TypeScript</SelectItem></SelectContent></Select>
  )
}
