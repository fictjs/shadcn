import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'

export default function NavigationMenuDemoExample() {
  return (
    <NavigationMenu><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>Getting started</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/docs">Menu Demo</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>
  )
}
