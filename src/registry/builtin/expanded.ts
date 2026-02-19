import type { RegistryEntry, TemplateContext } from '../types'

const EXPANDED_COMPONENT_VERSION = '0.3.0'
const EXPANDED_BLOCK_VERSION = '0.3.0'
const EXPANDED_THEME_VERSION = '0.3.0'

type TemplateFn = (context: TemplateContext) => string

function createComponentEntry(options: {
  name: string
  description: string
  path?: string
  dependencies?: string[]
  registryDependencies?: string[]
  content: TemplateFn
}): RegistryEntry {
  return {
    name: options.name,
    version: EXPANDED_COMPONENT_VERSION,
    type: 'ui-component',
    description: options.description,
    dependencies: options.dependencies ?? [],
    registryDependencies: options.registryDependencies ?? [],
    files: [
      {
        path: options.path ?? `{{componentsDir}}/${options.name}.tsx`,
        content: options.content,
      },
    ],
  }
}

function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function toTitleCase(value: string): string {
  return value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const alertTemplate: TemplateFn = context => `import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '${context.imports.cn}'

const alertVariants = cva('relative w-full rounded-lg border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-2px]', {
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      success: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 [&>svg]:text-emerald-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type AlertProps = JSX.IntrinsicElements['div'] & VariantProps<typeof alertVariants>
type AlertTitleProps = JSX.IntrinsicElements['h5']
type AlertDescriptionProps = JSX.IntrinsicElements['div']

export function Alert(props: AlertProps) {
  const { class: className, variant, ...rest } = props
  return <div role='alert' class={cn(alertVariants({ variant }), className)} {...rest} />
}

export function AlertTitle(props: AlertTitleProps) {
  const { class: className, ...rest } = props
  return <h5 class={cn('mb-1 font-medium leading-none tracking-tight', className)} {...rest} />
}

export function AlertDescription(props: AlertDescriptionProps) {
  const { class: className, ...rest } = props
  return <div class={cn('text-sm [&_p]:leading-relaxed', className)} {...rest} />
}
`

const breadcrumbTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type NavProps = JSX.IntrinsicElements['nav']
type OlProps = JSX.IntrinsicElements['ol']
type LiProps = JSX.IntrinsicElements['li']
type AnchorProps = JSX.IntrinsicElements['a']
type SpanProps = JSX.IntrinsicElements['span']

export function Breadcrumb(props: NavProps) {
  const { class: className, ...rest } = props
  return <nav aria-label='breadcrumb' class={cn(className)} {...rest} />
}

export function BreadcrumbList(props: OlProps) {
  const { class: className, ...rest } = props
  return <ol class={cn('flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:gap-2.5', className)} {...rest} />
}

export function BreadcrumbItem(props: LiProps) {
  const { class: className, ...rest } = props
  return <li class={cn('inline-flex items-center gap-1.5', className)} {...rest} />
}

export function BreadcrumbLink(props: AnchorProps) {
  const { class: className, ...rest } = props
  return <a class={cn('transition-colors hover:text-foreground', className)} {...rest} />
}

export function BreadcrumbPage(props: SpanProps) {
  const { class: className, ...rest } = props
  return <span aria-current='page' class={cn('font-normal text-foreground', className)} {...rest} />
}

export function BreadcrumbSeparator(props: SpanProps) {
  const { class: className, children, ...rest } = props
  return (
    <span role='presentation' aria-hidden='true' class={cn('text-muted-foreground', className)} {...rest}>
      {children ?? '/'}
    </span>
  )
}

export function BreadcrumbEllipsis(props: SpanProps) {
  const { class: className, ...rest } = props
  return (
    <span role='presentation' aria-hidden='true' class={cn('flex h-9 w-9 items-center justify-center', className)} {...rest}>
      ...
    </span>
  )
}
`

const buttonGroupTemplate: TemplateFn = context => `import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '${context.imports.cn}'

const buttonGroupVariants = cva('inline-flex', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    attached: {
      true: '[&>*]:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:-ml-px',
      false: 'gap-2',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    attached: true,
  },
})

type ButtonGroupProps = JSX.IntrinsicElements['div'] & VariantProps<typeof buttonGroupVariants>

