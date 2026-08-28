import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TabsDemoExample() {
  return (
    <Tabs defaultValue="account"><TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList><TabsContent value="account">Demo</TabsContent><TabsContent value="password">Change your password.</TabsContent></Tabs>
  )
}
