import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TabsRtlExample() {
  return (
    <Tabs dir="rtl" defaultValue="account"><TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList><TabsContent value="account">Rtl</TabsContent><TabsContent value="password">Change your password.</TabsContent></Tabs>
  )
}
