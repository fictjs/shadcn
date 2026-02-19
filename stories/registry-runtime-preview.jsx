/** @jsxImportSource fict */

import { DEFAULT_CONFIG } from '../src/core/constants'
import { builtinBlocks, builtinComponents, builtinThemes } from '../src/registry/builtin'

import { renderFict } from './render-fict'

const templateContext = {
  config: DEFAULT_CONFIG,
  imports: {
    cn: '@/lib/cn',
    variants: '@/lib/variants',
  },
  aliasFor: relativePath => '@/' + relativePath,
  uiImport: componentName => '@/components/ui/' + componentName,
}

const entryRegistry = {
  component: new Map(builtinComponents.map(entry => [entry.name, entry])),
  block: new Map(builtinBlocks.map(entry => [entry.name, entry])),
  theme: new Map(builtinThemes.map(entry => [entry.name, entry])),
}

export function renderRegistryEntryPreview(kind, name, liveModules) {
  const entry = getRegistryEntry(kind, name)
  const files = entry.files.map(file => ({
    path: file.path,
    content: file.content(templateContext),
  }))

  return renderFict(() => (
    <div class='min-h-screen w-full bg-background p-6 text-foreground'>
      <div class='mx-auto grid w-full max-w-6xl gap-4'>
        <header class='rounded-lg border bg-card p-4'>
          <p class='text-xs uppercase tracking-wider text-muted-foreground'>{kind}</p>
          <h1 class='mt-1 text-xl font-semibold'>{entry.name}</h1>
          <p class='mt-1 text-sm text-muted-foreground'>{entry.description}</p>
          <div class='mt-3 flex flex-wrap gap-2'>
            <span class='rounded border px-2 py-1 text-xs'>version: {entry.version}</span>
            <span class='rounded border px-2 py-1 text-xs'>files: {files.length}</span>
            <span class='rounded border px-2 py-1 text-xs'>deps: {entry.dependencies.length}</span>
            <span class='rounded border px-2 py-1 text-xs'>registry deps: {entry.registryDependencies.length}</span>
          </div>
        </header>

        <section class='overflow-hidden rounded-lg border bg-card'>
          <div class='border-b px-4 py-2 text-xs text-muted-foreground'>live preview</div>
          <div class='p-4'>{renderLivePreview(kind, name, liveModules)}</div>
        </section>

        {files.map(file => (
          <section class='overflow-hidden rounded-lg border bg-card'>
            <div class='border-b px-4 py-2 text-xs text-muted-foreground'>{file.path}</div>
            <pre class='max-h-[500px] overflow-auto p-4 text-xs leading-relaxed'>
              <code>{file.content}</code>
            </pre>
          </section>
        ))}
      </div>
    </div>
  ))
}

function getRegistryEntry(kind, name) {
  const entry = entryRegistry[kind].get(name)
  if (!entry) {
    throw new Error('Unknown registry entry: ' + kind + '/' + name)
  }
  return entry
}

function renderLivePreview(kind, name, liveModules) {
  if (kind === 'theme') {
    return renderThemePreview(name)
  }

  const moduleRecord = liveModules?.[kind]?.[name]
  if (!moduleRecord) {
    return (
      <div class='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
        Missing generated runtime module for {kind}/{name}.
      </div>
    )
  }

  if (kind === 'block') {
    return renderBlockPreview(name, moduleRecord)
  }

  return renderComponentPreview(name, moduleRecord)
}

function renderThemePreview(name) {
  if (name === 'init') {
    return (
      <div class='grid gap-3 md:grid-cols-2'>
        <div class='rounded-md border bg-card p-4'>
          <h3 class='text-sm font-semibold'>Light</h3>
          <p class='mt-1 text-sm text-muted-foreground'>
            init theme writes base token variables to <code>:root</code>.
          </p>
          <button class='mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-primary-foreground'>
            Primary Action
          </button>
        </div>
        <div class='dark rounded-md border bg-card p-4'>
          <h3 class='text-sm font-semibold'>Dark</h3>
          <p class='mt-1 text-sm text-muted-foreground'>Dark tokens are also included in the init entry.</p>
          <button class='mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-primary-foreground'>
            Primary Action
          </button>
        </div>
      </div>
    )
  }

  const className = name
  return (
    <div class='grid gap-3 md:grid-cols-2'>
      <div class={className + ' rounded-md border bg-card p-4'}>
        <h3 class='text-sm font-semibold'>Light</h3>
        <p class='mt-1 text-sm text-muted-foreground'>{name}</p>
        <button class='mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-primary-foreground'>
          Primary Action
        </button>
      </div>
      <div class={'dark ' + className + ' rounded-md border bg-card p-4'}>
        <h3 class='text-sm font-semibold'>Dark</h3>
        <p class='mt-1 text-sm text-muted-foreground'>{name}</p>
        <button class='mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-primary-foreground'>
          Primary Action
        </button>
      </div>
    </div>
  )
}

