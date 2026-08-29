import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

function AppWindowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
}

function CodeIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></svg>
}

export default function TabsIconsExample() {
  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview"><AppWindowIcon />Preview</TabsTrigger>
        <TabsTrigger value="code"><CodeIcon />Code</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
