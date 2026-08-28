import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'

export default function NavigationMenuRtlExample() {
  return (
    <NavigationMenu dir="rtl"><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>Getting started</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/docs">Menu Rtl</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>
  )
}
