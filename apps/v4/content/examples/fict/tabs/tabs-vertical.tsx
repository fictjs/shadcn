import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TabsVerticalExample() {
  return (
    <Tabs orientation="vertical" defaultValue="account"><TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList><TabsContent value="account">Vertical</TabsContent><TabsContent value="password">Change your password.</TabsContent></Tabs>
  )
}
