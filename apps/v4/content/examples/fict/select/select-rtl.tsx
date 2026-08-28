import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SelectRtlExample() {
  return (
    <Select dir="rtl" defaultValue="fict"><SelectTrigger><SelectValue placeholder="Rtl" /></SelectTrigger><SelectContent><SelectItem value="fict">Fict</SelectItem><SelectItem value="typescript">TypeScript</SelectItem></SelectContent></Select>
  )
}
