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
const repositoryDocsRoot = path.join(process.cwd(), 'apps/v4/content/docs/components/fict')
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

  it('keeps a semantic source contract for every preview family', () => {
    const testSource = fs.readFileSync(path.join(process.cwd(), 'test/website-example-source.test.ts'), 'utf8')
    const coveredFamilies = new Set(
      [...testSource.matchAll(/expectCuratedFamily\('([^']+)'\)/g)].map(match => match[1]),
    )

    expect([...coveredFamilies].sort()).toEqual(Object.keys(previewCatalog).sort())
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

  it('uses valid named Fict registry imports in every component Usage section', () => {
    const registryExports = new Map(
      listBuiltinComponentNames().map(componentName => {
        const entry = getBuiltinComponent(componentName)
        const source = renderRegistryEntryFiles(entry!, DEFAULT_CONFIG)
          .map(file => file.content)
          .join('\n')
        return [componentName, extractFictRegistryExports(source)]
      }),
    )

    for (const fileName of fs.readdirSync(repositoryDocsRoot).filter(file => file.endsWith('.mdx'))) {
      const sourcePath = path.join(repositoryDocsRoot, fileName)
      const docs = fs.readFileSync(sourcePath, 'utf8')
      expect(docs, fileName).not.toMatch(/^import \* as /m)
      validateFictRegistryImports(docs, registryExports, sourcePath)
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
    expect(rtlSource).toContain('سينتهي صلاحية الرابط خلال 24 ساعة.')
    expect(rtlSource).toContain('השינויים יבואו לידי ביטוי במחזור החיוב הבא.')
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

    const docs = fs.readFileSync(
      path.join(process.cwd(), 'apps/v4/content/docs/components/fict/badge.mdx'),
      'utf8',
    )
    expect(docs).toContain('import { Badge } from "@/components/ui/badge"')
    expect(docs).not.toContain('import * as Badge')

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
    expect(loadAlert('alert-colors')).toContain('to continue using the service.')
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

  it('keeps every Sheet source aligned with its rendered preview', () => {
    expectCuratedFamily('sheet')

    const loadSheet = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'sheet',
      previewName,
    })!

    expect(loadSheet('sheet-demo')).toContain('<Input id="sheet-demo-name" value="Pedro Duarte" />')
    expect(loadSheet('sheet-demo')).toContain('<SheetClose asChild><Button variant="outline">Close</Button></SheetClose>')
    expect(loadSheet('sheet-side')).toContain("const sides = ['top', 'right', 'bottom', 'left'] as const")
    expect(loadSheet('sheet-side')).toContain('<SheetContent side={side}')
    expect(loadSheet('sheet-side')).toContain('Array.from({ length: 10 }')
    expect(loadSheet('sheet-no-close-button')).not.toContain('<SheetClose')
    expect(loadSheet('sheet-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadSheet('sheet-rtl')).toContain("side={text().dir === 'rtl' ? 'left' : 'right'}")
  })

  it('keeps every Drawer source aligned with its rendered preview', () => {
    expectCuratedFamily('drawer')

    const loadDrawer = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'drawer',
      previewName,
    })!

    expect(loadDrawer('drawer-demo')).toContain('let goal = $state(350)')
    expect(loadDrawer('drawer-demo')).toContain('activity.map')
    expect(loadDrawer('drawer-scrollable-content')).toContain('<Drawer direction="right">')
    expect(loadDrawer('drawer-scrollable-content')).toContain('Array.from({ length: 10 }')
    expect(loadDrawer('drawer-sides')).toContain("const sides = ['top', 'right', 'bottom', 'left'] as const")
    expect(loadDrawer('drawer-sides')).toContain('<Drawer direction={side}>')
    expect(loadDrawer('drawer-dialog')).toContain('<div class="hidden md:block">')
    expect(loadDrawer('drawer-dialog')).toContain('<div class="md:hidden">')
    expect(loadDrawer('drawer-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadDrawer('drawer-rtl')).toContain('goal.toLocaleString(text().locale)')
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
    expect(loadEmpty('empty-rtl')).toContain("'تعرف على المزيد'")
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

  it('keeps every Chart source aligned with its rendered preview', () => {
    expectCuratedFamily('chart')

    const loadChart = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'chart',
      previewName,
    })!

    expect(loadChart('chart-demo')).toContain("let series = $state<'desktop' | 'mobile'>('desktop')")
    expect(loadChart('chart-demo')).toContain('<BarSparkline data={data} showGrid showAxis showTooltip')
    expect(loadChart('chart-example')).not.toContain('showGrid')
    expect(loadChart('chart-example-grid')).toContain('showGrid primaryLabel="Desktop"')
    expect(loadChart('chart-example-axis')).toContain('showGrid showAxis')
    expect(loadChart('chart-example-tooltip')).toContain('showGrid showAxis showTooltip')
    expect(loadChart('chart-example-legend')).toContain('<ChartLegend items=')
    expect(loadChart('chart-tooltip').match(/<ChartTooltipContent/g)).toHaveLength(4)
    expect(loadChart('chart-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadChart('chart-rtl')).toContain('dir={text().dir} showGrid showAxis showTooltip')
  })

  it('keeps every Checkbox source aligned with its rendered preview', () => {
    expectCuratedFamily('checkbox')

    const loadCheckbox = (previewName: string) => loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'checkbox',
      previewName,
    })!

    expect(loadCheckbox('checkbox-demo').match(/<Checkbox(?:\s|>)/g)).toHaveLength(4)
    expect(loadCheckbox('checkbox-basic')).toContain('<Checkbox id="terms-basic" />')
    expect(loadCheckbox('checkbox-description')).toContain('defaultChecked')
    expect(loadCheckbox('checkbox-disabled')).toContain('disabled')
    expect(loadCheckbox('checkbox-invalid')).toContain('aria-invalid="true"')
    expect(loadCheckbox('checkbox-group')).toContain("['hard-disks', 'Hard disks', true]")
    expect(loadCheckbox('checkbox-table')).toContain('let selected = $state(new Set([0]))')
    expect(loadCheckbox('checkbox-table')).toContain('checked={() => selected.has(index)}')
    expect(loadCheckbox('checkbox-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
  })

  it('keeps every Progress source aligned with its rendered preview', () => {
    expectCuratedFamily('progress')
    const loadProgress = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'progress', previewName })!
    expect(loadProgress('progress-demo')).toContain('<Progress value={66} max={100}')
    expect(loadProgress('progress-label')).toContain('<label for="upload-progress"')
    expect(loadProgress('progress-label')).toContain('<span>66%</span>')
    expect(loadProgress('progress-controlled')).toContain('let value = $state(50)')
    expect(loadProgress('progress-controlled')).toContain('onValueChange={next => { value = next[0] }}')
    expect(loadProgress('progress-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadProgress('progress-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Pagination source aligned with its rendered preview', () => {
    expectCuratedFamily('pagination')
    const loadPagination = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'pagination', previewName })!
    expect(loadPagination('pagination-demo')).toContain('<PaginationLink href="#" isActive>2</PaginationLink>')
    expect(loadPagination('pagination-demo')).toContain('<PaginationEllipsis />')
    expect(loadPagination('pagination-simple')).toContain('[1, 2, 3, 4, 5].map')
    expect(loadPagination('pagination-simple')).not.toContain('PaginationPrevious')
    expect(loadPagination('pagination-icons-only')).toContain("let rows = $state('25')")
    expect(loadPagination('pagination-icons-only')).toContain('<ArrowIcon direction="previous" />')
    expect(loadPagination('pagination-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadPagination('pagination-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Hover Card source aligned with its rendered preview', () => {
    expectCuratedFamily('hover-card')
    const loadHoverCard = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'hover-card', previewName })!
    expect(loadHoverCard('hover-card-demo')).toContain('<HoverCard openDelay={10} closeDelay={100}>')
    expect(loadHoverCard('hover-card-demo')).toContain('<strong>@fictjs</strong>')
    expect(loadHoverCard('hover-card-sides')).toContain("const sides = ['left', 'top', 'bottom', 'right'] as const")
    expect(loadHoverCard('hover-card-sides')).toContain('<HoverCardContent side={side}>')
    expect(loadHoverCard('hover-card-rtl')).toContain("'inline-start', 'inline-end'")
    expect(loadHoverCard('hover-card-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadHoverCard('hover-card-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Skeleton source aligned with its rendered preview', () => {
    expectCuratedFamily('skeleton')
    const loadSkeleton = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'skeleton', previewName })!
    expect(loadSkeleton('skeleton-demo')).toContain('class="size-12 rounded-full"')
    expect(loadSkeleton('skeleton-demo')).toContain('class="h-4 w-[250px]"')
    expect(loadSkeleton('skeleton-avatar')).toContain('class="size-10 rounded-full"')
    expect(loadSkeleton('skeleton-card')).toContain('class="aspect-video w-72"')
    expect(loadSkeleton('skeleton-text').match(/<Skeleton/g)).toHaveLength(3)
    expect(loadSkeleton('skeleton-form').match(/<Skeleton/g)).toHaveLength(5)
    expect(loadSkeleton('skeleton-table')).toContain('Array.from({ length: 5 }')
    expect(loadSkeleton('skeleton-table').match(/<Skeleton/g)).toHaveLength(3)
    expect(loadSkeleton('skeleton-rtl')).toContain("let language = $state<keyof typeof directions>('ar')")
    expect(loadSkeleton('skeleton-rtl')).toContain('dir={directions[language]}')
  })

  it('keeps every Slider source aligned with its rendered preview', () => {
    expectCuratedFamily('slider')
    const loadSlider = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'slider', previewName })!
    expect(loadSlider('slider-demo')).toContain('defaultValue={[75]}')
    expect(loadSlider('slider-range')).toContain('defaultValue={[25, 50]}')
    expect(loadSlider('slider-range')).toContain('step={5}')
    expect(loadSlider('slider-multiple')).toContain('defaultValue={[10, 20, 70]}')
    expect(loadSlider('slider-vertical').match(/orientation="vertical"/g)).toHaveLength(2)
    expect(loadSlider('slider-controlled')).toContain('let values = $state([0.3, 0.7])')
    expect(loadSlider('slider-controlled')).toContain('onValueChange={next => { values = next }}')
    expect(loadSlider('slider-disabled')).toContain('<Slider disabled')
    expect(loadSlider('slider-rtl')).toContain("let language = $state<keyof typeof directions>('ar')")
    expect(loadSlider('slider-rtl')).toContain('dir={directions[language]}')
  })

  it('keeps every Toggle Group source aligned with its rendered preview', () => {
    expectCuratedFamily('toggle-group')
    const loadToggleGroup = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'toggle-group', previewName })!
    expect(loadToggleGroup('toggle-group-demo')).toContain('variant="outline" type="multiple"')
    expect(loadToggleGroup('toggle-group-demo')).toContain('<FormatIcon kind="underline" />')
    expect(loadToggleGroup('toggle-group-outline')).toContain('defaultValue="all"')
    expect(loadToggleGroup('toggle-group-sizes').match(/<ToggleGroup type="single"/g)).toHaveLength(2)
    expect(loadToggleGroup('toggle-group-sizes')).toContain('size="sm"')
    expect(loadToggleGroup('toggle-group-spacing')).toContain('spacing={2}')
    expect(loadToggleGroup('toggle-group-vertical')).toContain('orientation="vertical" spacing={1}')
    expect(loadToggleGroup('toggle-group-vertical')).toContain("defaultValue={['bold', 'italic']}")
    expect(loadToggleGroup('toggle-group-disabled')).toContain('<ToggleGroup disabled type="multiple">')
    expect(loadToggleGroup('toggle-group-font-weight-selector')).toContain("let fontWeight = $state<(typeof weights)[number]>('normal')")
    expect(loadToggleGroup('toggle-group-font-weight-selector')).toContain('onValueChange={value => { if (value) fontWeight = value as typeof fontWeight }}')
    expect(loadToggleGroup('toggle-group-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadToggleGroup('toggle-group-rtl')).toContain('dir={text().direction}')
  })

  it('keeps every Calendar source aligned with its rendered preview', () => {
    expectCuratedFamily('calendar')
    const loadCalendar = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'calendar', previewName })!
    expect(loadCalendar('calendar-demo')).toContain('let date = $state(new Date())')
    expect(loadCalendar('calendar-demo')).toContain('captionLayout="dropdown"')
    expect(loadCalendar('calendar-hijri')).toContain('locale="fa-IR-u-ca-persian"')
    expect(loadCalendar('calendar-basic')).toContain('<Calendar mode="single"')
    expect(loadCalendar('calendar-range')).toContain('type CalendarDateRange')
    expect(loadCalendar('calendar-range')).toContain('numberOfMonths={2}')
    expect(loadCalendar('calendar-caption')).toContain('captionLayout="dropdown"')
    expect(loadCalendar('calendar-presets')).toContain("['In a week', 7]")
    expect(loadCalendar('calendar-presets')).toContain('month={() => month}')
    expect(loadCalendar('calendar-time')).toContain('value="10:30:00"')
    expect(loadCalendar('calendar-time')).toContain('value="12:30:00"')
    expect(loadCalendar('calendar-booked-dates')).toContain('Array.from({ length: 15 }')
    expect(loadCalendar('calendar-booked-dates')).toContain('disabled={bookedDates}')
    expect(loadCalendar('calendar-custom-days')).toContain('dayContent={(day, modifiers) =>')
    expect(loadCalendar('calendar-custom-days')).toContain("'$120' : '$100'")
    expect(loadCalendar('calendar-week-numbers')).toContain('showWeekNumber')
    expect(loadCalendar('calendar-rtl')).toContain("let language = $state<keyof typeof languages>('ar')")
    expect(loadCalendar('calendar-rtl')).toContain('locale={() => settings().locale}')
  })

  it('keeps every Carousel source aligned with its rendered preview', () => {
    expectCuratedFamily('carousel')
    const loadCarousel = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'carousel', previewName })!
    expect(loadCarousel('carousel-demo')).toContain('Array.from({ length: 5 }')
    expect(loadCarousel('carousel-demo')).toContain('<CardContent class="flex aspect-square')
    expect(loadCarousel('carousel-size')).toContain('class="basis-1/2 lg:basis-1/3"')
    expect(loadCarousel('carousel-spacing')).toContain('class="-ml-1 gap-0"')
    expect(loadCarousel('carousel-spacing')).toContain('class="basis-1/2 pl-1 lg:basis-1/3"')
    expect(loadCarousel('carousel-orientation')).toContain('orientation="vertical"')
    expect(loadCarousel('carousel-orientation')).toContain('<CarouselPrevious>↑</CarouselPrevious>')
    expect(loadCarousel('carousel-api')).toContain('type CarouselApi')
    expect(loadCarousel('carousel-api')).toContain("next.on('select', selected =>")
    expect(loadCarousel('carousel-api')).toContain('Slide {current} of {count}')
    expect(loadCarousel('carousel-plugin')).toContain('autoplayMs={2000} stopOnInteraction')
    expect(loadCarousel('carousel-rtl')).toContain("let language = $state<keyof typeof languages>('ar')")
    expect(loadCarousel('carousel-rtl')).toContain('opts={{ direction: settings().dir }}')
  })

  it('keeps every Combobox source aligned with its rendered preview', () => {
    expectCuratedFamily('combobox')
    const loadCombobox = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'combobox', previewName })!
    for (const previewName of ['combobox-demo', 'combobox-basic']) expect(loadCombobox(previewName)).toContain("['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro']")
    expect(loadCombobox('combobox-multiple')).toContain("multiple autoHighlight defaultValue={['Next.js']}")
    expect(loadCombobox('combobox-multiple')).toContain('<ComboboxChip value={value}>')
    expect(loadCombobox('combobox-clear')).toContain('showClear')
    expect(loadCombobox('combobox-groups')).toContain('<ComboboxLabel>{group}</ComboboxLabel>')
    expect(loadCombobox('combobox-groups')).toContain('<ComboboxSeparator />')
    expect(loadCombobox('combobox-groups')).toContain("'(GMT-3) São Paulo'")
    expect(loadCombobox('combobox-custom')).toContain('<ItemDescription>{description}</ItemDescription>')
    expect(loadCombobox('combobox-custom')).toContain("'south-korea', 'South Korea', 'Asia (kr)'")
    expect(loadCombobox('combobox-invalid')).toContain('aria-invalid="true"')
    expect(loadCombobox('combobox-disabled')).toContain('disabled />')
    expect(loadCombobox('combobox-auto-highlight')).toContain('<Combobox autoHighlight>')
    expect(loadCombobox('combobox-popup')).toContain('<ComboboxTrigger class="w-64">')
    expect(loadCombobox('combobox-popup')).toContain('aria-label="Search countries"')
    expect(loadCombobox('combobox-popup')).toContain("['new-zealand', 'New Zealand']")
    expect(loadCombobox('combobox-input-group')).toContain('<GlobeIcon />')
    expect(loadCombobox('combobox-input-group')).toContain("'(GMT-5) Toronto'")
    expect(loadCombobox('combobox-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadCombobox('combobox-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Input OTP source aligned with its rendered preview', () => {
    expectCuratedFamily('input-otp')
    const loadInputOtp = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'input-otp', previewName })!
    expect(loadInputOtp('input-otp-demo')).toContain('defaultValue="123456" maxLength={6}')
    expect(loadInputOtp('input-otp-pattern')).toContain('pattern={/^[0-9]$/}')
    expect(loadInputOtp('input-otp-separator').match(/<InputOTPSeparator \/>/g)).toHaveLength(2)
    expect(loadInputOtp('input-otp-disabled')).toContain('<InputOTP disabled defaultValue="123456"')
    expect(loadInputOtp('input-otp-controlled')).toContain("let value = $state('')")
    expect(loadInputOtp('input-otp-controlled')).toContain('value={() => value} onValueChange=')
    expect(loadInputOtp('input-otp-invalid').match(/aria-invalid="true"/g)).toHaveLength(4)
    expect(loadInputOtp('input-otp-four-digits')).toContain('maxLength={4}')
    expect(loadInputOtp('input-otp-alphanumeric')).toContain('pattern={/^[a-zA-Z0-9]$/}')
    expect(loadInputOtp('input-otp-form')).toContain('<CardTitle>Verify your login</CardTitle>')
    expect(loadInputOtp('input-otp-form')).toContain('sent to your email address:')
    expect(loadInputOtp('input-otp-form')).toContain('<InputOTP required value={() => code}')
    expect(loadInputOtp('input-otp-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadInputOtp('input-otp-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Toggle source aligned with its rendered preview', () => {
    expectCuratedFamily('toggle')
    const loadToggle = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'toggle', previewName })!
    expect(loadToggle('toggle-demo')).toContain('<BookmarkIcon />Bookmark')
    expect(loadToggle('toggle-outline').match(/variant="outline"/g)).toHaveLength(2)
    expect(loadToggle('toggle-text')).toContain('aria-label="Toggle italic">Italic')
    expect(loadToggle('toggle-sizes')).toContain('size="sm"')
    expect(loadToggle('toggle-sizes')).toContain('size="lg"')
    expect(loadToggle('toggle-disabled').match(/disabled/g)).toHaveLength(4)
    expect(loadToggle('toggle-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadToggle('toggle-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Textarea source aligned with its rendered preview', () => {
    expectCuratedFamily('textarea')
    const loadTextarea = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'textarea', previewName })!
    expect(loadTextarea('textarea-demo')).toContain('placeholder="Type your message here."')
    expect(loadTextarea('textarea-field')).toContain('<Label for="message">Message</Label>')
    expect(loadTextarea('textarea-field')).toContain('Enter your message below.')
    expect(loadTextarea('textarea-disabled')).toContain('disabled placeholder="Type your message here."')
    expect(loadTextarea('textarea-invalid')).toContain('aria-invalid="true"')
    expect(loadTextarea('textarea-invalid')).toContain('Please enter a valid message.')
    expect(loadTextarea('textarea-button')).toContain('<Button>Send message</Button>')
    expect(loadTextarea('textarea-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadTextarea('textarea-rtl')).toContain('placeholder={text().placeholder}')
  })

  it('keeps every Switch source aligned with its rendered preview', () => {
    expectCuratedFamily('switch')
    const loadSwitch = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'switch', previewName })!
    expect(loadSwitch('switch-demo')).toContain('<Switch id="airplane-mode" /> Airplane Mode')
    expect(loadSwitch('switch-description')).toContain('Focus is shared across devices, and turns off when you leave the app.')
    expect(loadSwitch('switch-choice-card')).toContain('<Switch id="switch-notifications" defaultChecked />')
    expect(loadSwitch('switch-disabled')).toContain('<Switch id="switch-disabled-unchecked" disabled />')
    expect(loadSwitch('switch-invalid')).toContain('aria-invalid="true"')
    expect(loadSwitch('switch-sizes')).toContain('size="sm"')
    expect(loadSwitch('switch-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadSwitch('switch-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Native Select source aligned with its rendered preview', () => {
    expectCuratedFamily('native-select')
    const loadNativeSelect = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'native-select', previewName })!
    expect(loadNativeSelect('native-select-demo')).toContain('Select status')
    expect(loadNativeSelect('native-select-groups')).toContain('<NativeSelectOptGroup label="Operations">')
    expect(loadNativeSelect('native-select-disabled')).toContain('<NativeSelect disabled>')
    expect(loadNativeSelect('native-select-invalid')).toContain('aria-invalid="true"')
    expect(loadNativeSelect('native-select-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadNativeSelect('native-select-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Radio Group source aligned with its rendered preview', () => {
    expectCuratedFamily('radio-group')
    const loadRadioGroup = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'radio-group', previewName })!
    expect(loadRadioGroup('radio-group-demo')).toContain('defaultValue="comfortable"')
    expect(loadRadioGroup('radio-group-description')).toContain('Minimal spacing for dense layouts.')
    expect(loadRadioGroup('radio-group-choice-card')).toContain("['enterprise', 'Enterprise', 'For large teams and enterprises.']")
    expect(loadRadioGroup('radio-group-fieldset')).toContain('Lifetime ($299.99)')
    expect(loadRadioGroup('radio-group-disabled')).toContain('<RadioGroupItem value="option1" disabled />')
    expect(loadRadioGroup('radio-group-invalid')).toContain('aria-invalid="true"')
    expect(loadRadioGroup('radio-group-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadRadioGroup('radio-group-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Select source aligned with its rendered preview', () => {
    expectCuratedFamily('select')
    const loadSelect = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'select', previewName })!
    expect(loadSelect('select-demo')).toContain('<SelectValue placeholder="Select a fruit" />')
    expect(loadSelect('select-align-item')).toContain("position={aligned ? 'item-aligned' : 'popper'}")
    expect(loadSelect('select-groups')).toContain('<SelectLabel>Vegetables</SelectLabel>')
    expect(loadSelect('select-groups')).toContain("'Grapes', 'Pineapple'")
    expect(loadSelect('select-scrollable')).toContain("'South America': ['Argentina Time', 'Bolivia Time', 'Brasilia Time', 'Chile Standard Time']")
    expect(loadSelect('select-disabled')).toContain('<Select disabled>')
    expect(loadSelect('select-invalid')).toContain('aria-invalid="true"')
    expect(loadSelect('select-invalid')).toContain("'Grapes', 'Pineapple'")
    expect(loadSelect('select-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadSelect('select-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Popover source aligned with its rendered preview', () => {
    expectCuratedFamily('popover')
    const loadPopover = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'popover', previewName })!
    expect(loadPopover('popover-demo')).toContain("['max-height', 'Max. height', 'none']")
    expect(loadPopover('popover-basic')).toContain('<PopoverContent align="start">')
    expect(loadPopover('popover-alignments')).toContain("(['start', 'center', 'end'] as const).map")
    expect(loadPopover('popover-form')).toContain('<Input id="height" defaultValue="25px" />')
    expect(loadPopover('popover-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadPopover('popover-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Navigation Menu source aligned with its rendered preview', () => {
    expectCuratedFamily('navigation-menu')
    const loadNavigationMenu = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'navigation-menu', previewName })!
    expect(loadNavigationMenu('navigation-menu-demo')).toContain('A popup that displays information related to an element.')
    expect(loadNavigationMenu('navigation-menu-demo')).toContain('<NavigationMenuTrigger>Getting started</NavigationMenuTrigger>')
    expect(loadNavigationMenu('navigation-menu-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadNavigationMenu('navigation-menu-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Input source aligned with its rendered preview', () => {
    expectCuratedFamily('input')
    const loadInput = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'input', previewName })!
    expect(loadInput('input-demo')).toContain('type="password" placeholder="sk-..."')
    expect(loadInput('input-fieldgroup')).toContain('<Button type="reset" variant="outline">')
    expect(loadInput('input-disabled')).toContain('disabled')
    expect(loadInput('input-invalid')).toContain('aria-invalid')
    expect(loadInput('input-file')).toContain('type="file"')
    expect(loadInput('input-required')).toContain('required')
    expect(loadInput('input-badge')).toContain('<Badge variant="secondary"')
    expect(loadInput('input-input-group')).toContain('<InputGroupAddon>https://</InputGroupAddon>')
    expect(loadInput('input-button-group')).toContain('<ButtonGroup>')
    expect(loadInput('input-form')).toContain('<SelectItem value="ca">Canada</SelectItem>')
    expect(loadInput('input-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadInput('input-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Input Group source aligned with its rendered preview', () => {
    expectCuratedFamily('input-group')
    const loadInputGroup = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'input-group', previewName })!
    expect(loadInputGroup('input-group-demo')).toContain('12 results')
    expect(loadInputGroup('input-group-inline-end')).toContain('type="password"')
    expect(loadInputGroup('input-group-block-start')).toContain('align="block-start"')
    expect(loadInputGroup('input-group-block-end')).toContain('align="block-end"')
    expect(loadInputGroup('input-group-text')).toContain('120 characters left')
    expect(loadInputGroup('input-group-button')).toContain('let copied = $state(false)')
    expect(loadInputGroup('input-group-button')).toContain('Your connection is not secure.')
    expect(loadInputGroup('input-group-kbd')).toContain('⌘K')
    expect(loadInputGroup('input-group-spinner')).toContain('<Spinner')
    expect(loadInputGroup('input-group-textarea')).toContain('script.js')
    expect(loadInputGroup('input-group-custom')).toContain('placeholder="Autoresize textarea..."')
    expect(loadInputGroup('input-group-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadInputGroup('input-group-rtl')).toContain("savingStatus: 'جاري الحفظ...'")
  })

  it('keeps every Button Group source aligned with its rendered preview', () => {
    expectCuratedFamily('button-group')
    const loadButtonGroup = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'button-group', previewName })!
    expect(loadButtonGroup('button-group-orientation')).toContain('orientation="vertical"')
    expect(loadButtonGroup('button-group-size')).toContain('size="lg"')
    expect(loadButtonGroup('button-group-separator')).toContain('<ButtonGroupSeparator />')
    expect(loadButtonGroup('button-group-split')).toContain('<ButtonGroupSeparator />')
    expect(loadButtonGroup('button-group-input')).toContain('placeholder="Search..."')
    expect(loadButtonGroup('button-group-input-group')).toContain('let voiceEnabled = $state(false)')
    expect(loadButtonGroup('button-group-select')).toContain("let currency = $state('$')")
    expect(loadButtonGroup('button-group-popover')).toContain('<PopoverContent')
    expect(loadButtonGroup('button-group-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadButtonGroup('button-group-rtl')).toContain('وضع علامة كمقروء')
    expect(loadButtonGroup('button-group-rtl')).toContain('<DropdownMenuItem variant="destructive">{t.trash}</DropdownMenuItem>')
  })

  it('keeps every Context Menu source aligned with its rendered preview', () => {
    expectCuratedFamily('context-menu')
    const loadContextMenu = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'context-menu', previewName })!
    expect(loadContextMenu('context-menu-demo')).toContain('<ContextMenuCheckboxItem')
    expect(loadContextMenu('context-menu-submenu')).toContain('<ContextMenuSub>')
    expect(loadContextMenu('context-menu-shortcuts')).toContain('<ContextMenuShortcut>')
    expect(loadContextMenu('context-menu-groups')).toContain('<ContextMenuGroup>')
    expect(loadContextMenu('context-menu-radio')).toContain("let person = $state('pedro')")
    expect(loadContextMenu('context-menu-destructive')).toContain('variant="destructive"')
    expect(loadContextMenu('context-menu-sides')).toContain('side="right"')
    expect(loadContextMenu('context-menu-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadContextMenu('context-menu-rtl')).toContain('<ContextMenuCheckboxItem checked>{t.bookmarks}</ContextMenuCheckboxItem>')
    expect(loadContextMenu('context-menu-rtl')).toContain('<ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>')
  })

  it('keeps every Dropdown Menu source aligned with its rendered preview', () => {
    expectCuratedFamily('dropdown-menu')
    const loadDropdownMenu = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'dropdown-menu', previewName })!
    expect(loadDropdownMenu('dropdown-menu-demo')).toContain('<DropdownMenuShortcut>')
    expect(loadDropdownMenu('dropdown-menu-submenu')).toContain('<DropdownMenuSub>')
    expect(loadDropdownMenu('dropdown-menu-checkboxes')).toContain('let panel = $state(false)')
    expect(loadDropdownMenu('dropdown-menu-radio-group')).toContain("let position = $state('bottom')")
    expect(loadDropdownMenu('dropdown-menu-checkboxes-icons')).toContain('Notification Preferences')
    expect(loadDropdownMenu('dropdown-menu-checkboxes-icons')).toContain('Push notifications')
    expect(loadDropdownMenu('dropdown-menu-radio-icons')).toContain('Select Payment Method')
    expect(loadDropdownMenu('dropdown-menu-radio-icons')).toContain('Bank Transfer')
    expect(loadDropdownMenu('dropdown-menu-destructive')).toContain('variant="destructive"')
    expect(loadDropdownMenu('dropdown-menu-avatar')).toContain('/avatars/shadcn.jpg')
    expect(loadDropdownMenu('dropdown-menu-complex')).toContain('Sign Out')
    expect(loadDropdownMenu('dropdown-menu-complex')).toContain('Recent Projects')
    expect(loadDropdownMenu('dropdown-menu-complex')).toContain('Notification Types')
    expect(loadDropdownMenu('dropdown-menu-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadDropdownMenu('dropdown-menu-rtl')).toContain("let visibility = $state({ status: true, activity: false, panel: false })")
    expect(loadDropdownMenu('dropdown-menu-rtl')).toContain("webhook: 'خطاف ويب'")
  })

  it('keeps every Date Picker source aligned with its rendered preview', () => {
    expectCuratedFamily('date-picker')
    const loadDatePicker = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'date-picker', previewName })!
    expect(loadDatePicker('date-picker-demo')).toContain("let date = $state<Date | null>(null)")
    expect(loadDatePicker('date-picker-range')).toContain('mode="range"')
    expect(loadDatePicker('date-picker-range')).toContain('numberOfMonths={2}')
    expect(loadDatePicker('date-picker-dob')).toContain('captionLayout="dropdown"')
    expect(loadDatePicker('date-picker-input')).toContain("let value = $state('June 01, 2025')")
    expect(loadDatePicker('date-picker-time')).toContain('defaultValue="10:30:00"')
    expect(loadDatePicker('date-picker-natural-language')).toContain("let value = $state('In 2 days')")
    expect(loadDatePicker('date-picker-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
  })

  it('keeps Direction mapped to the localized Card source', () => {
    expectCuratedFamily('direction')
    const source = loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'direction', previewName: 'card-rtl' })!
    expect(source).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(source).toContain('dir={direction()}')
  })

  it('keeps the Form source aligned with its rendered preview', () => {
    expectCuratedFamily('form')
    const source = loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'form', previewName: 'form-demo' })!
    expect(source).toContain('<FormField name="username">')
    expect(source).toContain('This is your public display name.')
    expect(source).toContain('<FormMessage />')
  })

  it('keeps the Range Calendar source aligned with its rendered preview', () => {
    expectCuratedFamily('range-calendar')
    const source = loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'range-calendar', previewName: 'range-calendar-demo' })!
    expect(source).toContain('<RangeCalendar')
    expect(source).toContain('startMonth={new Date(2026, 7, 1)}')
    expect(source).toContain('endMonth={new Date(2026, 8, 1)}')
  })

  it('keeps the Toast source aligned with its rendered preview', () => {
    expectCuratedFamily('toast')
    const source = loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'toast', previewName: 'toast-demo' })!
    expect(source).toContain('<ToastTitle>Event created</ToastTitle>')
    expect(source).toContain('Sunday, August 29 at 9:00 AM')
    expect(source).toContain('<ToastAction altText="Undo">Undo</ToastAction>')
  })

  it('keeps every Resizable source aligned with its rendered preview', () => {
    expectCuratedFamily('resizable')
    const loadResizable = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'resizable', previewName })!
    expect(loadResizable('resizable-demo')).toContain('<strong>Three</strong>')
    expect(loadResizable('resizable-demo')).toContain('<ResizablePanelGroup direction="vertical">')
    expect(loadResizable('resizable-vertical')).toContain('<strong>Header</strong>')
    expect(loadResizable('resizable-vertical')).toContain('<ResizableHandle />')
    expect(loadResizable('resizable-handle')).toContain('<strong>Sidebar</strong>')
    expect(loadResizable('resizable-handle')).toContain('<ResizableHandle withHandle />')
    expect(loadResizable('resizable-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadResizable('resizable-rtl')).toContain('dir={text().dir}')
  })

  it('keeps every Scroll Area source aligned with its rendered preview', () => {
    expectCuratedFamily('scroll-area')
    const loadScrollArea = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'scroll-area', previewName })!
    expect(loadScrollArea('scroll-area-demo')).toContain('v1.2.0-beta.${50 - index}')
    expect(loadScrollArea('scroll-area-demo')).toContain('>Tags</h4>')
    expect(loadScrollArea('scroll-area-horizontal-demo')).toContain("artist: 'Ornella Binni'")
    expect(loadScrollArea('scroll-area-horizontal-demo')).toContain('<ScrollBar orientation="horizontal" />')
    expect(loadScrollArea('scroll-area-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadScrollArea('scroll-area-rtl')).toContain("he: { dir: 'rtl', tags: 'תגיות' }")
  })

  it('keeps every Data Table source aligned with its rendered preview', () => {
    expectCuratedFamily('data-table')
    const loadDataTable = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'data-table', previewName })!
    const demo = loadDataTable('data-table-demo')
    expect(demo).toContain("let filter = $state('')")
    expect(demo).toContain("let selected = $state<string[]>([])")
    expect(demo).toContain('DropdownMenuCheckboxItem')
    expect(demo).toContain('Copy payment ID')
    expect(demo).toContain("email: 'ken99@example.com'")
    const rtl = loadDataTable('data-table-rtl')
    expect(rtl).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(rtl).toContain("filter: 'סנן אימיילים...'")
    expect(rtl).toContain('dir={text().dir}')
  })

  it('keeps the Sidebar source aligned with its rendered preview', () => {
    expectCuratedFamily('sidebar')
    const source = loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'sidebar', previewName: 'sidebar-demo' })!
    expect(source).toContain("let collapsed = $state(false)")
    expect(source).toContain("{ title: 'Models', items: ['Genesis', 'Explorer', 'Quantum'] }")
    expect(source).toContain("event.ctrlKey && event.key === 'b'")
    expect(source).toContain('Acme Inc')
    expect(source).toContain('<SidebarLink href="#">{item}</SidebarLink>')
  })

  it('keeps every Typography source aligned with its rendered preview', () => {
    expectCuratedFamily('typography')
    const loadTypography = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'typography', previewName })!
    const markers: Record<string, string> = {
      'typography-demo': 'Taxing Laughter: The Joke Tax Chronicles',
      'typography-h1': 'text-4xl font-extrabold',
      'typography-h2': 'The People of the Kingdom',
      'typography-h3': 'The Joke Tax',
      'typography-h4': 'People stopped telling jokes',
      'typography-p': 'repealed the joke tax',
      'typography-blockquote': '<blockquote',
      'typography-table': "King&apos;s Treasury",
      'typography-list': '1st level of puns: 5 gold coins',
      'typography-inline-code': '@fictjs/radix-ui',
      'typography-lead': 'expects a response',
      'typography-large': 'Are you absolutely sure?',
      'typography-small': 'Email address',
      'typography-muted': 'Enter your email address.',
      'typography-rtl': "let language = $state<keyof typeof translations>('ar')",
    }
    for (const previewName of previewCatalog.typography) {
      const source = loadTypography(previewName)
      expect(source, previewName).toContain(markers[previewName])
      expect(source, previewName).not.toContain('Semantic typography rendered by Fict.')
    }
    expect(loadTypography('typography-rtl')).toContain('מיסוי הצחוק: כרוניקות מס הבדיחה')
  })

  it('keeps every Command source aligned with its rendered preview', () => {
    expectCuratedFamily('command')
    const loadCommand = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'command', previewName })!
    expect(loadCommand('command-demo')).toContain('<CommandItem value="calculator" disabled>')
    expect(loadCommand('command-basic')).toContain('<CommandTrigger class="rounded-md border px-4 py-2">Open Menu</CommandTrigger>')
    expect(loadCommand('command-shortcuts')).toContain('Profile <span class="ml-auto">⌘P</span>')
    expect(loadCommand('command-groups')).toContain('<CommandSeparator />')
    expect(loadCommand('command-scrollable')).toContain("['Tools', ['Calculator', 'Calendar', 'Image Editor', 'Code Editor']]")
    expect(loadCommand('command-scrollable')).toContain('<CommandList class="max-h-72">')
    expect(loadCommand('command-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadCommand('command-rtl')).toContain('הקלד פקודה או חפש...')
  })

  it('keeps every Field source aligned with its rendered preview', () => {
    expectCuratedFamily('field')
    const loadField = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'field', previewName })!
    const markers: Record<string, string> = {
      'field-demo': '<FieldLegend>Payment Method</FieldLegend>',
      'field-input': 'Choose a unique username for your account.',
      'field-textarea': 'Your feedback helps us improve...',
      'field-select': "const departments = ['Engineering'",
      'field-slider': 'let value = $state([200, 800])',
      'field-fieldset': '<FieldLegend>Address Information</FieldLegend>',
      'field-checkbox': "const desktopItems = ['Hard disks'",
      'field-radio': "['yearly', 'Yearly ($99.99/year)']",
      'field-switch': 'Multi-factor authentication',
      'field-choice-card': 'Run GPU workloads on a K8s cluster.',
      'field-group': 'Get notified when ChatGPT responds',
      'field-rtl': "let language = $state<keyof typeof translations>('ar')",
      'field-responsive': 'orientation="responsive"',
    }
    for (const previewName of previewCatalog.field) {
      const source = loadField(previewName)
      expect(source, previewName).toContain(markers[previewName])
      expect(source, previewName).not.toContain('Fict field composition.')
    }
    expect(loadField('field-demo')).toContain('Enter your 16-digit card number')
    expect(loadField('field-demo')).toContain("'11', '12'")
    expect(loadField('field-checkbox')).toContain('You can access them from other devices.')
    expect(loadField('field-rtl')).toContain('אמצעי תשלום')
    expect(loadField('field-rtl')).toContain('أدخل رقم البطاقة المكون من 16 رقمًا')
    expect(loadField('field-rtl')).toContain('<FieldLabel for="cvv-rtl">CVV</FieldLabel>')
  })

  it('keeps every Item source aligned with its rendered preview', () => {
    expectCuratedFamily('item')
    const loadItem = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'item', previewName })!
    const markers: Record<string, string> = {
      'item-demo': 'Your profile has been verified.',
      'item-variant': "['muted', 'Muted Variant'",
      'item-size': "['xs', 'Extra Small Size'",
      'item-icon': 'New login detected from unknown device.',
      'item-avatar': 'https://github.com/evilrabbit.png',
      'item-image': "['Midnight City Lights', 'Electric Nights'",
      'item-group': "['shadcn', 'shadcn@vercel.com']",
      'item-header': "['v0-1.5-sm', 'Everyday tasks and UI generation.'",
      'item-link': 'rel="noopener noreferrer"',
      'item-dropdown': '<DropdownMenuContent align="end">',
      'item-rtl': "let language = $state<keyof typeof translations>('ar')",
    }
    for (const previewName of previewCatalog.item) {
      const source = loadItem(previewName)
      expect(source, previewName).toContain(markers[previewName])
      expect(source, previewName).not.toContain('A composable Fict list item.')
    }
    expect(loadItem('item-rtl')).toContain('פריט בסיסי')
  })

  it('keeps every Menubar source aligned with its rendered preview', () => {
    expectCuratedFamily('menubar')
    const loadMenubar = (previewName: string) => loadFictExampleSource({ exampleRoot: repositoryExampleRoot, componentName: 'menubar', previewName })!
    expect(loadMenubar('menubar-demo')).toContain('<MenubarCheckboxItem checked>Full URLs</MenubarCheckboxItem>')
    expect(loadMenubar('menubar-demo')).toContain('<MenubarItem>Search the web</MenubarItem>')
    expect(loadMenubar('menubar-demo')).toContain('<MenubarItem inset>Hide Sidebar</MenubarItem>')
    expect(loadMenubar('menubar-checkbox')).toContain('Always Show Bookmarks Bar')
    expect(loadMenubar('menubar-radio')).toContain("let user = $state('benoit')")
    expect(loadMenubar('menubar-submenu')).toContain('<MenubarSubTrigger>Share</MenubarSubTrigger>')
    expect(loadMenubar('menubar-icons')).toContain('<MenubarItem variant="destructive">')
    expect(loadMenubar('menubar-rtl')).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(loadMenubar('menubar-rtl')).toContain('כרטיסייה חדשה')
    expect(loadMenubar('menubar-rtl')).toContain("searchWeb: 'البحث على الويب'")
    expect(loadMenubar('menubar-rtl')).toContain('<MenubarCheckboxItem checked>{t.urls}</MenubarCheckboxItem>')
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
