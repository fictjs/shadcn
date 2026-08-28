import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarItem, SidebarSection, SidebarSectionTitle } from '@/components/ui/sidebar'

export default function SidebarDemoExample() {
  return (
    <Sidebar><SidebarHeader>Fict App</SidebarHeader><SidebarContent><SidebarSection><SidebarSectionTitle>Navigation</SidebarSectionTitle><SidebarItem>Dashboard</SidebarItem><SidebarItem>Components</SidebarItem></SidebarSection></SidebarContent><SidebarFooter>Account</SidebarFooter></Sidebar>
  )
}
