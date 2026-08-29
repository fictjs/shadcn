import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tabs = [
  ['overview', 'Overview', 'View your key metrics and recent project activity. Track progress across all your active projects.', 'You have 12 active projects and 3 pending tasks.'],
  ['analytics', 'Analytics', 'Track performance and user engagement metrics. Monitor trends and identify growth opportunities.', 'Page views are up 25% compared to last month.'],
  ['reports', 'Reports', 'Generate and download your detailed reports. Export data in multiple formats for analysis.', 'You have 5 reports ready and available to export.'],
  ['settings', 'Settings', 'Manage your account preferences and options. Customize your experience to fit your needs.', 'Configure notifications, security, and themes.'],
] as const

export default function TabsDemoExample() {
  return (
    <Tabs defaultValue="overview" class="w-[400px]">
      <TabsList>
        {tabs.map(([value, label]) => <TabsTrigger value={value}>{label}</TabsTrigger>)}
      </TabsList>
      {tabs.map(([value, label, description, content]) => (
        <TabsContent value={value}>
          <Card>
            <CardHeader><CardTitle>{label}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
            <CardContent class="text-sm text-muted-foreground">{content}</CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
