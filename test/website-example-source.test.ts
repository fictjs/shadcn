import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { DEFAULT_CONFIG } from '../src/core/constants'
import { getBuiltinComponent, listBuiltinComponentNames } from '../src/registry'
import { renderRegistryEntryFiles } from '../src/registry/render'
import {
  extractFictRegistryDependencies,
  extractFictRegistryExports,
  loadFictExampleSource,
  validateFictExampleSource,
  validateFictRegistryImports,
} from '../scripts/lib/fict-example-source.mjs'

const repositoryExampleRoot = path.join(process.cwd(), 'apps/v4/content/examples/fict')
const previewCatalog = JSON.parse(fs.readFileSync(
  path.join(process.cwd(), 'apps/v4/content/docs/components/fict/preview-catalog.json'),
  'utf8'
)) as Record<string, string[]>

function expectCuratedFamily(family: string) {
  for (const previewName of previewCatalog[family]) {
    const source = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: family,
      previewName,
    })
    expect(source, previewName).not.toBeNull()
    expect(source, previewName).not.toContain('import * as UI')
  }
}

describe('Fict website example sources', () => {
  it('loads a curated Fict source with a stable trailing newline', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fict-example-source-'))
    const componentRoot = path.join(root, 'button')
    fs.mkdirSync(componentRoot, { recursive: true })
    fs.writeFileSync(
      path.join(componentRoot, 'button-size.tsx'),
      "import { Button } from '@/components/ui/button'\n\nexport default function ButtonSizeExample() {\n  return <Button size=\"sm\">Small</Button>\n}\n",
      'utf8'
    )

    expect(loadFictExampleSource({
      exampleRoot: root,
      componentName: 'button',
      previewName: 'button-size',
    })).toMatch(/<Button size="sm">Small<\/Button>\n}\n$/)
    expect(loadFictExampleSource({
      exampleRoot: root,
      componentName: 'button-group',
      previewName: 'button-size',
    })).toMatch(/<Button size="sm">Small<\/Button>/)
    expect(loadFictExampleSource({
      exampleRoot: root,
      componentName: 'button',
      previewName: 'button-demo',
    })).toBeNull()

    fs.rmSync(root, { recursive: true, force: true })
  })

  it('derives registry dependencies from curated UI imports', () => {
    const source = `import { Button } from '@/components/ui/button'
import { ButtonGroup } from "@/components/ui/button-group"
import { format } from '@/lib/utils'

export default function Demo() { return <ButtonGroup><Button>{format('Save')}</Button></ButtonGroup> }`

    expect(extractFictRegistryDependencies(source)).toEqual(['button', 'button-group'])
  })

  it('provides explicit Fict source for every catalog preview', () => {
    for (const family of Object.keys(previewCatalog)) {
      expectCuratedFamily(family)
    }
  })

  it('only imports symbols exported by the Fict registry', () => {
    const registryExports = new Map(
      listBuiltinComponentNames().map(componentName => {
        const entry = getBuiltinComponent(componentName)
        expect(entry, componentName).not.toBeNull()
        const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
          .map(file => file.content)
          .join('\n')
        return [componentName, extractFictRegistryExports(source)]
      }),
    )

    for (const [family, previewNames] of Object.entries(previewCatalog)) {
      for (const previewName of new Set(previewNames)) {
        const source = loadFictExampleSource({
          exampleRoot: repositoryExampleRoot,
          componentName: family,
          previewName,
        })
        validateFictRegistryImports(source!, registryExports, `${family}/${previewName}`)
      }
    }
  })

  it('provides curated Fict source for every Button preview', () => {
    expectCuratedFamily('button')

    const sizeSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'button',
      previewName: 'button-size',
    })
    expect(sizeSource).toContain('size="xs"')
    expect(sizeSource).toContain('size="icon-xs"')
    expect(sizeSource).toContain('size="icon-lg"')

    const asChildSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'button',
      previewName: 'button-aschild',
    })
    expect(asChildSource).toContain('<Button asChild><a href="/login">Login</a></Button>')
  })

  it('provides curated Fict source for every Accordion preview', () => {
    expectCuratedFamily('accordion')

    const multipleSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'accordion',
      previewName: 'accordion-multiple',
    })
    expect(multipleSource).toContain('type="multiple"')
    expect(multipleSource).toContain('defaultValue={["notifications"]}')

    const disabledSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'accordion',
      previewName: 'accordion-disabled',
    })
    expect(disabledSource).toContain('<AccordionItem value="item-2" disabled>')

    const rtlSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'accordion',
      previewName: 'accordion-rtl',
    })
    expect(rtlSource).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(rtlSource).not.toContain('language-selector')
  })

  it('provides curated Fict source for every Dialog preview', () => {
    expectCuratedFamily('dialog')

    const demoSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'dialog',
      previewName: 'dialog-demo',
    })
    expect(demoSource).toContain('<DialogContent class="sm:max-w-sm">')
    expect(demoSource).toContain('<DialogTrigger asChild>')

    const rtlSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'dialog',
      previewName: 'dialog-rtl',
    })
    expect(rtlSource).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(rtlSource).not.toContain('language-selector')
  })

  it('keeps every Badge source aligned with its rendered preview', () => {
    expectCuratedFamily('badge')

    const loadBadge = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'badge',
      previewName,
    })!

    expect(loadBadge('badge-demo').match(/<Badge(?:\s|>)/g)).toHaveLength(4)
    expect(loadBadge('badge-variants')).toContain('<Badge variant="ghost">Ghost</Badge>')
    expect(loadBadge('badge-icon')).toContain('<VerifiedIcon />Verified')
    expect(loadBadge('badge-icon')).toContain('Bookmark<BookmarkIcon />')
    expect(loadBadge('badge-spinner')).toContain('<Spinner data-icon="inline-start" />Deleting')
    expect(loadBadge('badge-link')).toContain('<Badge asChild>')
    expect(loadBadge('badge-link')).toContain('<a href="#link">')
    expect(loadBadge('badge-colors').match(/<Badge(?:\s|>)/g)).toHaveLength(5)
    expect(loadBadge('badge-rtl').match(/<Badge(?:\s|>)/g)).toHaveLength(6)
    expect(loadBadge('badge-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
  })

  it('keeps every Alert source aligned with its rendered preview', () => {
    expectCuratedFamily('alert')

    const loadAlert = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'alert',
      previewName,
    })!

    expect(loadAlert('alert-demo').match(/<Alert(?:\s|>)/g)).toHaveLength(2)
    expect(loadAlert('alert-demo')).toContain('Payment successful')
    expect(loadAlert('alert-basic')).toContain('Account updated successfully')
    expect(loadAlert('alert-destructive')).toContain('<Alert variant="destructive">')
    expect(loadAlert('alert-action')).toContain('<Button size="sm" variant="outline">')
    expect(loadAlert('alert-action')).toContain('Enable')
    expect(loadAlert('alert-colors')).toContain('border-amber-500/50')
    expect(loadAlert('alert-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadAlert('alert-rtl')).toContain('translations[language].map')
  })

  it('keeps every Alert Dialog source aligned with its rendered preview', () => {
    expectCuratedFamily('alert-dialog')

    const loadDialog = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'alert-dialog',
      previewName,
    })!

    expect(loadDialog('alert-dialog-demo')).toContain('Are you absolutely sure?')
    expect(loadDialog('alert-dialog-basic')).toContain('<AlertDialogTrigger asChild>')
    expect(loadDialog('alert-dialog-small')).toContain('<AlertDialogContent size="sm">')
    expect(loadDialog('alert-dialog-media')).toContain('<AlertDialogMedia>')
    expect(loadDialog('alert-dialog-small-media')).toContain('<BluetoothIcon />')
    expect(loadDialog('alert-dialog-destructive')).toContain('<AlertDialogAction variant="destructive">')
    expect(loadDialog('alert-dialog-destructive')).toContain('<a href="#settings">Settings</a>')
    expect(loadDialog('alert-dialog-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadDialog('alert-dialog-rtl')).toContain('translations[language].map')
  })

  it('keeps every Aspect Ratio source aligned with its rendered preview', () => {
    expectCuratedFamily('aspect-ratio')

    const loadAspectRatio = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'aspect-ratio',
      previewName,
    })!

    expect(loadAspectRatio('aspect-ratio-demo')).toContain('ratio={16 / 9}')
    expect(loadAspectRatio('aspect-ratio-square')).toContain('ratio={1}')
    expect(loadAspectRatio('aspect-ratio-portrait')).toContain('ratio={9 / 16}')
    expect(loadAspectRatio('aspect-ratio-portrait')).not.toContain('ratio={3 / 4}')
    expect(loadAspectRatio('aspect-ratio-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadAspectRatio('aspect-ratio-rtl')).toContain('<figcaption')
    for (const previewName of previewCatalog['aspect-ratio']) {
      expect(loadAspectRatio(previewName)).toContain('src="https://avatar.vercel.sh/shadcn1"')
      expect(loadAspectRatio(previewName)).toContain('alt="Photo"')
    }
  })

  it('keeps every Avatar source aligned with its rendered preview', () => {
    expectCuratedFamily('avatar')

    const loadAvatar = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'avatar',
      previewName,
    })!

    expect(loadAvatar('avatar-demo').match(/<Avatar(?:\s|>)/g)).toHaveLength(5)
    expect(loadAvatar('avatar-badge')).toContain('<AvatarBadge class="bg-green-600 dark:bg-green-800" />')
    expect(loadAvatar('avatar-badge-icon')).toContain('<AvatarBadge><PlusIcon /></AvatarBadge>')
    expect(loadAvatar('avatar-group').match(/<Avatar(?:\s|>)/g)).toHaveLength(3)
    expect(loadAvatar('avatar-group-count')).toContain('<AvatarGroupCount>+3</AvatarGroupCount>')
    expect(loadAvatar('avatar-group-count-icon')).toContain('<AvatarGroupCount><PlusIcon /></AvatarGroupCount>')
    expect(loadAvatar('avatar-size')).toContain('<Avatar size="sm">')
    expect(loadAvatar('avatar-size')).toContain('<Avatar size="lg">')
    expect(loadAvatar('avatar-dropdown')).toContain('<DropdownMenuTrigger asChild>')
    expect(loadAvatar('avatar-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
  })

  it('keeps every Breadcrumb source aligned with its rendered preview', () => {
    expectCuratedFamily('breadcrumb')

    const loadBreadcrumb = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'breadcrumb',
      previewName,
    })!

    expect(loadBreadcrumb('breadcrumb-demo')).toContain('<DropdownMenuTrigger asChild>')
    expect(loadBreadcrumb('breadcrumb-demo')).toContain('<BreadcrumbEllipsis />')
    expect(loadBreadcrumb('breadcrumb-basic').match(/<BreadcrumbItem>/g)).toHaveLength(3)
    expect(loadBreadcrumb('breadcrumb-separator').match(/<DotIcon \/>/g)).toHaveLength(2)
    expect(loadBreadcrumb('breadcrumb-dropdown')).toContain('<ChevronDownIcon />')
    expect(loadBreadcrumb('breadcrumb-ellipsis')).toContain('<BreadcrumbEllipsis />')
    expect(loadBreadcrumb('breadcrumb-link')).toContain('href="/components"')
    expect(loadBreadcrumb('breadcrumb-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadBreadcrumb('breadcrumb-rtl')).toContain('פירורי לחם')
  })

  it('keeps every Card source aligned with its rendered preview', () => {
    expectCuratedFamily('card')

    const loadCard = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'card',
      previewName,
    })!

    expect(loadCard('card-demo')).toContain('<CardAction><Button variant="link">Sign Up</Button>')
    expect(loadCard('card-demo')).toContain('<Input id="password" type="password" required />')
    expect(loadCard('card-small')).toContain('<Card size="sm"')
    expect(loadCard('card-small')).toContain('This card uses the small size variant.')
    expect(loadCard('card-image')).toContain('<Badge variant="secondary">Featured</Badge>')
    expect(loadCard('card-image')).toContain('alt="Event cover"')
    expect(loadCard('card-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadCard('card-rtl')).toContain('התחבר לחשבון שלך')
  })

  it('keeps every Collapsible source aligned with its rendered preview', () => {
    expectCuratedFamily('collapsible')

    const loadCollapsible = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'collapsible',
      previewName,
    })!

    expect(loadCollapsible('collapsible-demo')).toContain('let open = $state(false)')
    expect(loadCollapsible('collapsible-demo')).toContain('Order #4189')
    expect(loadCollapsible('collapsible-basic')).toContain('Product details')
    expect(loadCollapsible('collapsible-settings')).toContain('aria-label="Radius X expanded"')
    expect(loadCollapsible('collapsible-file-tree')).toContain("const files = ['app.tsx'")
    expect(loadCollapsible('collapsible-file-tree')).toContain('<TabsTrigger value="outline">Outline</TabsTrigger>')
    expect(loadCollapsible('collapsible-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadCollapsible('collapsible-rtl')).toContain('הזמנה #4189')
  })

  it('keeps every Kbd source aligned with its rendered preview', () => {
    expectCuratedFamily('kbd')
    const loadKbd = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'kbd', previewName })!
    expect(loadKbd('kbd-demo').match(/<Kbd(?:\s|>)/g)).toHaveLength(6)
    expect(loadKbd('kbd-group')).toContain('to open the command palette')
    expect(loadKbd('kbd-button')).toContain('Accept <Kbd>⏎</Kbd>')
    expect(loadKbd('kbd-tooltip')).toContain('Save Changes <Kbd>S</Kbd>')
    expect(loadKbd('kbd-input-group')).toContain('placeholder="Search..."')
    expect(loadKbd('kbd-rtl')).toContain("let language = $state<'ar' | 'he' | 'en'>('ar')")
  })

  it('keeps every Label source aligned with its rendered preview', () => {
    expectCuratedFamily('label')
    const demo = loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'label', previewName: 'label-demo' })!
    const rtl = loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'label', previewName: 'label-rtl' })!
    expect(demo).toContain('<Checkbox id="label-terms" />')
    expect(demo).toContain('<Label for="label-terms">Accept terms and conditions</Label>')
    expect(rtl).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(rtl).toContain('<Label for="label-terms-rtl">{translations[language]}</Label>')
  })

  it('keeps every Spinner source aligned with its rendered preview', () => {
    expectCuratedFamily('spinner')
    const loadSpinner = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'spinner', previewName })!
    expect(loadSpinner('spinner-demo')).toContain('Processing payment...')
    expect(loadSpinner('spinner-size').match(/<Spinner(?:\s|\/)/g)).toHaveLength(4)
    expect(loadSpinner('spinner-button').match(/<Button(?:\s|>)/g)).toHaveLength(3)
    expect(loadSpinner('spinner-badge').match(/<Badge(?:\s|>)/g)).toHaveLength(3)
    expect(loadSpinner('spinner-input-group')).toContain('<textarea')
    expect(loadSpinner('spinner-empty')).toContain('Do not refresh the page.')
    expect(loadSpinner('spinner-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
  })

  it('keeps every Separator source aligned with its rendered preview', () => {
    expectCuratedFamily('separator')
    const loadSeparator = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'separator', previewName })!
    expect(loadSeparator('separator-demo')).toContain('The Foundation for your Design System')
    expect(loadSeparator('separator-vertical').match(/orientation="vertical"/g)).toHaveLength(2)
    expect(loadSeparator('separator-menu')).toContain('Manage preferences')
    expect(loadSeparator('separator-list')).toContain("['Item 1', 'Value 1']")
    expect(loadSeparator('separator-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
  })

  it('keeps every Empty source aligned with its rendered preview', () => {
    expectCuratedFamily('empty')
    const loadEmpty = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'empty', previewName })!
    expect(loadEmpty('empty-demo')).toContain('No Projects Yet')
    expect(loadEmpty('empty-outline')).toContain('Cloud Storage Empty')
    expect(loadEmpty('empty-background')).toContain('No Notifications')
    expect(loadEmpty('empty-avatar')).toContain('<Avatar size="lg">')
    expect(loadEmpty('empty-avatar-group').match(/<Avatar size="lg">/g)).toHaveLength(3)
    expect(loadEmpty('empty-input-group')).toContain('aria-label="Search pages"')
    expect(loadEmpty('empty-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
  })

  it('keeps every Sonner source aligned with its rendered preview', () => {
    expectCuratedFamily('sonner')
    const loadSonner = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'sonner', previewName })!
    expect(loadSonner('sonner-demo')).toContain("description: 'Sunday, December 03, 2023 at 9:00 AM'")
    expect(loadSonner('sonner-demo')).toContain("action: { label: 'Undo' }")
    expect(loadSonner('sonner-description')).toContain("description: 'Monday, January 3rd at 6:00pm'")
    expect(loadSonner('sonner-position')).toContain("['Bottom Right', 'bottom-right']")
    expect(loadSonner('sonner-position')).toContain("show({ title: 'Event has been created', position })")
    expect(loadSonner('sonner-types')).toContain("variant: 'promise', duration: 0")
    expect(loadSonner('sonner-types')).toContain("variant: 'success'")
    for (const previewName of previewCatalog.sonner) {
      expect(loadSonner(previewName)).toContain('useSonner()')
      expect(loadSonner(previewName)).toContain('<SonnerViewport />')
    }
  })

  it('keeps every Tabs source aligned with its rendered preview', () => {
    expectCuratedFamily('tabs')
    const loadTabs = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'tabs', previewName })!
    expect(loadTabs('tabs-demo')).toContain('You have 12 active projects and 3 pending tasks.')
    expect(loadTabs('tabs-demo')).toContain('<CardContent class="text-sm text-muted-foreground">')
    expect(loadTabs('tabs-line')).toContain('<TabsList variant="line">')
    expect(loadTabs('tabs-vertical')).toContain('orientation="vertical"')
    expect(loadTabs('tabs-vertical')).toContain('value="notifications"')
    expect(loadTabs('tabs-disabled')).toContain('<TabsTrigger value="settings" disabled>')
    expect(loadTabs('tabs-icons')).toContain('<AppWindowIcon />Preview')
    expect(loadTabs('tabs-icons')).toContain('<CodeIcon />Code')
    expect(loadTabs('tabs-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadTabs('tabs-rtl')).toContain('צפיות בדף עלו ב-25%')
  })

  it('keeps every Tooltip source aligned with its rendered preview', () => {
    expectCuratedFamily('tooltip')
    const loadTooltip = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'tooltip', previewName })!
    expect(loadTooltip('tooltip-demo')).toContain('<p>Add to library</p>')
    expect(loadTooltip('tooltip-sides')).toContain("const sides = ['left', 'top', 'bottom', 'right'] as const")
    expect(loadTooltip('tooltip-sides')).toContain('<TooltipContent side={side}>')
    expect(loadTooltip('tooltip-keyboard')).toContain('Save Changes <Kbd>S</Kbd>')
    expect(loadTooltip('tooltip-disabled')).toContain('<span class="inline-block w-fit"><Button variant="outline" disabled>')
    expect(loadTooltip('tooltip-disabled')).toContain('This feature is currently unavailable')
    expect(loadTooltip('tooltip-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadTooltip('tooltip-rtl')).toContain('הוסף לספרייה')
  })

  it('keeps every Table source aligned with its rendered preview', () => {
    expectCuratedFamily('table')
    const loadTable = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'table', previewName })!
    expect(loadTable('table-demo')).toContain("['INV007', 'Unpaid', 'Credit Card', '$300.00']")
    expect(loadTable('table-demo')).toContain('<TableFooter>')
    expect(loadTable('table-footer')).toContain("['INV003', 'Unpaid', 'Bank Transfer', '$350.00']")
    expect(loadTable('table-actions')).toContain("['Wireless Mouse', '$29.99']")
    expect(loadTable('table-actions')).toContain('<DropdownMenuContent align="end">')
    expect(loadTable('table-actions')).toContain('<DropdownMenuItem class="text-destructive">Delete</DropdownMenuItem>')
    expect(loadTable('table-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadTable('table-rtl')).toContain("headings: ['חשבונית', 'סטטוס', 'שיטה', 'סכום']")
  })

  it.each([
    ['React import', "import { useState } from 'react'\nexport default function Demo() { return null }"],
    ['React className attribute', 'export default function Demo() { return <div className="x" /> }'],
    ['React hook', 'export default function Demo() { const value = useState(0); return value }'],
    ['Next.js import', "import Link from 'next/link'\nexport default function Demo() { return <Link /> }"],
    ['React-only package import', "import { AreaChart } from 'recharts'\nexport default function Demo() { return <AreaChart /> }"],
    ['upstream website import', "import { Button } from '@/examples/radix/ui/button'\nexport default function Demo() { return <Button /> }"],
    ['website-internal component import', "import { LanguageSelector } from '@/components/language-selector'\nexport default function Demo() { return <LanguageSelector /> }"],
    ['non-registry package import', "import { toast } from 'sonner'\nexport default function Demo() { return null }"],
  ])('rejects %s', (_label, source) => {
    expect(() => validateFictExampleSource(source)).toThrow(/must use Fict syntax/)
  })

  it('rejects imports that do not exist in the Fict registry', () => {
    const registryExports = new Map([['button', new Set(['Button'])]])
    expect(() => validateFictRegistryImports(
      "import { ButtonGroup } from '@/components/ui/button'\nexport default function Demo() { return null }",
      registryExports,
    )).toThrow('button.ButtonGroup')
  })
})
