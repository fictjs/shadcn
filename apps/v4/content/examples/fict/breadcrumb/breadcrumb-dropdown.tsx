import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

function DotIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="2.5" /></svg> }
function ChevronDownIcon() { return <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg> }

export default function BreadcrumbDropdownExample() {
  return (
    <Breadcrumb><BreadcrumbList>
      <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator><DotIcon /></BreadcrumbSeparator>
      <BreadcrumbItem><DropdownMenu><DropdownMenuTrigger asChild><button class="flex items-center gap-1">Components<ChevronDownIcon /></button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuItem>Documentation</DropdownMenuItem><DropdownMenuItem>Themes</DropdownMenuItem><DropdownMenuItem>GitHub</DropdownMenuItem></DropdownMenuContent></DropdownMenu></BreadcrumbItem>
      <BreadcrumbSeparator><DotIcon /></BreadcrumbSeparator><BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
    </BreadcrumbList></Breadcrumb>
  )
}