export function ButtonGroup(props: ButtonGroupProps) {
  const { class: className, orientation, attached, ...rest } = props
  return <div role='group' class={cn(buttonGroupVariants({ orientation, attached }), className)} {...rest} />
}
`

const calendarTemplate: TemplateFn = context => `import {
  Calendar as PrimitiveCalendar,
  CalendarGrid,
  CalendarHeader,
  CalendarNextButton,
  CalendarPrevButton,
  CalendarTitle,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

type CalendarProps = {
  class?: string
  [key: string]: unknown
}

export function Calendar(props: CalendarProps) {
  const { class: className, ...rest } = props
  return <PrimitiveCalendar class={cn('rounded-lg border p-3', className)} {...rest} />
}

export { CalendarGrid, CalendarHeader, CalendarNextButton, CalendarPrevButton, CalendarTitle }
`

const carouselTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type ButtonProps = JSX.IntrinsicElements['button']

function findCarouselTrack(start: EventTarget | null): HTMLElement | null {
  if (!(start instanceof HTMLElement)) return null
  const root = start.closest('[data-slot="carousel"]') as HTMLElement | null
  if (!root) return null
  return root.querySelector('[data-slot="carousel-content"]') as HTMLElement | null
}

function scrollTrackByPage(track: HTMLElement, direction: 1 | -1): void {
  const pageSize = track.clientWidth || 320
  track.scrollBy({ left: pageSize * direction, behavior: 'smooth' })
}

export function Carousel(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='carousel' class={cn('relative w-full', className)} {...rest} />
}

export function CarouselContent(props: DivProps) {
  const { class: className, ...rest } = props
  return (
    <div
      data-slot='carousel-content'
      class={cn('flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden', className)}
      {...rest}
    />
  )
}

export function CarouselItem(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='carousel-item' class={cn('min-w-0 shrink-0 grow-0 basis-full snap-center', className)} {...rest} />
}

export function CarouselPrevious(props: ButtonProps) {
  const { class: className, onClick, ...rest } = props

  return (
    <button
      type='button'
      aria-label='Previous slide'
      class={cn('absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background px-3 py-2 text-sm shadow-sm', className)}
      onClick={(event: MouseEvent) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        const track = findCarouselTrack(event.currentTarget)
        if (!track) return
        scrollTrackByPage(track, -1)
      }}
      {...rest}
    >
      ‹
    </button>
  )
}

export function CarouselNext(props: ButtonProps) {
  const { class: className, onClick, ...rest } = props

  return (
    <button
      type='button'
      aria-label='Next slide'
      class={cn('absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background px-3 py-2 text-sm shadow-sm', className)}
      onClick={(event: MouseEvent) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        const track = findCarouselTrack(event.currentTarget)
        if (!track) return
        scrollTrackByPage(track, 1)
      }}
      {...rest}
    >
      ›
    </button>
  )
}
`

const chartTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

export interface ChartPoint {
  label: string
  value: number
}

export interface ChartLegendItem {
  label: string
  colorClass?: string
}

type DivProps = JSX.IntrinsicElements['div']

type SparklineProps = {
  data: ChartPoint[]
  class?: string
}

type LegendProps = DivProps & {
  items: ChartLegendItem[]
}

function maxValue(data: ChartPoint[]): number {
  const values = data.map(point => point.value)
  const next = Math.max(...values, 1)
  return Number.isFinite(next) ? next : 1
}

export function ChartContainer(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='chart-container' class={cn('rounded-lg border bg-card p-4 text-card-foreground', className)} {...rest} />
}

export function BarSparkline(props: SparklineProps) {
  const max = maxValue(props.data)
  return (
    <div class={cn('flex h-40 items-end gap-2', props.class)}>
      {props.data.map(point => (
        <div class='flex flex-1 flex-col items-center gap-2'>
          <div class='w-full rounded-sm bg-primary/20'>
            <div class='w-full rounded-sm bg-primary transition-[height]' style={{ height: String(Math.max((point.value / max) * 128, 4)) + 'px' }} />
          </div>
          <span class='text-xs text-muted-foreground'>{point.label}</span>
        </div>
      ))}
    </div>
  )
}

export function ChartLegend(props: LegendProps) {
  const { class: className, items, ...rest } = props

  return (
    <div class={cn('mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground', className)} {...rest}>
      {items.map(item => (
        <span class='inline-flex items-center gap-2'>
          <span class={cn('h-2.5 w-2.5 rounded-full bg-primary', item.colorClass)} />
          {item.label}
        </span>
      ))}
    </div>
  )
}
`

const commandTemplate: TemplateFn = context => `import {
  CommandPaletteClose,
  CommandPaletteContent as PrimitiveCommandContent,
  CommandPaletteEmpty as PrimitiveCommandEmpty,
  CommandPaletteGroup as PrimitiveCommandGroup,
  CommandPaletteInput as PrimitiveCommandInput,
  CommandPaletteItem as PrimitiveCommandItem,
  CommandPaletteList as PrimitiveCommandList,
  CommandPaletteRoot,
  CommandPaletteSeparator as PrimitiveCommandSeparator,
  CommandPaletteTrigger,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Command = CommandPaletteRoot
export const CommandDialog = PrimitiveCommandContent
export const CommandTrigger = CommandPaletteTrigger
export const CommandClose = CommandPaletteClose

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function CommandInput(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveCommandInput
      class={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground', className)}
      {...rest}
    />
  )
}

export function CommandList(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveCommandList class={cn('max-h-80 overflow-y-auto p-1', className)} {...rest} />
}

export function CommandItem(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveCommandItem
      class={cn('flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=selected]:bg-accent data-[state=selected]:text-accent-foreground', className)}
      {...rest}
    />
  )
}

export function CommandGroup(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveCommandGroup class={cn('overflow-hidden p-1 text-foreground', className)} {...rest} />
}

export function CommandSeparator(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveCommandSeparator class={cn('my-1 h-px bg-border', className)} {...rest} />
}

export function CommandEmpty(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveCommandEmpty class={cn('py-6 text-center text-sm text-muted-foreground', className)} {...rest} />
}

export function CommandContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveCommandContent class={cn('overflow-hidden rounded-lg border bg-popover shadow-md', className)} {...rest} />
}
`

const dataTableTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '${context.uiImport('table')}'

export interface DataTableColumn<Row extends Record<string, unknown>> {
  key: keyof Row | string
  header: string
  class?: string
  cell?: (row: Row) => unknown
}

export interface DataTableProps<Row extends Record<string, unknown>> {
  data: Row[]
  columns: DataTableColumn<Row>[]
  emptyText?: string
  class?: string
}

function readCellValue<Row extends Record<string, unknown>>(row: Row, key: keyof Row | string): unknown {
  if (typeof key === 'string' && key in row) {
    return row[key as keyof Row]
  }
  return undefined
}

export function DataTable<Row extends Record<string, unknown>>(props: DataTableProps<Row>) {
  const { data, columns, emptyText = 'No rows found.', class: className } = props

  return (
    <div class={cn('w-full overflow-x-auto rounded-lg border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead class={column.class}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map(row => (
              <TableRow>
                {columns.map(column => (
                  <TableCell class={column.class}>{column.cell ? column.cell(row) : readCellValue(row, column.key)}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} class='h-24 text-center text-muted-foreground'>
                {emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
`