function renderBlockPreview(name, moduleRecord) {
  const baseName = name.split('/').at(-1) ?? name
  const preferred = [
    toPascalCase(name) + 'Block',
    toPascalCase(baseName) + 'Block',
    toPascalCase(name),
    toPascalCase(baseName),
  ]
  const component = pickRenderableExport(moduleRecord, preferred)
  if (!component) {
    return renderUnavailable('Could not locate an exported block component.')
  }
  return renderComponentInstance(component, {}, null, 'block/' + name)
}

function renderComponentPreview(name, moduleRecord) {
  try {
    if (name === 'utils') {
      return renderUtilsPreview(moduleRecord)
    }

    if (name === 'is-mobile') {
      return renderIsMobilePreview(moduleRecord)
    }

    if (name === 'accordion') {
      const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = moduleRecord
      return (
        <Accordion type='single' collapsible class='w-full max-w-xl rounded-md border px-4'>
          <AccordionItem value='item-1'>
            <AccordionTrigger>What is Fict?</AccordionTrigger>
            <AccordionContent>Fict is a lightweight JSX UI framework.</AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    }

    if (name === 'alert-dialog') {
      const { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } =
        moduleRecord
      return (
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    if (name === 'avatar') {
      const { Avatar, AvatarFallback } = moduleRecord
      return (
        <Avatar class='h-12 w-12 border'>
          <AvatarFallback>FD</AvatarFallback>
        </Avatar>
      )
    }

    if (name === 'breadcrumb') {
      const { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } = moduleRecord
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='#'>Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Components</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    }

    if (name === 'calendar' || name === 'range-calendar') {
      const component = pickRenderableExport(moduleRecord, [toPascalCase(name)])
      return renderComponentInstance(component, {}, null, 'component/' + name)
    }

    if (name === 'carousel') {
      const { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } = moduleRecord
      return (
        <Carousel class='w-full max-w-md'>
          <CarouselContent>
            <CarouselItem>
              <div class='rounded-md border bg-card p-6'>Slide 1</div>
            </CarouselItem>
            <CarouselItem>
              <div class='rounded-md border bg-card p-6'>Slide 2</div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )
    }

    if (name === 'chart') {
      const { ChartContainer, BarSparkline, ChartLegend } = moduleRecord
      const data = [
        { label: 'Mon', value: 8 },
        { label: 'Tue', value: 11 },
        { label: 'Wed', value: 6 },
        { label: 'Thu', value: 14 },
      ]
      return (
        <div class='w-full max-w-lg rounded-md border bg-card p-4'>
          <ChartContainer>
            <BarSparkline data={data} />
            <ChartLegend items={[{ label: 'Visitors' }]} />
          </ChartContainer>
        </div>
      )
    }

    if (name === 'collapsible') {
      const { Collapsible, CollapsibleTrigger, CollapsibleContent } = moduleRecord
      return (
        <Collapsible open class='w-full max-w-lg rounded-md border p-4'>
          <CollapsibleTrigger class='font-medium'>Configuration</CollapsibleTrigger>
          <CollapsibleContent class='mt-2 text-sm text-muted-foreground'>Environment variables and runtime options.</CollapsibleContent>
        </Collapsible>
      )
    }

    if (name === 'combobox') {
      const { Combobox, ComboboxInput, ComboboxList, ComboboxItem } = moduleRecord
      return (
        <Combobox class='w-full max-w-sm'>
          <ComboboxInput placeholder='Search framework...' />
          <ComboboxList>
            <ComboboxItem value='fict'>Fict</ComboboxItem>
            <ComboboxItem value='solid'>Solid</ComboboxItem>
            <ComboboxItem value='react'>React</ComboboxItem>
          </ComboboxList>
        </Combobox>
      )
    }

    if (name === 'command') {
      const { Command, CommandInput, CommandList, CommandGroup, CommandItem } = moduleRecord
      return (
        <Command class='w-full max-w-md rounded-md border'>
          <CommandInput placeholder='Type a command...' />
          <CommandList>
            <CommandGroup heading='Suggestions'>
              <CommandItem>Open Settings</CommandItem>
              <CommandItem>Create Project</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )
    }

    if (name === 'context-menu') {
      const { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } = moduleRecord
      return (
        <ContextMenu open>
          <ContextMenuTrigger class='rounded-md border bg-card px-4 py-3'>Right click target</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )
    }

    if (name === 'data-table') {
      const { DataTable } = moduleRecord
      const rows = [
        { name: 'Ari', role: 'Admin' },
        { name: 'Nia', role: 'Editor' },
      ]
      const columns = [
        { key: 'name', header: 'Name' },
        { key: 'role', header: 'Role' },
      ]
      return <DataTable data={rows} columns={columns} class='max-w-md' />
    }

    if (name === 'dialog' || name === 'drawer') {
      const Root = moduleRecord[name === 'dialog' ? 'Dialog' : 'Drawer']
      const Content = moduleRecord[name === 'dialog' ? 'DialogContent' : 'DrawerContent']
      const Header = moduleRecord[name === 'dialog' ? 'DialogHeader' : 'DrawerHeader']
      const Title = moduleRecord[name === 'dialog' ? 'DialogTitle' : 'DrawerTitle']
      const Description = moduleRecord[name === 'dialog' ? 'DialogDescription' : 'DrawerDescription']
      const Footer = moduleRecord[name === 'dialog' ? 'DialogFooter' : 'DrawerFooter']
      const Close = moduleRecord[name === 'dialog' ? 'DialogClose' : 'DrawerClose']
      if (!Root || !Content) {
        return renderUnavailable('Missing required dialog exports.')
      }
      return (
        <Root open>
          <Content>
            {Header ? (
              <Header>
                {Title ? <Title>Project Settings</Title> : null}
                {Description ? <Description>Adjust project-level preferences.</Description> : null}
              </Header>
            ) : null}
            <p class='text-sm text-muted-foreground'>Dialog content preview.</p>
            {Footer ? (
              <Footer>
                {Close ? <Close class='rounded-md border px-3 py-2 text-sm'>Close</Close> : null}
              </Footer>
            ) : null}
          </Content>
        </Root>
      )
    }

    if (name === 'dropdown-menu') {
      const { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } = moduleRecord
      return (
        <DropdownMenu open>
          <DropdownMenuTrigger class='rounded-md border bg-card px-3 py-2 text-sm'>Open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    if (name === 'form') {
      const { Form, FormField, FormLabel, FormControl, FormDescription, FormMessage } = moduleRecord
      return (
        <Form class='grid w-full max-w-md gap-2 rounded-md border bg-card p-4'>
          <FormField>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <input class='h-9 w-full rounded-md border px-3 text-sm' placeholder='name@example.com' />
            </FormControl>
            <FormDescription>We use this for account recovery.</FormDescription>
            <FormMessage />
          </FormField>
        </Form>
      )
    }

    if (name === 'hover-card') {
      const { HoverCard, HoverCardTriggerEl, HoverCardContent } = moduleRecord
      return (
        <HoverCard open>
          <HoverCardTriggerEl class='rounded-md border px-3 py-2 text-sm'>@fictjs</HoverCardTriggerEl>
          <HoverCardContent class='w-64'>Fast JSX runtime for modern UI.</HoverCardContent>
        </HoverCard>
      )
    }

    if (name === 'input-group') {
      const { InputGroup, InputGroupAddon, InputGroupInput } = moduleRecord
      return (
        <InputGroup class='max-w-sm'>
          <InputGroupAddon>https://</InputGroupAddon>
          <InputGroupInput placeholder='example.com' />
        </InputGroup>
      )
    }

    if (name === 'input-otp') {
      const { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } = moduleRecord
      return (
        <InputOTP value='123456' maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      )
    }

    if (name === 'item') {
      const { Item, ItemLeading, ItemContent, ItemTitle, ItemDescription, ItemTrailing } = moduleRecord
      return (
        <Item class='w-full max-w-md rounded-md border p-3'>
          <ItemLeading>⚡</ItemLeading>
          <ItemContent>
            <ItemTitle>Performance</ItemTitle>
            <ItemDescription>Optimized rendering pipeline</ItemDescription>
          </ItemContent>
          <ItemTrailing>Enabled</ItemTrailing>
        </Item>
      )
    }

    if (name === 'menubar') {
      const { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } = moduleRecord
      return (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New Tab</MenubarItem>
              <MenubarItem>Save</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )
    }

    if (name === 'native-select') {
      const { NativeSelect, NativeSelectOption } = moduleRecord
      return (
        <NativeSelect class='max-w-xs'>
          <NativeSelectOption value='starter'>Starter</NativeSelectOption>
          <NativeSelectOption value='pro'>Pro</NativeSelectOption>
          <NativeSelectOption value='enterprise'>Enterprise</NativeSelectOption>
        </NativeSelect>
      )
    }

    if (name === 'navigation-menu') {
      const { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport } =
        moduleRecord
      return (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href='#'>Getting Started</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
          <NavigationMenuViewport />
        </NavigationMenu>
      )
    }

    if (name === 'pagination') {
      const { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } = moduleRecord
      return (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href='#' />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href='#' isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href='#' />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
    }

    if (name === 'popover') {
      const { Popover, PopoverTrigger, PopoverContent } = moduleRecord
      return (
        <Popover open>
          <PopoverTrigger class='rounded-md border bg-card px-3 py-2 text-sm'>Open popover</PopoverTrigger>
          <PopoverContent>Popover content preview.</PopoverContent>
        </Popover>
      )
    }

    if (name === 'radio-group') {
      const { RadioGroup, RadioGroupItem } = moduleRecord
      return (
        <RadioGroup value='monthly' class='grid gap-2'>
          <label class='inline-flex items-center gap-2 text-sm'>
            <RadioGroupItem value='monthly' />
            Monthly
          </label>
          <label class='inline-flex items-center gap-2 text-sm'>
            <RadioGroupItem value='yearly' />
            Yearly
          </label>
        </RadioGroup>
      )
    }

    if (name === 'resizable') {
      const { ResizablePanelGroup, ResizablePanel, ResizableHandle } = moduleRecord
      return (
        <ResizablePanelGroup direction='horizontal' class='h-48 w-full max-w-lg rounded-md border'>
          <ResizablePanel defaultSize={50} class='p-3 text-sm'>
            Left panel
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} class='p-3 text-sm'>
            Right panel
          </ResizablePanel>
        </ResizablePanelGroup>
      )
    }

    if (name === 'scroll-area') {
      const { ScrollArea, ScrollAreaViewport, ScrollBar } = moduleRecord
      return (
        <ScrollArea class='h-40 w-full max-w-md rounded-md border'>
          <ScrollAreaViewport class='p-4 text-sm leading-6'>
            {Array.from({ length: 20 }, (_, index) => (
              <p>Scrollable line {index + 1}</p>
            ))}
          </ScrollAreaViewport>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      )
    }

    if (name === 'select') {
      const { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } = moduleRecord
      return (
        <Select value='apple'>
          <SelectTrigger class='w-56'>
            <SelectValue placeholder='Pick a fruit' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='apple'>Apple</SelectItem>
            <SelectItem value='orange'>Orange</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    if (name === 'sheet') {
      const { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } = moduleRecord
      return (
        <Sheet open>
          <SheetContent side='right'>
            <SheetHeader>
              <SheetTitle>Edit Profile</SheetTitle>
              <SheetDescription>Update your account information.</SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose class='rounded-md border px-3 py-2 text-sm'>Close</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )
    }

    if (name === 'sidebar') {
      const { Sidebar, SidebarHeader, SidebarContent, SidebarSection, SidebarSectionTitle, SidebarItem, SidebarFooter } = moduleRecord
      return (
        <Sidebar class='max-h-[420px] w-full max-w-xs rounded-md border'>
          <SidebarHeader>
            <h3 class='text-sm font-semibold'>Workspace</h3>
          </SidebarHeader>
          <SidebarContent>
            <SidebarSection>
              <SidebarSectionTitle>Main</SidebarSectionTitle>
              <SidebarItem>Overview</SidebarItem>
              <SidebarItem>Projects</SidebarItem>
            </SidebarSection>
          </SidebarContent>
          <SidebarFooter>v0.1.0</SidebarFooter>
        </Sidebar>
      )
    }

    if (name === 'table') {
      const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } = moduleRecord
      return (
        <div class='w-full max-w-xl rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Project A</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Project B</TableCell>
                <TableCell>Paused</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )
    }

    if (name === 'tabs') {
      const { Tabs, TabsList, TabsTrigger, TabsContent } = moduleRecord
      return (
        <Tabs value='overview' class='w-full max-w-lg'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
          </TabsList>
          <TabsContent value='overview' class='rounded-md border p-3'>
            Overview content
          </TabsContent>
          <TabsContent value='activity' class='rounded-md border p-3'>
            Activity content
          </TabsContent>
        </Tabs>
      )
    }

    if (name === 'toast' || name === 'sonner') {
      const ToastComp = moduleRecord.Toast ?? moduleRecord.Sonner
      const TitleComp = moduleRecord.ToastTitle ?? moduleRecord.SonnerTitle
      const DescComp = moduleRecord.ToastDescription ?? moduleRecord.SonnerDescription
      const ViewportComp = moduleRecord.ToastViewport ?? moduleRecord.SonnerViewport
      if (ToastComp && TitleComp && DescComp && ViewportComp) {
        return (
          <div class='relative min-h-[160px] w-full max-w-md rounded-md border bg-card p-4'>
            {renderComponentInstance(
              ToastComp,
              { open: true, class: 'pointer-events-auto' },
              <>
                <TitleComp>Deployment Complete</TitleComp>
                <DescComp>Your project is now live.</DescComp>
              </>,
              'toast',
            )}
            <ViewportComp />
          </div>
        )
      }
    }

    if (name === 'toggle-group') {
      const { ToggleGroup, ToggleGroupItem } = moduleRecord
      return (
        <ToggleGroup type='single' value='bold'>
          <ToggleGroupItem value='bold'>B</ToggleGroupItem>
          <ToggleGroupItem value='italic'>I</ToggleGroupItem>
          <ToggleGroupItem value='underline'>U</ToggleGroupItem>
        </ToggleGroup>
      )
    }

    if (name === 'tooltip') {
      const { TooltipProvider, Tooltip, TooltipTriggerEl, TooltipContent } = moduleRecord
      return (
        <TooltipProvider>
          <Tooltip open>
            <TooltipTriggerEl class='rounded-md border bg-card px-3 py-2 text-sm'>Hover target</TooltipTriggerEl>
            <TooltipContent>Tooltip preview</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  } catch (error) {
    return renderError(error, 'component/' + name)
  }

  const preferred = [toPascalCase(name), toPascalCase(name) + 'Block']
  const component = pickRenderableExport(moduleRecord, preferred)
  if (!component) {
    return renderUnavailable('Could not locate an exported component.')
  }
  return renderComponentInstance(component, { class: 'w-full max-w-xl' }, 'Preview', 'component/' + name)
}

function renderUtilsPreview(moduleRecord) {
  const clampValue = typeof moduleRecord.clamp === 'function' ? moduleRecord.clamp(17, 0, 10) : 'n/a'
  const formatted = typeof moduleRecord.formatNumber === 'function' ? moduleRecord.formatNumber(12345.67) : 'n/a'
  return (
    <div class='grid gap-2 rounded-md border bg-card p-4 text-sm'>
      <div>
        <span class='font-medium'>clamp(17, 0, 10):</span> <code>{String(clampValue)}</code>
      </div>
      <div>
        <span class='font-medium'>formatNumber(12345.67):</span> <code>{String(formatted)}</code>
      </div>
      <div class='text-muted-foreground'>
        <code>cn()</code>, <code>clamp()</code>, <code>formatNumber()</code> are utility exports, not visual widgets.
      </div>
    </div>
  )
}

function renderIsMobilePreview(moduleRecord) {
  let current = 'unknown'
  if (typeof moduleRecord.isMobile === 'function') {
    try {
      current = String(moduleRecord.isMobile())
    } catch {
      current = 'unavailable in this environment'
    }
  }
  return (
    <div class='rounded-md border bg-card p-4 text-sm'>
      <p>
        <span class='font-medium'>isMobile():</span> <code>{current}</code>
      </p>
      <p class='mt-1 text-muted-foreground'>
        This entry exports viewport utility functions for responsive runtime checks.
      </p>
    </div>
  )
}

function renderComponentInstance(component, props, children, label) {
  if (!component) {
    return renderUnavailable('No renderable export for ' + label + '.')
  }

  try {
    const Component = component
    if (children === null) {
      return <Component {...props} />
    }
    return <Component {...props}>{children}</Component>
  } catch (error) {
    return renderError(error, label)
  }
}

function pickRenderableExport(moduleRecord, preferred = []) {
  for (const name of preferred) {
    if (name && typeof moduleRecord[name] === 'function') {
      return moduleRecord[name]
    }
  }

  for (const [name, value] of Object.entries(moduleRecord)) {
    if (typeof value === 'function' && /^[A-Z]/.test(name)) {
      return value
    }
  }

  return null
}

function renderUnavailable(message) {
  return (
    <div class='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
      {message}
    </div>
  )
}

function renderError(error, label) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div class='rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
      Failed to render <code>{label}</code>: {message}
    </div>
  )
}

function toPascalCase(name) {
  return name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}
