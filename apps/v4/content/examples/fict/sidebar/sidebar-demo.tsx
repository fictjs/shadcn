import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarItem, SidebarLink, SidebarSection, SidebarSectionTitle } from '@/components/ui/sidebar'

const groups = [
  { title: 'Playground', items: ['History', 'Starred', 'Settings'] },
  { title: 'Models', items: ['Genesis', 'Explorer', 'Quantum'] },
  { title: 'Documentation', items: ['Introduction', 'Get Started', 'Tutorials', 'Changelog'] },
  { title: 'Settings', items: ['General', 'Team', 'Billing', 'Limits'] },
]

export default function SidebarDemoExample() {
  let collapsed = $state(false)
  let openGroups = $state<string[]>(['Playground'])
  const toggleGroup = (title: string) => { openGroups = openGroups.includes(title) ? openGroups.filter(value => value !== title) : [...openGroups, title] }

  return (
    <div class="flex h-[400px] w-full overflow-hidden rounded-lg border" onKeyDown={event => { if (event.ctrlKey && event.key === 'b') collapsed = !collapsed }}>
      <Sidebar class={collapsed ? 'w-12' : 'w-[252px]'}>
        <SidebarHeader><button class="flex w-full items-center gap-3"><span class="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">A</span>{collapsed ? null : <span class="text-left"><strong class="block">Acme Inc</strong><small>Enterprise</small></span>}</button></SidebarHeader>
        <SidebarContent><SidebarSection><SidebarSectionTitle>{collapsed ? null : 'Platform'}</SidebarSectionTitle>{groups.map(group => <div><SidebarItem aria-expanded={openGroups.includes(group.title)} onClick={() => toggleGroup(group.title)}><span>◇</span>{collapsed ? null : <span>{group.title}</span>}</SidebarItem>{!collapsed && openGroups.includes(group.title) ? <div class="ml-7 grid">{group.items.map(item => <SidebarLink href="#">{item}</SidebarLink>)}</div> : null}</div>)}</SidebarSection></SidebarContent>
        <SidebarFooter><button class="flex items-center gap-3"><img class="size-8 rounded-full" src="/avatars/shadcn.jpg" alt="shadcn" />{collapsed ? null : <span class="text-left"><strong class="block">shadcn</strong><small>m@example.com</small></span>}</button></SidebarFooter>
      </Sidebar>
      <main class="flex-1 p-3"><Button variant="ghost" size="icon" aria-label="Toggle Sidebar" onClick={() => { collapsed = !collapsed }}>☰</Button></main>
    </div>
  )
}