const drawerTemplate: TemplateFn = context => `export {
  Sheet as Drawer,
  SheetClose as DrawerClose,
  SheetContent as DrawerContent,
  SheetDescription as DrawerDescription,
  SheetFooter as DrawerFooter,
  SheetHeader as DrawerHeader,
  SheetTitle as DrawerTitle,
  SheetTrigger as DrawerTrigger,
} from '${context.uiImport('sheet')}'
`

const emptyTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type HeadingProps = JSX.IntrinsicElements['h3']
type ParagraphProps = JSX.IntrinsicElements['p']

export function Empty(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center', className)} {...rest} />
}

export function EmptyTitle(props: HeadingProps) {
  const { class: className, ...rest } = props
  return <h3 class={cn('mt-4 text-lg font-semibold', className)} {...rest} />
}

export function EmptyDescription(props: ParagraphProps) {
  const { class: className, ...rest } = props
  return <p class={cn('mt-2 max-w-prose text-sm text-muted-foreground', className)} {...rest} />
}

export function EmptyAction(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('mt-6 flex items-center justify-center gap-2', className)} {...rest} />
}
`

const fieldTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'
import { Label } from '${context.uiImport('label')}'

type DivProps = JSX.IntrinsicElements['div']
type ParagraphProps = JSX.IntrinsicElements['p']

export function Field(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('grid gap-2', className)} {...rest} />
}

export function FieldLabel(props: JSX.IntrinsicElements['label']) {
  return <Label {...props} />
}

export function FieldControl(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('grid gap-1', className)} {...rest} />
}

export function FieldDescription(props: ParagraphProps) {
  const { class: className, ...rest } = props
  return <p class={cn('text-xs text-muted-foreground', className)} {...rest} />
}

export function FieldError(props: ParagraphProps) {
  const { class: className, ...rest } = props
  return <p class={cn('text-xs font-medium text-destructive', className)} {...rest} />
}
`

const inputGroupTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'
import { Input } from '${context.uiImport('input')}'

type DivProps = JSX.IntrinsicElements['div']
type SpanProps = JSX.IntrinsicElements['span']

type InputGroupInputProps = {
  class?: string
  [key: string]: unknown
}

export function InputGroup(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex w-full items-stretch rounded-md border border-input bg-background', className)} {...rest} />
}

export function InputGroupAddon(props: SpanProps) {
  const { class: className, ...rest } = props
  return <span class={cn('inline-flex items-center border-r px-3 text-sm text-muted-foreground last:border-r-0', className)} {...rest} />
}

export function InputGroupInput(props: InputGroupInputProps) {
  const { class: className, ...rest } = props
  return <Input class={cn('rounded-none border-0 shadow-none focus-visible:ring-0', className)} {...rest} />
}
`

const inputOtpTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']

type SlotProps = JSX.IntrinsicElements['input'] & {
  index: number
  total: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function focusSibling(target: HTMLInputElement, index: number, total: number): void {
  const nextIndex = clamp(index, 0, total - 1)
  const root = target.closest('[data-slot="input-otp"]')
  if (!root) return
  const next = root.querySelector('[data-otp-index="' + nextIndex + '"]') as HTMLInputElement | null
  next?.focus()
  next?.select()
}

export function InputOTP(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='input-otp' class={cn('flex items-center gap-2', className)} {...rest} />
}

export function InputOTPGroup(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='input-otp-group' class={cn('flex items-center gap-2', className)} {...rest} />
}

export function InputOTPSlot(props: SlotProps) {
  const { class: className, index, total, onInput, onKeyDown, ...rest } = props

  return (
    <input
      inputMode='numeric'
      maxLength={1}
      autoComplete='one-time-code'
      data-otp-index={index}
      class={cn('h-10 w-10 rounded-md border border-input bg-background text-center text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring', className)}
      onInput={(event: Event) => {
        onInput?.(event)
        const target = event.currentTarget as HTMLInputElement | null
        if (!target) return
        if (target.value.length >= 1) {
          focusSibling(target, index + 1, total)
        }
      }}
      onKeyDown={(event: KeyboardEvent) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return

        const target = event.currentTarget as HTMLInputElement | null
        if (!target) return

        if (event.key === 'Backspace' && target.value.length === 0) {
          focusSibling(target, index - 1, total)
        }
      }}
      {...rest}
    />
  )
}

export function InputOTPSeparator(props: DivProps) {
  const { class: className, children, ...rest } = props
  return (
    <div data-slot='input-otp-separator' class={cn('text-muted-foreground', className)} {...rest}>
      {children ?? '-'}
    </div>
  )
}
`

const itemTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type HeadingProps = JSX.IntrinsicElements['h4']
type ParagraphProps = JSX.IntrinsicElements['p']

export function Item(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex items-start gap-3 rounded-lg border p-4', className)} {...rest} />
}

export function ItemLeading(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('mt-0.5 shrink-0 text-muted-foreground', className)} {...rest} />
}

export function ItemContent(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('grid min-w-0 gap-1', className)} {...rest} />
}

