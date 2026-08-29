import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

const gettingStarted = [
  ['Introduction', 'Re-usable components built with Tailwind CSS.', '/docs'],
  ['Installation', 'How to install dependencies and structure your app.', '/docs/installation'],
  ['Typography', 'Styles for headings, paragraphs, lists...etc', '/docs/primitives/typography'],
]
const components = [
  [
    'Alert Dialog',
    'A modal dialog that interrupts the user with important content and expects a response.',
    '/docs/primitives/alert-dialog',
  ],
  [
    'Hover Card',
    'For sighted users to preview content available behind a link.',
    '/docs/primitives/hover-card',
  ],
  [
    'Progress',
    'Displays an indicator showing the completion progress of a task.',
    '/docs/primitives/progress',
  ],
  ['Scroll-area', 'Visually or semantically separates content.', '/docs/primitives/scroll-area'],
  ['Tabs', 'A set of layered content panels displayed one at a time.', '/docs/primitives/tabs'],
  [
    'Tooltip',
    'A popup that displays information related to an element.',
    '/docs/primitives/tooltip',
  ],
]

function Links(props: { items: string[][] }) {
  return (
    <ul class="grid gap-3 p-4">
      {props.items.map(([title, description, href]) => (
        <li>
          <NavigationMenuLink href={href}>
            <strong class="block">{title}</strong>
            <small>{description}</small>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}

export default function NavigationMenuDemoExample() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <Links items={gettingStarted} />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <Links items={components} />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
