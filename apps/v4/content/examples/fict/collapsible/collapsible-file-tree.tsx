import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const files = ['app.tsx', 'layout.tsx', 'globals.css', 'package.json', 'tsconfig.json', 'README.md', '.gitignore']

function FileIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" /></svg> }

export default function CollapsibleFileTreeExample() {
  return <Card class="w-64"><Tabs defaultValue="explorer"><CardHeader><TabsList><TabsTrigger value="explorer">Explorer</TabsTrigger><TabsTrigger value="outline">Outline</TabsTrigger></TabsList></CardHeader><CardContent><TabsContent value="explorer" class="grid gap-1">{files.map(file => <button type="button" class="flex items-center gap-2"><FileIcon />{file}</button>)}</TabsContent><TabsContent value="outline">No symbols found.</TabsContent></CardContent></Tabs></Card>
}