export function ItemTitle(props: HeadingProps) {
  const { class: className, ...rest } = props
  return <h4 class={cn('truncate text-sm font-medium', className)} {...rest} />
}

export function ItemDescription(props: ParagraphProps) {
  const { class: className, ...rest } = props
  return <p class={cn('text-sm text-muted-foreground', className)} {...rest} />
}

export function ItemTrailing(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('ml-auto shrink-0', className)} {...rest} />
}
`

const kbdTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type KbdProps = JSX.IntrinsicElements['kbd']

export function Kbd(props: KbdProps) {
  const { class: className, ...rest } = props
  return <kbd class={cn('inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground', className)} {...rest} />
}
`

const nativeSelectTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type SelectProps = JSX.IntrinsicElements['select']
type OptionProps = JSX.IntrinsicElements['option']

export function NativeSelect(props: SelectProps) {
  const { class: className, ...rest } = props
  return (
    <div class='relative'>
      <select
        class={cn(
          'flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...rest}
      />
      <span class='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>▾</span>
    </div>
  )
}

export function NativeSelectOption(props: OptionProps) {
  return <option {...props} />
}
`

const paginationTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'
import { buttonVariants } from '${context.uiImport('button')}'

type NavProps = JSX.IntrinsicElements['nav']
type UlProps = JSX.IntrinsicElements['ul']
type LiProps = JSX.IntrinsicElements['li']
type AnchorProps = JSX.IntrinsicElements['a']
type SpanProps = JSX.IntrinsicElements['span']

export function Pagination(props: NavProps) {
  const { class: className, ...rest } = props
  return <nav role='navigation' aria-label='pagination' class={cn('mx-auto flex w-full justify-center', className)} {...rest} />
}

export function PaginationContent(props: UlProps) {
  const { class: className, ...rest } = props
  return <ul class={cn('flex flex-row items-center gap-1', className)} {...rest} />
}

export function PaginationItem(props: LiProps) {
  return <li {...props} />
}

export function PaginationLink(props: AnchorProps & { isActive?: boolean }) {
  const { class: className, isActive, ...rest } = props
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      class={cn(
        buttonVariants({ variant: isActive ? 'outline' : 'ghost', size: 'icon' }),
        'h-9 w-9',
        className,
      )}
      {...rest}
    />
  )
}

export function PaginationPrevious(props: AnchorProps) {
  const { class: className, ...rest } = props
  return <PaginationLink aria-label='Go to previous page' class={cn('w-auto px-3', className)} {...rest}>Previous</PaginationLink>
}

export function PaginationNext(props: AnchorProps) {
  const { class: className, ...rest } = props
  return <PaginationLink aria-label='Go to next page' class={cn('w-auto px-3', className)} {...rest}>Next</PaginationLink>
}

export function PaginationEllipsis(props: SpanProps) {
  const { class: className, ...rest } = props
  return <span aria-hidden='true' class={cn('flex h-9 w-9 items-center justify-center text-muted-foreground', className)} {...rest}>…</span>
}
`

const rangeCalendarTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'
import { Calendar } from '${context.uiImport('calendar')}'

type RangeCalendarProps = {
  class?: string
  startMonth?: Date | string
  endMonth?: Date | string
  [key: string]: unknown
}

function normalizeMonth(value: Date | string | undefined, fallback: Date): Date {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth() + 1, 1)
}

export function RangeCalendar(props: RangeCalendarProps) {
  const baseMonth = normalizeMonth(props.startMonth, new Date())
  const nextMonth = normalizeMonth(props.endMonth, addMonth(baseMonth))
  const { class: className, startMonth, endMonth, ...rest } = props

  return (
    <div class={cn('grid gap-4 md:grid-cols-2', className)} {...rest}>
      <Calendar month={baseMonth} />
      <Calendar month={nextMonth} />
    </div>
  )
}
`

const resizableTemplate: TemplateFn = context => `import {
  ResizableHandle as PrimitiveResizableHandle,
  ResizablePanel as PrimitiveResizablePanel,
  ResizablePanelGroup as PrimitiveResizablePanelGroup,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function ResizablePanelGroup(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveResizablePanelGroup class={cn('flex h-full w-full rounded-lg border', className)} {...rest} />
}

export function ResizablePanel(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveResizablePanel class={cn('overflow-auto p-4', className)} {...rest} />
}

export function ResizableHandle(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveResizableHandle
      class={cn('relative bg-border after:absolute after:inset-0 after:m-auto after:h-10 after:w-1 after:rounded-full after:bg-muted-foreground/30', className)}
      {...rest}
    />
  )
}
`

const scrollAreaTemplate: TemplateFn = context => `import {
  ScrollArea as PrimitiveScrollArea,
  ScrollAreaScrollbar as PrimitiveScrollAreaScrollbar,
  ScrollAreaThumb as PrimitiveScrollAreaThumb,
  ScrollAreaViewport as PrimitiveScrollAreaViewport,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function ScrollArea(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveScrollArea class={cn('relative overflow-hidden rounded-md border', className)} {...rest} />
}

export function ScrollBar(props: GenericProps) {
  const { class: className, orientation = 'vertical', ...rest } = props
  return (
    <PrimitiveScrollAreaScrollbar
      orientation={orientation}
      class={cn(
        'flex select-none touch-none p-0.5 transition-colors',
        orientation === 'vertical' ? 'h-full w-2.5 border-l border-l-transparent' : 'h-2.5 w-full border-t border-t-transparent',
        className,
      )}
      {...rest}
    >
      <PrimitiveScrollAreaThumb class='relative flex-1 rounded-full bg-border' />
    </PrimitiveScrollAreaScrollbar>
  )
}

export function ScrollAreaViewport(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveScrollAreaViewport class={cn('h-full w-full rounded-[inherit]', className)} {...rest} />
}
`

const sidebarTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type NavProps = JSX.IntrinsicElements['nav']
type ButtonProps = JSX.IntrinsicElements['button']
type AnchorProps = JSX.IntrinsicElements['a']

export function Sidebar(props: DivProps) {
  const { class: className, ...rest } = props
  return <aside class={cn('flex h-full w-72 flex-col border-r bg-background', className)} {...rest} />
}

export function SidebarHeader(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('border-b px-4 py-3', className)} {...rest} />
}

export function SidebarContent(props: NavProps) {
  const { class: className, ...rest } = props
  return <nav class={cn('flex-1 space-y-1 overflow-auto p-3', className)} {...rest} />
}

export function SidebarFooter(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('border-t p-3', className)} {...rest} />
}

export function SidebarSection(props: DivProps) {
  const { class: className, ...rest } = props
  return <section class={cn('space-y-1', className)} {...rest} />
}

export function SidebarSectionTitle(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground', className)} {...rest} />
}

export function SidebarItem(props: ButtonProps) {
  const { class: className, ...rest } = props
  return (
    <button
      type='button'
      class={cn('flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground', className)}
      {...rest}
    />
  )
}

export function SidebarLink(props: AnchorProps) {
  const { class: className, ...rest } = props
  return <a class={cn('flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground', className)} {...rest} />
}
`

const sonnerTemplate: TemplateFn = context => `export {
  Toast as Sonner,
  ToastAction as SonnerAction,
  ToastClose as SonnerClose,
  ToastDescription as SonnerDescription,
  ToastTitle as SonnerTitle,
  ToastViewport as SonnerViewport,
  ToastProvider as SonnerProvider,
  useToast as useSonner,
} from '${context.uiImport('toast')}'
`

const spinnerTemplate: TemplateFn = context => `import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '${context.imports.cn}'

const spinnerVariants = cva('inline-block animate-spin rounded-full border-2 border-current border-r-transparent', {
  variants: {
    size: {
      sm: 'h-3 w-3',
      default: 'h-4 w-4',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

type SpinnerProps = JSX.IntrinsicElements['span'] & VariantProps<typeof spinnerVariants>

export function Spinner(props: SpinnerProps) {
  const { class: className, size, ...rest } = props
  return <span role='status' aria-label='Loading' class={cn(spinnerVariants({ size }), className)} {...rest} />
}
`

const isMobileTemplate: TemplateFn = () => `const MOBILE_MEDIA_QUERY = '(max-width: 768px)'

export function isMobile(mediaQuery = MOBILE_MEDIA_QUERY): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia(mediaQuery).matches
}

export function subscribeIsMobile(
  callback: (matches: boolean) => void,
  mediaQuery = MOBILE_MEDIA_QUERY,
): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    callback(false)
    return () => {}
  }

  const mql = window.matchMedia(mediaQuery)
  const listener = (event: MediaQueryListEvent) => callback(event.matches)

  callback(mql.matches)
  mql.addEventListener('change', listener)

  return () => {
    mql.removeEventListener('change', listener)
  }
}
`

const utilsTemplate: TemplateFn = () => `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value)
}
`

export const expandedComponentRegistry: RegistryEntry[] = [
  createComponentEntry({
    name: 'alert',
    description: 'Alert component with semantic variants',
    dependencies: ['class-variance-authority'],
    content: alertTemplate,
  }),
  createComponentEntry({
    name: 'breadcrumb',
    description: 'Composable breadcrumb navigation primitives',
    content: breadcrumbTemplate,
  }),
  createComponentEntry({
    name: 'button-group',
    description: 'Button grouping container with orientation support',
    dependencies: ['class-variance-authority'],
    content: buttonGroupTemplate,
  }),
  createComponentEntry({
    name: 'calendar',
    description: 'Styled wrappers for calendar primitives',
    dependencies: ['@fictjs/ui-primitives'],
    content: calendarTemplate,
  }),
  createComponentEntry({
    name: 'carousel',
    description: 'Scroll-snap carousel building blocks',
    content: carouselTemplate,
  }),
  createComponentEntry({
    name: 'chart',
    description: 'Chart container and lightweight sparkline helpers',
    content: chartTemplate,
  }),
  createComponentEntry({
    name: 'command',
    description: 'Command palette wrappers with styling defaults',
    dependencies: ['@fictjs/ui-primitives'],
    content: commandTemplate,
  }),
  createComponentEntry({
    name: 'data-table',
    description: 'Headless data table renderer over table primitives',
    registryDependencies: ['table'],
    content: dataTableTemplate,
  }),
  createComponentEntry({
    name: 'drawer',
    description: 'Drawer aliases powered by sheet components',
    registryDependencies: ['sheet'],
    content: drawerTemplate,
  }),
  createComponentEntry({
    name: 'empty',
    description: 'Empty-state layout primitives',
    content: emptyTemplate,
  }),
  createComponentEntry({
    name: 'field',
    description: 'Field composition primitives for labels and messages',
    registryDependencies: ['label'],
    content: fieldTemplate,
  }),
  createComponentEntry({
    name: 'input-group',
    description: 'Input groups with addons and embedded controls',
    registryDependencies: ['input'],
    content: inputGroupTemplate,
  }),
  createComponentEntry({
    name: 'input-otp',
    description: 'OTP input slots with keyboard-aware focus behavior',
    content: inputOtpTemplate,
  }),
  createComponentEntry({
    name: 'item',
    description: 'List item layout primitives for rich rows',
    content: itemTemplate,
  }),
  createComponentEntry({
    name: 'kbd',
    description: 'Keyboard keycap component',
    content: kbdTemplate,
  }),
  createComponentEntry({
    name: 'native-select',
    description: 'Styled native select control',
    content: nativeSelectTemplate,
  }),
  createComponentEntry({
    name: 'pagination',
    description: 'Pagination primitives aligned with button variants',
    registryDependencies: ['button'],
    content: paginationTemplate,
  }),
  createComponentEntry({
    name: 'range-calendar',
    description: 'Two-month range calendar composition',
    registryDependencies: ['calendar'],
    content: rangeCalendarTemplate,
  }),
  createComponentEntry({
    name: 'resizable',
    description: 'Resizable panel wrappers with default styling',
    dependencies: ['@fictjs/ui-primitives'],
    content: resizableTemplate,
  }),
  createComponentEntry({
    name: 'scroll-area',
    description: 'Scroll area wrappers with themed scrollbar',
    dependencies: ['@fictjs/ui-primitives'],
    content: scrollAreaTemplate,
  }),
  createComponentEntry({
    name: 'sidebar',
    description: 'Sidebar layout primitives for app navigation',
    content: sidebarTemplate,
  }),
  createComponentEntry({
    name: 'sonner',
    description: 'Sonner-style aliases on top of toast primitives',
    registryDependencies: ['toast'],
    content: sonnerTemplate,
  }),
  createComponentEntry({
    name: 'spinner',
    description: 'Animated spinner indicator with size variants',
    dependencies: ['class-variance-authority'],
    content: spinnerTemplate,
  }),
  createComponentEntry({
    name: 'is-mobile',
    description: 'Viewport mobile helpers and subscription utility',
    path: '{{libDir}}/hooks/is-mobile.ts',
    content: isMobileTemplate,
  }),
  createComponentEntry({
    name: 'utils',
    description: 'Shared utility helpers for classes and formatting',
    path: '{{libDir}}/utils.ts',
    dependencies: ['clsx', 'tailwind-merge'],
    content: utilsTemplate,
  }),
]

const expandedBlockNames = [
  'calendar-01',
  'calendar-02',
  'calendar-03',
  'calendar-04',
  'calendar-05',
  'calendar-06',
  'calendar-07',
  'calendar-08',
  'calendar-09',
  'calendar-10',
  'calendar-11',
  'calendar-12',
  'calendar-13',
  'calendar-14',
  'calendar-15',
  'calendar-16',
  'calendar-17',
  'calendar-18',
  'calendar-19',
  'calendar-20',
  'calendar-21',
  'calendar-22',
  'calendar-23',
  'calendar-24',
  'calendar-25',
  'calendar-26',
  'calendar-27',
  'calendar-28',
  'calendar-29',
  'calendar-30',
  'calendar-31',
  'calendar-32',
  'chart-area-axes',
  'chart-area-default',
  'chart-area-gradient',
  'chart-area-icons',
  'chart-area-interactive',
  'chart-area-legend',
  'chart-area-linear',
  'chart-area-stacked-expand',
  'chart-area-stacked',
  'chart-area-step',
  'chart-bar-active',
  'chart-bar-default',
  'chart-bar-horizontal',
  'chart-bar-interactive',
  'chart-bar-label-custom',
  'chart-bar-label',
  'chart-bar-mixed',
  'chart-bar-multiple',
  'chart-bar-negative',
  'chart-bar-stacked',
  'chart-line-default',
  'chart-line-dots-colors',
  'chart-line-dots-custom',
  'chart-line-dots',
  'chart-line-interactive',
  'chart-line-label-custom',
  'chart-line-label',
  'chart-line-linear',
  'chart-line-multiple',
  'chart-line-step',
  'chart-pie-donut-active',
  'chart-pie-donut-text',
  'chart-pie-donut',
  'chart-pie-interactive',
  'chart-pie-label-custom',
  'chart-pie-label-list',
  'chart-pie-label',
  'chart-pie-legend',
  'chart-pie-separator-none',
  'chart-pie-simple',
  'chart-pie-stacked',
  'chart-radar-default',
  'chart-radar-dots',
  'chart-radar-grid-circle-fill',
  'chart-radar-grid-circle-no-lines',
  'chart-radar-grid-circle',
  'chart-radar-grid-custom',
  'chart-radar-grid-fill',
  'chart-radar-grid-none',
  'chart-radar-icons',
  'chart-radar-label-custom',
  'chart-radar-legend',
  'chart-radar-lines-only',
  'chart-radar-multiple',
  'chart-radar-radius',
  'chart-radial-grid',
  'chart-radial-label',
  'chart-radial-shape',
  'chart-radial-simple',
  'chart-radial-stacked',
  'chart-radial-text',
  'chart-tooltip-advanced',
  'chart-tooltip-default',
  'chart-tooltip-formatter',
  'chart-tooltip-icons',
  'chart-tooltip-indicator-line',
  'chart-tooltip-indicator-none',
  'chart-tooltip-label-custom',
  'chart-tooltip-label-formatter',
  'chart-tooltip-label-none',
  'dashboard-01',
  'demo-sidebar-controlled',
  'demo-sidebar-footer',
  'demo-sidebar-group-action',
  'demo-sidebar-group-collapsible',
  'demo-sidebar-group',
  'demo-sidebar-header',
  'demo-sidebar-menu-action',
  'demo-sidebar-menu-badge',
  'demo-sidebar-menu-collapsible',
  'demo-sidebar-menu-sub',
  'demo-sidebar-menu',
  'demo-sidebar',
  'login-01',
  'login-02',
  'login-03',
  'login-04',
  'login-05',
  'new-components-01',
  'otp-01',
  'otp-02',
  'otp-03',
  'otp-04',
  'otp-05',
  'sidebar-01',
  'sidebar-02',
  'sidebar-03',
  'sidebar-04',
  'sidebar-05',
  'sidebar-06',
] as const

type ExpandedBlockKind = 'calendar' | 'chart' | 'dashboard' | 'sidebar' | 'login' | 'otp' | 'showcase'

function getExpandedBlockKind(name: string): ExpandedBlockKind {
  if (name.startsWith('calendar-')) return 'calendar'
  if (name.startsWith('chart-')) return 'chart'
  if (name === 'dashboard-01') return 'dashboard'
  if (name.startsWith('demo-sidebar') || name.startsWith('sidebar-')) return 'sidebar'
  if (name.startsWith('login-')) return 'login'
  if (name.startsWith('otp-')) return 'otp'
  return 'showcase'
}

function getExpandedBlockRegistryDependencies(kind: ExpandedBlockKind): string[] {
  if (kind === 'calendar') return ['calendar', 'card']
  if (kind === 'chart') return ['card', 'chart']
  if (kind === 'dashboard') return ['badge', 'card', 'chart', 'sidebar']
  if (kind === 'sidebar') return ['button', 'sidebar']
  if (kind === 'login') return ['button', 'card', 'input', 'label']
  if (kind === 'otp') return ['button', 'card', 'input-otp', 'label']
  return ['alert', 'button', 'button-group', 'kbd', 'spinner']
}

function renderCalendarBlock(name: string, context: TemplateContext): string {
  const functionName = `${toPascalCase(name)}Block`
  const title = toTitleCase(name)

  return `import { Calendar } from '${context.uiImport('calendar')}'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '${context.uiImport('card')}'

export function ${functionName}() {
  return (
    <Card class='w-full max-w-md'>
      <CardHeader>
        <CardTitle>${title}</CardTitle>
        <CardDescription>Calendar showcase block generated from the expanded built-in catalog.</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar />
      </CardContent>
    </Card>
  )
}
`
}

function renderChartBlock(name: string, context: TemplateContext): string {
  const functionName = `${toPascalCase(name)}Block`
  const title = toTitleCase(name)

  return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '${context.uiImport('card')}'
import { BarSparkline, ChartContainer, ChartLegend } from '${context.uiImport('chart')}'

const data = [
  { label: 'Mon', value: 24 },
  { label: 'Tue', value: 32 },
  { label: 'Wed', value: 18 },
  { label: 'Thu', value: 41 },
  { label: 'Fri', value: 36 },
]

export function ${functionName}() {
  return (
    <Card class='w-full'>
      <CardHeader>
        <CardTitle>${title}</CardTitle>
        <CardDescription>Chart variation scaffold for rapid customization.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer>
          <BarSparkline data={data} />
          <ChartLegend items={[{ label: 'Visitors' }]} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
`
}

function renderDashboardBlock(name: string, context: TemplateContext): string {
  const functionName = `${toPascalCase(name)}Block`

  return `import { Badge } from '${context.uiImport('badge')}'
import { Card, CardContent, CardHeader, CardTitle } from '${context.uiImport('card')}'
import { BarSparkline, ChartContainer } from '${context.uiImport('chart')}'
import { Sidebar, SidebarContent, SidebarHeader, SidebarItem } from '${context.uiImport('sidebar')}'

const trend = [
  { label: 'M', value: 12 },
  { label: 'T', value: 16 },
  { label: 'W', value: 14 },
  { label: 'T', value: 18 },
  { label: 'F', value: 22 },
]

export function ${functionName}() {
  return (
    <div class='grid gap-4 lg:grid-cols-[260px_1fr]'>
      <Sidebar>
        <SidebarHeader>
          <h2 class='text-sm font-semibold'>Dashboard</h2>
          <p class='text-xs text-muted-foreground'>Expanded catalog preview</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarItem>Overview</SidebarItem>
          <SidebarItem>Analytics</SidebarItem>
          <SidebarItem>Billing</SidebarItem>
        </SidebarContent>
      </Sidebar>
      <div class='space-y-4'>
        <header class='flex items-center gap-2'>
          <h1 class='text-xl font-semibold'>Performance</h1>
          <Badge>Live</Badge>
        </header>
        <div class='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent class='text-2xl font-semibold'>$21,430</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Conversion</CardTitle>
            </CardHeader>
            <CardContent class='text-2xl font-semibold'>4.7%</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
            </CardHeader>
            <CardContent class='text-2xl font-semibold'>16</CardContent>
          </Card>
        </div>
        <ChartContainer>
          <BarSparkline data={trend} />
        </ChartContainer>
      </div>
    </div>
  )
}
`
}

function renderSidebarBlock(name: string, context: TemplateContext): string {
  const functionName = `${toPascalCase(name)}Block`
  const title = toTitleCase(name)

  return `import { Button } from '${context.uiImport('button')}'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSection,
  SidebarSectionTitle,
  SidebarItem,
} from '${context.uiImport('sidebar')}'

export function ${functionName}() {
  return (
    <Sidebar class='max-h-[560px] rounded-lg border'>
      <SidebarHeader>
        <h3 class='text-sm font-semibold'>${title}</h3>
        <p class='text-xs text-muted-foreground'>Sidebar pattern scaffold</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSection>
          <SidebarSectionTitle>Main</SidebarSectionTitle>
          <SidebarItem>Home</SidebarItem>
          <SidebarItem>Projects</SidebarItem>
          <SidebarItem>Settings</SidebarItem>
        </SidebarSection>
      </SidebarContent>
      <SidebarFooter>
        <Button variant='outline' class='w-full'>
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
`
}

function renderLoginBlock(name: string, context: TemplateContext): string {
  const functionName = `${toPascalCase(name)}Block`
  const title = toTitleCase(name)

  return `import { Button } from '${context.uiImport('button')}'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '${context.uiImport('card')}'
import { Input } from '${context.uiImport('input')}'
import { Label } from '${context.uiImport('label')}'

export function ${functionName}() {
  return (
    <Card class='mx-auto w-full max-w-md'>
      <CardHeader>
        <CardTitle>${title}</CardTitle>
        <CardDescription>Authentication block scaffold from expanded catalog.</CardDescription>
      </CardHeader>
      <CardContent class='grid gap-4'>
        <div class='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' placeholder='you@example.com' required />
        </div>
        <div class='grid gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input id='password' type='password' required />
        </div>
      </CardContent>
      <CardFooter>
        <Button class='w-full'>Continue</Button>
      </CardFooter>
    </Card>
  )
}
`
}

function renderOtpBlock(name: string, context: TemplateContext): string {
  const functionName = `${toPascalCase(name)}Block`
  const title = toTitleCase(name)

  return `import { Button } from '${context.uiImport('button')}'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '${context.uiImport('card')}'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '${context.uiImport('input-otp')}'
import { Label } from '${context.uiImport('label')}'

export function ${functionName}() {
  return (
    <Card class='mx-auto w-full max-w-md'>
      <CardHeader>
        <CardTitle>${title}</CardTitle>
        <CardDescription>Enter the one-time passcode sent to your device.</CardDescription>
      </CardHeader>
      <CardContent class='grid gap-4'>
        <Label>Verification code</Label>
        <InputOTP>
          <InputOTPGroup>
            <InputOTPSlot index={0} total={6} />
            <InputOTPSlot index={1} total={6} />
            <InputOTPSlot index={2} total={6} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} total={6} />
            <InputOTPSlot index={4} total={6} />
            <InputOTPSlot index={5} total={6} />
          </InputOTPGroup>
        </InputOTP>
      </CardContent>
      <CardFooter>
        <Button class='w-full'>Verify</Button>
      </CardFooter>
    </Card>
  )
}
`
}

function renderShowcaseBlock(name: string, context: TemplateContext): string {
  const functionName = `${toPascalCase(name)}Block`

  return `import { Alert, AlertDescription, AlertTitle } from '${context.uiImport('alert')}'
import { Button } from '${context.uiImport('button')}'
import { ButtonGroup } from '${context.uiImport('button-group')}'
import { Kbd } from '${context.uiImport('kbd')}'
import { Spinner } from '${context.uiImport('spinner')}'

export function ${functionName}() {
  return (
    <div class='grid gap-4'>
      <Alert>
        <AlertTitle>Expanded Components</AlertTitle>
        <AlertDescription>This block previews recently added fict-native compatibility components.</AlertDescription>
      </Alert>
      <ButtonGroup>
        <Button>Save</Button>
        <Button variant='outline'>Preview</Button>
        <Button variant='ghost'>Cancel</Button>
      </ButtonGroup>
      <div class='flex items-center gap-3 rounded-md border p-3 text-sm'>
        <Spinner />
        Building UI catalog
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </div>
    </div>
  )
}
`
}

function renderExpandedBlockTemplate(name: string, context: TemplateContext): string {
  const kind = getExpandedBlockKind(name)

  if (kind === 'calendar') return renderCalendarBlock(name, context)
  if (kind === 'chart') return renderChartBlock(name, context)
  if (kind === 'dashboard') return renderDashboardBlock(name, context)
  if (kind === 'sidebar') return renderSidebarBlock(name, context)
  if (kind === 'login') return renderLoginBlock(name, context)
  if (kind === 'otp') return renderOtpBlock(name, context)

  return renderShowcaseBlock(name, context)
}

function createExpandedBlockEntry(name: string): RegistryEntry {
  const kind = getExpandedBlockKind(name)

  return {
    name,
    version: EXPANDED_BLOCK_VERSION,
    type: 'block',
    description: `Expanded ${kind} block template for ${name}`,
    dependencies: [],
    registryDependencies: getExpandedBlockRegistryDependencies(kind),
    files: [
      {
        path: `{{blocksDir}}/${name}.tsx`,
        content: context => renderExpandedBlockTemplate(name, context),
      },
    ],
  }
}

export const expandedBlockRegistry: RegistryEntry[] = expandedBlockNames.map(name => createExpandedBlockEntry(name))

export const expandedThemeRegistry: RegistryEntry[] = [
  {
    name: 'init',
    version: EXPANDED_THEME_VERSION,
    type: 'theme',
    description: 'Expanded built-in base theme tokens for initialization',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{themesDir}}/init.css',
        content: () => `/* Expanded built-in theme tokens for initialization. */
:root {
  --radius: 0.5rem;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
}
`,
      },
    ],
  },
]
