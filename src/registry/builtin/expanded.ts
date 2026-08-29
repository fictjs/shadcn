import type { RegistryEntry, TemplateContext } from '../types'

const EXPANDED_COMPONENT_VERSION = '0.4.0'
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

const alertTemplate: TemplateFn =
  context => `import { cva, type VariantProps } from 'class-variance-authority'

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

const buttonGroupTemplate: TemplateFn =
  context => `import { cva, type VariantProps } from 'class-variance-authority'

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

export function ButtonGroupSeparator(props: JSX.IntrinsicElements['div']) {
  const { class: className, ...rest } = props
  return <div role='separator' class={cn('self-stretch bg-border data-[orientation=vertical]:w-px data-[orientation=horizontal]:h-px', className)} {...rest} />
}
`

const calendarTemplate: TemplateFn = context => `import { createContext, useContext } from 'fict'
import { createSignal } from 'fict/advanced'

import { cn } from '${context.imports.cn}'

type DateLike = Date | string | null | undefined
type MaybeAccessor<T> = T | (() => T)
export type CalendarDateRange = { from?: Date; to?: Date }
type CalendarSelection = Date | CalendarDateRange | null
type CalendarDayModifiers = {
  selected: boolean
  rangeStart: boolean
  rangeMiddle: boolean
  rangeEnd: boolean
  outside: boolean
  disabled: boolean
}

type CalendarProps = {
  class?: string
  value?: MaybeAccessor<DateLike>
  defaultValue?: DateLike
  onValueChange?: (value: Date | null) => void
  mode?: 'single' | 'range'
  selected?: MaybeAccessor<DateLike | CalendarDateRange>
  defaultSelected?: DateLike | CalendarDateRange
  onSelect?: (value: Date | CalendarDateRange | undefined) => void
  month?: MaybeAccessor<DateLike>
  defaultMonth?: DateLike
  onMonthChange?: (month: Date) => void
  locale?: MaybeAccessor<string>
  weekStartsOn?: MaybeAccessor<number>
  showOutsideDays?: MaybeAccessor<boolean>
  numberOfMonths?: number
  captionLayout?: 'label' | 'dropdown'
  showWeekNumber?: boolean
  fixedWeeks?: boolean
  disabled?: ((date: Date) => boolean) | Date[]
  dayContent?: (date: Date, modifiers: CalendarDayModifiers) => unknown
  children?: unknown
  [key: string]: unknown
}

type CalendarContextValue = {
  selection: () => CalendarSelection
  setSelection: (value: Date) => void
  mode: 'single' | 'range'
  month: () => Date
  setMonth: (month: Date) => void
  locale: () => string
  weekStartsOn: () => number
  showOutsideDays: () => boolean
  showWeekNumber: boolean
  captionLayout: 'label' | 'dropdown'
  disabled: (date: Date) => boolean
  dayContent?: (date: Date, modifiers: CalendarDayModifiers) => unknown
}

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

type CalendarGridProps = GenericProps & {
  showOutsideDays?: MaybeAccessor<boolean>
  onDaySelect?: (day: Date, event: MouseEvent) => void
  monthOffset?: number
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

function read<T>(value: MaybeAccessor<T> | undefined, fallback: T): T {
  if (typeof value === 'function') return (value as () => T)()
  return value ?? fallback
}

function toDate(value: DateLike): Date | null {
  if (value === null || value === undefined) return null
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function toSelection(value: DateLike | CalendarDateRange): CalendarSelection {
  if (value && typeof value === 'object' && !(value instanceof Date) && ('from' in value || 'to' in value)) {
    const from = toDate(value.from)
    const to = toDate(value.to)
    return { from: from ? normalizeDate(from) : undefined, to: to ? normalizeDate(to) : undefined }
  }
  const date = toDate(value as DateLike)
  return date ? normalizeDate(date) : null
}

function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function normalizeMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function isSameDay(left: Date | null, right: Date): boolean {
  return Boolean(
    left &&
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate(),
  )
}

function dateTime(date: Date): number {
  return normalizeDate(date).getTime()
}

function isDateDisabled(disabled: CalendarProps['disabled'], date: Date): boolean {
  if (typeof disabled === 'function') return disabled(date)
  return disabled?.some(candidate => isSameDay(candidate, date)) ?? false
}

function selectionModifiers(selection: CalendarSelection, day: Date, outside: boolean, disabled: boolean): CalendarDayModifiers {
  if (selection instanceof Date || selection === null) {
    const selected = isSameDay(selection, day)
    return { selected, rangeStart: false, rangeMiddle: false, rangeEnd: false, outside, disabled }
  }
  const from = selection.from ? normalizeDate(selection.from) : undefined
  const to = selection.to ? normalizeDate(selection.to) : undefined
  const time = dateTime(day)
  const rangeStart = Boolean(from && isSameDay(from, day))
  const rangeEnd = Boolean(to && isSameDay(to, day))
  const rangeMiddle = Boolean(from && to && time > dateTime(from) && time < dateTime(to))
  return { selected: rangeStart || rangeMiddle || rangeEnd, rangeStart, rangeMiddle, rangeEnd, outside, disabled }
}

function isSameMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

function addMonths(month: Date, offset: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + offset, 1)
}

function visibleDays(month: Date, weekStartsOn: number): Date[] {
  const offset = (month.getDay() - weekStartsOn + 7) % 7
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - offset)
  return Array.from({ length: 42 }, (_, index) =>
    normalizeDate(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)),
  )
}

function weekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const elapsedDays = Math.floor((normalizeDate(date).getTime() - normalizeDate(firstDay).getTime()) / 86400000)
  return Math.ceil((elapsedDays + firstDay.getDay() + 1) / 7)
}

function useCalendar(): CalendarContextValue {
  const context = useContext(CalendarContext)
  if (!context) throw new Error('Calendar parts must be used inside Calendar')
  return context
}

export function Calendar(props: CalendarProps) {
  const mode = props.mode ?? 'single'
  const initialSelection = toSelection(props.defaultSelected ?? props.defaultValue)
  const internalSelection = createSignal<CalendarSelection>(initialSelection)
  const internalMonth = createSignal(
    normalizeMonth(
      toDate(props.defaultMonth) ??
      toDate(read(props.month, null)) ??
      (initialSelection instanceof Date ? initialSelection : initialSelection?.from) ??
      new Date(),
    ),
  )

  const currentSelection = () => {
    if (props.selected !== undefined) return toSelection(read(props.selected, null))
    if (props.value !== undefined) return toSelection(read(props.value, null))
    return internalSelection()
  }
  const currentMonth = () => {
    const controlled = props.month === undefined ? null : toDate(read(props.month, null))
    return props.month === undefined ? internalMonth() : normalizeMonth(controlled ?? internalMonth())
  }
  const contextValue: CalendarContextValue = {
    selection: currentSelection,
    setSelection: value => {
      const next = normalizeDate(value)
      if (mode === 'range') {
        const current = currentSelection()
        const range = current && !(current instanceof Date) ? current : {}
        const nextRange = !range.from || range.to
          ? { from: next, to: undefined }
          : dateTime(next) < dateTime(range.from)
            ? { from: next, to: range.from }
            : { from: range.from, to: next }
        if (props.selected === undefined && props.value === undefined) internalSelection(nextRange)
        props.onSelect?.(nextRange)
      } else {
        if (props.selected === undefined && props.value === undefined) internalSelection(next)
        props.onValueChange?.(next)
        props.onSelect?.(next)
      }
    },
    mode,
    month: currentMonth,
    setMonth: value => {
      const next = normalizeMonth(value)
      if (props.month === undefined) internalMonth(next)
      props.onMonthChange?.(next)
    },
    locale: () => read(props.locale, 'en-US'),
    weekStartsOn: () => Math.min(6, Math.max(0, Math.floor(read(props.weekStartsOn, 0)))),
    showOutsideDays: () => read(props.showOutsideDays, true),
    showWeekNumber: props.showWeekNumber ?? false,
    captionLayout: props.captionLayout ?? 'label',
    disabled: date => isDateDisabled(props.disabled, date),
    dayContent: props.dayContent,
  }

  const {
    class: className,
    children,
    value,
    defaultValue,
    onValueChange,
    mode: _mode,
    selected,
    defaultSelected,
    onSelect,
    month,
    defaultMonth,
    onMonthChange,
    locale,
    weekStartsOn,
    showOutsideDays,
    numberOfMonths = 1,
    captionLayout,
    showWeekNumber,
    fixedWeeks,
    disabled,
    dayContent,
    ...rest
  } = props

  return (
    <CalendarContext.Provider value={contextValue}>
      <div data-slot='calendar' class={cn('rounded-lg border p-3', className)} {...rest}>
        {children ?? (
          <div data-slot='calendar-months' class='flex flex-col gap-4 md:flex-row'>
            {Array.from({ length: Math.max(1, numberOfMonths) }, (_, monthOffset) => (
              <section data-slot='calendar-month'>
                <CalendarHeader>
                  {monthOffset === 0 ? <CalendarPrevButton>Previous month</CalendarPrevButton> : <span />}
                  <CalendarTitle monthOffset={monthOffset} />
                  {monthOffset === Math.max(1, numberOfMonths) - 1 ? <CalendarNextButton>Next month</CalendarNextButton> : <span />}
                </CalendarHeader>
                <CalendarGrid monthOffset={monthOffset} />
              </section>
            ))}
          </div>
        )}
      </div>
    </CalendarContext.Provider>
  )
}

export function CalendarHeader(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div data-slot='calendar-header' class={cn('mb-3 flex items-center justify-between gap-2', className)} {...rest} />
}

export function CalendarTitle(props: GenericProps) {
  const context = useCalendar()
  const { class: className, children, monthOffset = 0, ...rest } = props
  const visibleMonth = () => addMonths(context.month(), Number(monthOffset))
  if (context.captionLayout === 'dropdown') {
    return () => {
      const month = visibleMonth()
      return (
        <span data-slot='calendar-title' class={cn('flex items-center gap-1 text-sm font-medium', className)} {...rest}>
          <select
            aria-label='Choose the Month'
            value={String(month.getMonth())}
            onChange={(event: Event) => context.setMonth(new Date(month.getFullYear(), Number((event.currentTarget as HTMLSelectElement).value) - Number(monthOffset), 1))}
          >
            {Array.from({ length: 12 }, (_, index) => <option value={String(index)}>{new Intl.DateTimeFormat(context.locale(), { month: 'short' }).format(new Date(2026, index, 1))}</option>)}
          </select>
          <select
            aria-label='Choose the Year'
            value={String(month.getFullYear())}
            onChange={(event: Event) => context.setMonth(new Date(Number((event.currentTarget as HTMLSelectElement).value), month.getMonth() - Number(monthOffset), 1))}
          >
            {Array.from({ length: 201 }, (_, index) => month.getFullYear() - 100 + index).map(year => <option value={String(year)}>{year}</option>)}
          </select>
        </span>
      )
    }
  }
  return (
    <span data-slot='calendar-title' class={cn('text-sm font-medium', className)} {...rest}>
      {children ?? (() => new Intl.DateTimeFormat(context.locale(), { month: 'long', year: 'numeric' }).format(visibleMonth()))}
    </span>
  )
}

export function CalendarPrevButton(props: GenericProps) {
  const context = useCalendar()
  const { class: className, children, onClick, ...rest } = props
  return (
    <button
      type='button'
      aria-label='Previous month'
      data-slot='calendar-prev'
      class={cn('rounded-md border px-2 py-1 text-xs hover:bg-accent', className)}
      onClick={(event: MouseEvent) => {
        ;(onClick as ((event: MouseEvent) => void) | undefined)?.(event)
        if (!event.defaultPrevented) context.setMonth(addMonths(context.month(), -1))
      }}
      {...rest}
    >
      {children ?? '‹'}
    </button>
  )
}

export function CalendarNextButton(props: GenericProps) {
  const context = useCalendar()
  const { class: className, children, onClick, ...rest } = props
  return (
    <button
      type='button'
      aria-label='Next month'
      data-slot='calendar-next'
      class={cn('rounded-md border px-2 py-1 text-xs hover:bg-accent', className)}
      onClick={(event: MouseEvent) => {
        ;(onClick as ((event: MouseEvent) => void) | undefined)?.(event)
        if (!event.defaultPrevented) context.setMonth(addMonths(context.month(), 1))
      }}
      {...rest}
    >
      {children ?? '›'}
    </button>
  )
}

export function CalendarGrid(props: CalendarGridProps) {
  const context = useCalendar()
  const { class: className, children, showOutsideDays, onDaySelect, monthOffset = 0, ...rest } = props
  return () => {
    if (children) {
      return <div role='grid' data-slot='calendar-grid' class={cn('grid grid-cols-7 gap-1', className)} {...rest}>{children}</div>
    }

    const month = addMonths(context.month(), monthOffset)
    const weekStartsOn = context.weekStartsOn()
    const labels = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2026, 0, 4 + ((weekStartsOn + index) % 7))
      return new Intl.DateTimeFormat(context.locale(), { weekday: 'short' }).format(date)
    })

    return (
      <div role='grid' data-slot='calendar-grid' class={cn('grid gap-1', context.showWeekNumber ? 'grid-cols-8' : 'grid-cols-7', className)} {...rest}>
        {context.showWeekNumber ? <span role='columnheader' class='py-1 text-center text-xs text-muted-foreground'>#</span> : null}
        {labels.map(label => (
          <span role='columnheader' class='py-1 text-center text-xs text-muted-foreground'>{label}</span>
        ))}
        {visibleDays(month, weekStartsOn).map((day, index) => {
          const outside = !isSameMonth(day, month)
          const hidden = !read(showOutsideDays, context.showOutsideDays()) && outside
          const dayDisabled = context.disabled(day)
          const modifiers = selectionModifiers(context.selection(), day, outside, dayDisabled)

          return hidden ? (
            <>{context.showWeekNumber && index % 7 === 0 ? <span aria-hidden='true' /> : null}<span aria-hidden='true' /></>
          ) : (
            <>
              {context.showWeekNumber && index % 7 === 0 ? <span data-slot='calendar-week-number' class='flex h-8 items-center justify-center text-xs text-muted-foreground'>{weekNumber(day)}</span> : null}
              <button
                type='button'
                role='gridcell'
                aria-selected={modifiers.selected}
                disabled={dayDisabled}
                data-state={modifiers.selected ? 'selected' : 'idle'}
                data-range-start={modifiers.rangeStart ? 'true' : undefined}
                data-range-middle={modifiers.rangeMiddle ? 'true' : undefined}
                data-range-end={modifiers.rangeEnd ? 'true' : undefined}
                data-outside-month={outside ? 'true' : undefined}
                class={cn(
                  'flex h-8 flex-col items-center justify-center rounded-md text-sm hover:bg-accent disabled:pointer-events-none disabled:opacity-40',
                  modifiers.selected && 'bg-primary text-primary-foreground hover:bg-primary',
                  modifiers.rangeMiddle && 'rounded-none bg-accent text-accent-foreground hover:bg-accent',
                  outside && 'text-muted-foreground opacity-60',
                )}
                onClick={(event: MouseEvent) => {
                  onDaySelect?.(day, event)
                  if (event.defaultPrevented || dayDisabled) return
                  context.setSelection(day)
                  context.setMonth(day)
                }}
              >
                {context.dayContent?.(day, modifiers) ?? String(day.getDate())}
              </button>
            </>
          )
        })}
      </div>
    )
  }
}
`

const carouselTemplate: TemplateFn = context => `import { onDestroy, onMount } from 'fict'

import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type ButtonProps = JSX.IntrinsicElements['button']

export interface CarouselApi {
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  selectedScrollSnap: () => number
  scrollSnapList: () => number[]
  canScrollPrev: () => boolean
  canScrollNext: () => boolean
  on: (event: 'select', listener: (api: CarouselApi) => void) => () => void
}

type CarouselProps = DivProps & {
  orientation?: 'horizontal' | 'vertical'
  opts?: { align?: 'start' | 'center' | 'end'; direction?: 'ltr' | 'rtl'; loop?: boolean }
  setApi?: (api: CarouselApi) => void
  onSlideChange?: (index: number, count: number) => void
  autoplayMs?: number
  stopOnInteraction?: boolean
}

function carouselRoot(start: EventTarget | null): HTMLElement | null {
  return start instanceof HTMLElement ? start.closest('[data-slot="carousel"]') as HTMLElement | null : null
}

function carouselItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-slot="carousel-item"]'))
}

function carouselIndex(root: HTMLElement): number {
  return Number(root.dataset.carouselIndex ?? 0)
}

function selectCarousel(root: HTMLElement, requestedIndex: number): void {
  const items = carouselItems(root)
  const count = items.length
  if (!count) return
  const loop = root.dataset.loop === 'true'
  const index = loop ? (requestedIndex + count) % count : Math.max(0, Math.min(requestedIndex, count - 1))
  const track = root.querySelector<HTMLElement>('[data-slot="carousel-content"]')
  const item = items[index]
  if (track && item) {
    const orientation = root.dataset.orientation === 'vertical' ? 'vertical' : 'horizontal'
    track.scrollTo({
      left: orientation === 'horizontal' ? item.offsetLeft : 0,
      top: orientation === 'vertical' ? item.offsetTop : 0,
      behavior: 'smooth',
    })
  }
  root.dataset.carouselIndex = String(index)
  root.dataset.carouselCount = String(count)
  root.dispatchEvent(new CustomEvent('carousel:select', { detail: { index, count } }))
}

function createCarouselApi(root: HTMLElement): CarouselApi {
  const listeners = new Set<(api: CarouselApi) => void>()
  const api: CarouselApi = {
    scrollPrev: () => selectCarousel(root, carouselIndex(root) - 1),
    scrollNext: () => selectCarousel(root, carouselIndex(root) + 1),
    scrollTo: index => selectCarousel(root, index),
    selectedScrollSnap: () => carouselIndex(root),
    scrollSnapList: () => carouselItems(root).map((_, index) => index),
    canScrollPrev: () => root.dataset.loop === 'true' || carouselIndex(root) > 0,
    canScrollNext: () => root.dataset.loop === 'true' || carouselIndex(root) < carouselItems(root).length - 1,
    on: (event, listener) => {
      if (event === 'select') listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
  root.addEventListener('carousel:select', () => listeners.forEach(listener => listener(api)))
  return api
}

export function Carousel(props: CarouselProps) {
  let root: HTMLElement | null = null
  let timer: number | undefined
  let api: CarouselApi | undefined
  const {
    class: className,
    orientation = 'horizontal',
    opts,
    setApi,
    onSlideChange,
    autoplayMs,
    stopOnInteraction = true,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    ...rest
  } = props

  const stopAutoplay = () => {
    if (timer !== undefined) window.clearInterval(timer)
    timer = undefined
  }
  const startAutoplay = () => {
    stopAutoplay()
    if (autoplayMs && autoplayMs > 0 && api) timer = window.setInterval(api.scrollNext, autoplayMs)
  }

  onMount(() => {
    if (!root) return
    api = createCarouselApi(root)
    root.dataset.carouselCount = String(carouselItems(root).length)
    setApi?.(api)
    const onSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ index: number; count: number }>).detail
      onSlideChange?.(detail.index, detail.count)
      if (stopOnInteraction) startAutoplay()
    }
    root.addEventListener('carousel:select', onSelect)
    startAutoplay()
    return () => root?.removeEventListener('carousel:select', onSelect)
  })
  onDestroy(stopAutoplay)

  return (
    <div
      ref={node => { root = node }}
      data-slot='carousel'
      data-orientation={orientation}
      data-loop={opts?.loop ? 'true' : 'false'}
      data-align={opts?.align ?? 'start'}
      data-carousel-index='0'
      dir={opts?.direction}
      role='region'
      aria-roledescription='carousel'
      tabIndex={0}
      class={cn('group/carousel relative w-full', className)}
      onKeyDown={(event: KeyboardEvent) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || !api) return
        const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
        const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
        if (event.key === previousKey) api.scrollPrev()
        else if (event.key === nextKey) api.scrollNext()
        else if (event.key === 'Home') api.scrollTo(0)
        else if (event.key === 'End') api.scrollTo(api.scrollSnapList().length - 1)
      }}
      onMouseEnter={(event: MouseEvent) => { onMouseEnter?.(event); if (stopOnInteraction) stopAutoplay() }}
      onMouseLeave={(event: MouseEvent) => { onMouseLeave?.(event); if (stopOnInteraction) startAutoplay() }}
      {...rest}
    />
  )
}

export function CarouselContent(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='carousel-content' class={cn('flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden group-data-[orientation=vertical]/carousel:h-full group-data-[orientation=vertical]/carousel:flex-col group-data-[orientation=vertical]/carousel:snap-y group-data-[orientation=vertical]/carousel:overflow-x-hidden group-data-[orientation=vertical]/carousel:overflow-y-auto', className)} {...rest} />
}

export function CarouselItem(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='carousel-item' role='group' aria-roledescription='slide' class={cn('min-w-0 shrink-0 grow-0 basis-full snap-center', className)} {...rest} />
}

function carouselButton(props: ButtonProps, direction: -1 | 1) {
  const { class: className, onClick, children, ...rest } = props
  const previous = direction === -1
  return (
    <button
      type='button'
      aria-label={previous ? 'Previous slide' : 'Next slide'}
      class={cn(
        'absolute top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background px-3 py-2 text-sm shadow-sm',
        previous ? 'left-2' : 'right-2',
        'group-data-[orientation=vertical]/carousel:left-1/2 group-data-[orientation=vertical]/carousel:right-auto group-data-[orientation=vertical]/carousel:-translate-x-1/2',
        previous ? 'group-data-[orientation=vertical]/carousel:top-2' : 'group-data-[orientation=vertical]/carousel:bottom-2 group-data-[orientation=vertical]/carousel:top-auto',
        className,
      )}
      onClick={(event: MouseEvent) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        const root = carouselRoot(event.currentTarget)
        if (root) selectCarousel(root, carouselIndex(root) + direction)
      }}
      {...rest}
    >
      {children ?? (previous ? '‹' : '›')}
    </button>
  )
}

export function CarouselPrevious(props: ButtonProps) {
  return carouselButton(props, -1)
}

export function CarouselNext(props: ButtonProps) {
  return carouselButton(props, 1)
}
`

const chartTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

export interface ChartPoint {
  label: string
  value: number
  secondaryValue?: number
}

export interface ChartLegendItem {
  label: string
  colorClass?: string
}

type DivProps = JSX.IntrinsicElements['div']

type SparklineProps = {
  data: ChartPoint[] | (() => ChartPoint[])
  class?: string
  dir?: 'ltr' | 'rtl'
  showGrid?: boolean
  showAxis?: boolean
  showTooltip?: boolean
  primaryLabel?: string
  secondaryLabel?: string
}

type LegendProps = DivProps & {
  items: ChartLegendItem[]
}

type TooltipContentProps = DivProps & {
  label?: string
  items: Array<{ label: string; value: string | number; colorClass?: string }>
}

function readData(data: SparklineProps['data']): ChartPoint[] {
  return typeof data === 'function' ? data() : data
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
  return () => {
    const data = readData(props.data)
    const max = maxValue(data.flatMap(point => [point, { ...point, value: point.secondaryValue ?? 0 }]))
    return (
      <div data-slot='bar-sparkline' class={cn('relative flex h-40 items-end gap-2', props.showGrid && 'bg-[linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:100%_25%]', props.class)} dir={props.dir}>
        {data.map(point => (
          <div class='group relative flex h-full flex-1 items-end justify-center gap-1' title={props.showTooltip ? point.label + ': ' + (props.primaryLabel ?? 'Value') + ' ' + String(point.value) + (point.secondaryValue === undefined ? '' : ', ' + (props.secondaryLabel ?? 'Secondary') + ' ' + String(point.secondaryValue)) : undefined}>
            <div class='w-full max-w-8 rounded-t-sm bg-primary transition-[height]' style={{ height: String(Math.max((point.value / max) * 128, 4)) + 'px' }} />
            {point.secondaryValue === undefined ? null : <div class='w-full max-w-8 rounded-t-sm bg-primary/45 transition-[height]' style={{ height: String(Math.max((point.secondaryValue / max) * 128, 4)) + 'px' }} />}
            {props.showAxis ? <span class='absolute -bottom-6 text-xs text-muted-foreground'>{point.label}</span> : null}
          </div>
        ))}
      </div>
    )
  }
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

export function ChartTooltipContent(props: TooltipContentProps) {
  const { class: className, label, items, ...rest } = props
  return (
    <div role='tooltip' class={cn('grid min-w-32 gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs shadow-xl', className)} {...rest}>
      {label ? <strong>{label}</strong> : null}
      {items.map(item => <span class='flex items-center justify-between gap-4'><span class='inline-flex items-center gap-2'><i class={cn('h-2 w-2 rounded-sm bg-primary', item.colorClass)} />{item.label}</span><b>{item.value}</b></span>)}
    </div>
  )
}
`

const commandTemplate: TemplateFn =
  context => `import { createContext, onDestroy, onMount, useContext } from 'fict'
import { createSignal } from 'fict/advanced'

import { cn } from '${context.imports.cn}'

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

type MaybeAccessor<T> = T | (() => T)

type CommandProps = GenericProps & {
  value?: MaybeAccessor<string>
  defaultValue?: string
  onValueChange?: (value: string) => void
  query?: MaybeAccessor<string>
  defaultQuery?: string
  onQueryChange?: (query: string) => void
}

type CommandItemProps = GenericProps & {
  value?: string
  keywords?: string[]
  keepOpen?: boolean
  onSelect?: (value: string, event: MouseEvent) => void
}

type CommandRecord = {
  value: string
  text: string
  keywords: string[]
}

type CommandContextValue = {
  value: () => string
  setValue: (value: string) => void
  query: () => string
  setQuery: (query: string) => void
  open: () => boolean
  setOpen: (open: boolean) => void
  register: (record: CommandRecord) => () => void
  matches: (record: CommandRecord) => boolean
  hasMatches: () => boolean
}

const CommandContext = createContext<CommandContextValue | null>(null)

function read<T>(value: MaybeAccessor<T> | undefined, fallback: T): T {
  if (typeof value === 'function') return (value as () => T)()
  return value ?? fallback
}

function matchesQuery(query: string, record: CommandRecord): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return [record.value, record.text, ...record.keywords].join(' ').toLowerCase().includes(normalized)
}

function useCommand(): CommandContextValue {
  const context = useContext(CommandContext)
  if (!context) throw new Error('Command parts must be used inside Command')
  return context
}

export function Command(props: CommandProps) {
  const internalValue = createSignal(props.defaultValue ?? '')
  const internalQuery = createSignal(props.defaultQuery ?? '')
  const open = createSignal(false)
  const records = createSignal<CommandRecord[]>([])

  const contextValue: CommandContextValue = {
    value: () => read(props.value, internalValue()),
    setValue: value => {
      if (props.value === undefined) internalValue(value)
      props.onValueChange?.(value)
    },
    query: () => read(props.query, internalQuery()),
    setQuery: query => {
      if (props.query === undefined) internalQuery(query)
      props.onQueryChange?.(query)
    },
    open,
    setOpen: value => {
      open(value)
    },
    register: record => {
      records([...records(), record])
      return () => {
        records(records().filter(item => item !== record))
      }
    },
    matches: record => matchesQuery(read(props.query, internalQuery()), record),
    hasMatches: () =>
      records().some(record => matchesQuery(read(props.query, internalQuery()), record)),
  }

  const {
    class: className,
    children,
    value,
    defaultValue,
    onValueChange,
    query,
    defaultQuery,
    onQueryChange,
    ...rest
  } = props

  return (
    <CommandContext.Provider value={contextValue}>
      <div data-slot='command' class={cn('flex flex-col overflow-hidden bg-popover text-popover-foreground', className)} {...rest}>
        {children}
      </div>
    </CommandContext.Provider>
  )
}

export function CommandDialog(props: GenericProps) {
  const context = useCommand()
  const { class: className, onKeyDown, ...rest } = props
  return () => context.open() ? (
    <div
      role='dialog'
      aria-modal='true'
      data-slot='command-dialog'
      class={cn('overflow-hidden rounded-lg border bg-popover shadow-md', className)}
      onKeyDown={(event: KeyboardEvent) => {
        ;(onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event)
        if (!event.defaultPrevented && event.key === 'Escape') context.setOpen(false)
      }}
      {...rest}
    />
  ) : null
}

export function CommandTrigger(props: GenericProps) {
  const context = useCommand()
  const { onClick, ...rest } = props
  return (
    <button
      type='button'
      aria-haspopup='dialog'
      aria-expanded={() => context.open()}
      onClick={(event: MouseEvent) => {
        ;(onClick as ((event: MouseEvent) => void) | undefined)?.(event)
        if (!event.defaultPrevented) context.setOpen(true)
      }}
      {...rest}
    />
  )
}

export function CommandClose(props: GenericProps) {
  const context = useCommand()
  const { onClick, ...rest } = props
  return (
    <button
      type='button'
      onClick={(event: MouseEvent) => {
        ;(onClick as ((event: MouseEvent) => void) | undefined)?.(event)
        if (!event.defaultPrevented) context.setOpen(false)
      }}
      {...rest}
    />
  )
}

export function CommandInput(props: GenericProps) {
  const context = useCommand()
  const { class: className, onInput, ...rest } = props
  return (
    <input
      type='text'
      role='combobox'
      aria-autocomplete='list'
      value={() => context.query()}
      data-slot='command-input'
      class={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground', className)}
      onInput={(event: Event) => {
        ;(onInput as ((event: Event) => void) | undefined)?.(event)
        if (!event.defaultPrevented) context.setQuery((event.currentTarget as HTMLInputElement).value)
      }}
      {...rest}
    />
  )
}

export function CommandList(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div role='listbox' data-slot='command-list' class={cn('max-h-80 overflow-y-auto p-1', className)} {...rest} />
}

export function CommandItem(props: CommandItemProps) {
  const context = useCommand()
  const { class: className, children, value = String(children ?? ''), keywords = [], keepOpen, onSelect, onClick, ...rest } = props
  const record: CommandRecord = {
    value,
    text: typeof children === 'string' ? children : value,
    keywords,
  }

  let unregister: (() => void) | undefined
  onMount(() => {
    unregister = context.register(record)
  })
  onDestroy(() => unregister?.())

  return () =>
    context.matches(record) ? (
      <button
        type='button'
        role='option'
        aria-selected={() => context.value() === value}
        data-slot='command-item'
        data-state={() => (context.value() === value ? 'selected' : 'idle')}
        class={cn('flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none data-[state=selected]:bg-accent data-[state=selected]:text-accent-foreground', className)}
        onClick={(event: MouseEvent) => {
          ;(onClick as ((event: MouseEvent) => void) | undefined)?.(event)
          onSelect?.(value, event)
          if (event.defaultPrevented) return
          context.setValue(value)
          if (!keepOpen) context.setOpen(false)
        }}
        {...rest}
      >
        {children}
      </button>
    ) : null
}

export function CommandGroup(props: GenericProps) {
  const { class: className, children, heading, ...rest } = props
  return (
    <div role='group' data-slot='command-group' class={cn('overflow-hidden p-1 text-foreground', className)} {...rest}>
      {heading ? <div data-slot='command-group-heading' class='px-2 py-1.5 text-xs font-medium text-muted-foreground'>{heading}</div> : null}
      {children}
    </div>
  )
}

export function CommandSeparator(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div role='separator' data-slot='command-separator' class={cn('my-1 h-px bg-border', className)} {...rest} />
}

export function CommandEmpty(props: GenericProps) {
  const context = useCommand()
  const { class: className, ...rest } = props
  return () =>
    context.hasMatches() ? null : (
      <div data-slot='command-empty' class={cn('py-6 text-center text-sm text-muted-foreground', className)} {...rest} />
    )
}

export function CommandContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div data-slot='command-content' class={cn('overflow-hidden rounded-lg border bg-popover shadow-md', className)} {...rest} />
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

const drawerTemplate: TemplateFn = context => `import { createContext, useContext } from 'fict'

import { cn } from '${context.imports.cn}'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '${context.uiImport('sheet')}'

type DrawerDirection = 'top' | 'right' | 'bottom' | 'left'
type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}
type DrawerProps = GenericProps & { direction?: DrawerDirection }

const DrawerDirectionContext = createContext<DrawerDirection>('bottom')

export function Drawer(props: DrawerProps) {
  const { direction = 'bottom', children, ...rest } = props
  return (
    <DrawerDirectionContext.Provider value={direction}>
      <Sheet {...rest}>{children}</Sheet>
    </DrawerDirectionContext.Provider>
  )
}

export const DrawerClose = SheetClose
export const DrawerDescription = SheetDescription
export const DrawerFooter = SheetFooter
export const DrawerHeader = SheetHeader
export const DrawerTitle = SheetTitle
export const DrawerTrigger = SheetTrigger

export function DrawerContent(props: GenericProps) {
  const direction = useContext(DrawerDirectionContext)
  const { class: className, children, ...rest } = props
  return (
    <SheetContent
      side={direction}
      data-slot='drawer-content'
      data-drawer-direction={direction}
      class={cn(
        'flex h-auto flex-col text-sm',
        direction === 'bottom' && 'mt-24 max-h-[80vh] rounded-t-xl',
        direction === 'top' && 'mb-24 max-h-[80vh] rounded-b-xl',
        direction === 'left' && 'w-3/4 rounded-r-xl sm:max-w-sm',
        direction === 'right' && 'w-3/4 rounded-l-xl sm:max-w-sm',
        className,
      )}
      {...rest}
    >
      {(direction === 'bottom' || direction === 'top') ? <div class='mx-auto mt-4 h-1 w-[100px] shrink-0 rounded-full bg-muted' aria-hidden='true' /> : null}
      {children}
    </SheetContent>
  )
}
`

const emptyTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type HeadingProps = JSX.IntrinsicElements['h3']
type ParagraphProps = JSX.IntrinsicElements['p']

export function Empty(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='empty' class={cn('flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center', className)} {...rest} />
}

export function EmptyHeader(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='empty-header' class={cn('flex max-w-sm flex-col items-center gap-2', className)} {...rest} />
}

export function EmptyMedia(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='empty-media' class={cn('mb-2 flex size-12 items-center justify-center rounded-full bg-muted [&_svg]:size-6', className)} {...rest} />
}

export function EmptyTitle(props: HeadingProps) {
  const { class: className, ...rest } = props
  return <h3 data-slot='empty-title' class={cn('text-lg font-semibold', className)} {...rest} />
}

export function EmptyDescription(props: ParagraphProps) {
  const { class: className, ...rest } = props
  return <p data-slot='empty-description' class={cn('max-w-prose text-sm text-muted-foreground', className)} {...rest} />
}

export function EmptyAction(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='empty-action' class={cn('mt-4 flex items-center justify-center gap-2', className)} {...rest} />
}

export function EmptyContent(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='empty-content' class={cn('mt-4 flex w-full max-w-sm flex-col items-center gap-2', className)} {...rest} />
}
`

const fieldTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'
import { Label } from '${context.uiImport('label')}'

type DivProps = JSX.IntrinsicElements['div']
type ParagraphProps = JSX.IntrinsicElements['p']
type FieldsetProps = JSX.IntrinsicElements['fieldset']
type LegendProps = JSX.IntrinsicElements['legend']

export function Field(props: DivProps & { orientation?: 'vertical' | 'horizontal' | 'responsive' }) {
  const { class: className, orientation = 'vertical', ...rest } = props
  return <div data-slot='field' data-orientation={orientation} class={cn('grid gap-2', orientation === 'horizontal' && 'grid-cols-[auto_1fr] items-center', orientation === 'responsive' && 'grid-cols-1 sm:grid-cols-[1fr_2fr] sm:items-center', className)} {...rest} />
}

export function FieldLabel(props: JSX.IntrinsicElements['label']) {
  return <Label {...props} />
}

export function FieldControl(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='field-control' class={cn('grid gap-1', className)} {...rest} />
}

export function FieldDescription(props: ParagraphProps) {
  const { class: className, ...rest } = props
  return <p class={cn('text-xs text-muted-foreground', className)} {...rest} />
}

export function FieldError(props: ParagraphProps) {
  const { class: className, ...rest } = props
  return <p class={cn('text-xs font-medium text-destructive', className)} {...rest} />
}

export function FieldSet(props: FieldsetProps) {
  const { class: className, ...rest } = props
  return <fieldset data-slot='field-set' class={cn('grid gap-4', className)} {...rest} />
}

export function FieldLegend(props: LegendProps & { variant?: 'legend' | 'label' }) {
  const { class: className, variant = 'legend', ...rest } = props
  return <legend data-slot='field-legend' data-variant={variant} class={cn(variant === 'legend' ? 'text-base font-semibold' : 'text-sm font-medium', className)} {...rest} />
}

export function FieldGroup(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='field-group' class={cn('grid gap-4', className)} {...rest} />
}

export function FieldContent(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='field-content' class={cn('grid gap-1', className)} {...rest} />
}

export function FieldSeparator(props: DivProps) {
  const { class: className, children, ...rest } = props
  return <div role='separator' data-slot='field-separator' class={cn('relative my-2 h-px bg-border', className)} {...rest}>{children}</div>
}
`

const inputGroupTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'
import { Button } from '${context.uiImport('button')}'
import { Input } from '${context.uiImport('input')}'
import { Textarea } from '${context.uiImport('textarea')}'

type DivProps = JSX.IntrinsicElements['div']
type SpanProps = JSX.IntrinsicElements['span']
type AddonProps = SpanProps & { align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end' }

type InputGroupInputProps = {
  class?: string
  [key: string]: unknown
}

export function InputGroup(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex w-full items-stretch rounded-md border border-input bg-background', className)} {...rest} />
}

export function InputGroupAddon(props: AddonProps) {
  const { class: className, align = 'inline-start', ...rest } = props
  return <span data-slot='input-group-addon' data-align={align} class={cn('inline-flex items-center gap-2 px-2 text-sm text-muted-foreground', align === 'inline-end' && 'order-last', align.startsWith('block-') && 'w-full', className)} {...rest} />
}

export function InputGroupInput(props: InputGroupInputProps) {
  const { class: className, ...rest } = props
  return <Input class={cn('rounded-none border-0 shadow-none focus-visible:ring-0', className)} {...rest} />
}

export function InputGroupButton(props: InputGroupInputProps) {
  const { class: className, ...rest } = props
  return <Button type='button' variant='ghost' size='xs' class={cn('shadow-none', className)} {...rest} />
}

export function InputGroupText(props: SpanProps) {
  const { class: className, ...rest } = props
  return <span class={cn('flex items-center gap-2 text-sm text-muted-foreground', className)} {...rest} />
}

export function InputGroupTextarea(props: InputGroupInputProps) {
  const { class: className, ...rest } = props
  return <Textarea data-slot='input-group-control' class={cn('flex-1 resize-none rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0', className)} {...rest} />
}
`

const inputOtpTemplate: TemplateFn = context => `import { createContext, useContext } from 'fict'
import { createSignal } from 'fict/advanced'

import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type MaybeAccessor<T> = T | (() => T)

type InputOTPProps = DivProps & {
  value?: MaybeAccessor<string>
  defaultValue?: string
  onValueChange?: (value: string) => void
  maxLength?: number
  pattern?: RegExp
  disabled?: boolean
  required?: boolean
}

type SlotProps = JSX.IntrinsicElements['input'] & {
  index: number
  total?: number
}

type InputOTPContextValue = {
  value: () => string
  update: (index: number, character: string) => void
  maxLength: number
  pattern?: RegExp
  disabled: boolean
  required: boolean
}

const InputOTPContext = createContext<InputOTPContextValue | null>(null)

function read<T>(value: MaybeAccessor<T> | undefined, fallback: T): T {
  if (typeof value === 'function') return (value as () => T)()
  return value ?? fallback
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

export function InputOTP(props: InputOTPProps) {
  const internalValue = createSignal((props.defaultValue ?? '').slice(0, props.maxLength ?? 6))
  const maxLength = props.maxLength ?? 6
  const value = () => read(props.value, internalValue()).slice(0, maxLength)
  const update = (index: number, character: string) => {
    const nextCharacter = [...character].find(candidate => !props.pattern || props.pattern.test(candidate)) ?? ''
    const characters = value().padEnd(maxLength, ' ').split('')
    characters[index] = nextCharacter || ' '
    const next = characters.join('').trimEnd()
    if (props.value === undefined) internalValue(next)
    props.onValueChange?.(next)
  }
  const { class: className, children, value: _value, defaultValue, onValueChange, maxLength: _maxLength, pattern, disabled, required, ...rest } = props
  return (
    <InputOTPContext.Provider value={{ value, update, maxLength, pattern, disabled: disabled ?? false, required: required ?? false }}>
      <div data-slot='input-otp' class={cn('flex items-center gap-2', disabled && 'opacity-50', className)} {...rest}>{children}</div>
    </InputOTPContext.Provider>
  )
}

export function InputOTPGroup(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='input-otp-group' class={cn('flex items-center gap-2', className)} {...rest} />
}

export function InputOTPSlot(props: SlotProps) {
  const context = useContext(InputOTPContext)
  if (!context) throw new Error('InputOTPSlot must be used inside InputOTP')
  const { class: className, index, total = context.maxLength, onInput, onKeyDown, disabled, ...rest } = props

  return (
    <input
      inputMode={context.pattern?.test('a') ? 'text' : 'numeric'}
      maxLength={1}
      autoComplete='one-time-code'
      data-otp-index={index}
      data-slot='input-otp-slot'
      value={() => context.value()[index] ?? ''}
      disabled={context.disabled || disabled}
      required={context.required}
      class={cn('h-10 w-10 rounded-md border border-input bg-background text-center text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring', className)}
      onInput={(event: Event) => {
        onInput?.(event)
        const target = event.currentTarget as HTMLInputElement | null
        if (!target) return
        context.update(index, target.value.slice(-1))
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
          context.update(index, '')
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

const itemTemplate: TemplateFn = context => `import { Slot } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type HeadingProps = JSX.IntrinsicElements['h4']
type ParagraphProps = JSX.IntrinsicElements['p']

type ItemProps = DivProps & {
  variant?: 'default' | 'outline' | 'muted'
  size?: 'default' | 'sm' | 'xs'
  asChild?: boolean
}

export function Item(props: ItemProps) {
  const { class: className, variant = 'default', size = 'default', asChild, ...rest } = props
  const classValue = cn(
    'flex items-start gap-3 rounded-lg',
    variant === 'outline' && 'border',
    variant === 'muted' && 'bg-muted',
    size === 'default' && 'p-4',
    size === 'sm' && 'p-3',
    size === 'xs' && 'gap-2 p-2',
    className,
  )
  if (asChild) return <Slot.Root data-slot='item' data-variant={variant} data-size={size} class={classValue} {...rest} />
  return <div data-slot='item' data-variant={variant} data-size={size} class={classValue} {...rest} />
}

export function ItemLeading(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='item-media' class={cn('mt-0.5 shrink-0 text-muted-foreground', className)} {...rest} />
}

export const ItemMedia = ItemLeading

export function ItemContent(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='item-content' class={cn('grid min-w-0 gap-1', className)} {...rest} />
}

export function ItemTitle(props: HeadingProps) {
  const { class: className, ...rest } = props
  return <h4 data-slot='item-title' class={cn('truncate text-sm font-medium', className)} {...rest} />
}

export function ItemDescription(props: ParagraphProps) {
  const { class: className, ...rest } = props
  return <p data-slot='item-description' class={cn('text-sm text-muted-foreground', className)} {...rest} />
}

export function ItemTrailing(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='item-actions' class={cn('ml-auto shrink-0', className)} {...rest} />
}

export const ItemActions = ItemTrailing

export function ItemGroup(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='item-group' class={cn('grid gap-2', className)} {...rest} />
}

export function ItemHeader(props: DivProps) {
  const { class: className, ...rest } = props
  return <div data-slot='item-header' class={cn('overflow-hidden rounded-t-lg', className)} {...rest} />
}
`

const kbdTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type KbdProps = JSX.IntrinsicElements['kbd']

export function Kbd(props: KbdProps) {
  const { class: className, ...rest } = props
  return <kbd data-slot='kbd' class={cn('inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-xs font-medium text-muted-foreground', className)} {...rest} />
}

export function KbdGroup(props: KbdProps) {
  const { class: className, ...rest } = props
  return <kbd data-slot='kbd-group' class={cn('inline-flex items-center gap-1', className)} {...rest} />
}
`

const nativeSelectTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type SelectProps = Omit<JSX.IntrinsicElements['select'], 'size'> & { size?: 'default' | 'sm' }
type OptionProps = JSX.IntrinsicElements['option']
type OptGroupProps = JSX.IntrinsicElements['optgroup']

export function NativeSelect(props: SelectProps) {
  const { class: className, size = 'default', ...rest } = props
  return (
    <div class={cn('group/native-select relative w-fit has-[select:disabled]:opacity-50', className)} data-slot='native-select-wrapper' data-size={size}>
      <select
        data-slot='native-select'
        data-size={size}
        class={cn(
          'h-8 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent py-1 pl-2.5 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=sm]:h-7 rtl:pl-8 rtl:pr-2.5',
        )}
        {...rest}
      />
      <svg data-slot='native-select-icon' class='pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:left-2.5 rtl:right-auto' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' aria-hidden='true'><path d='m6 9 6 6 6-6' /></svg>
    </div>
  )
}

export function NativeSelectOption(props: OptionProps) {
  return <option data-slot='native-select-option' {...props} />
}

export function NativeSelectOptGroup(props: OptGroupProps) {
  return <optgroup data-slot='native-select-optgroup' {...props} />
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

const resizableTemplate: TemplateFn = context => `import { cn } from '${context.imports.cn}'

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function readPanelLimit(panel: HTMLElement, name: 'minSize' | 'maxSize', fallback: number): number {
  const value = Number(panel.dataset[name])
  return Number.isFinite(value) ? value : fallback
}

function beginResize(event: PointerEvent): void {
  const handle = event.currentTarget as HTMLElement
  const group = handle.closest('[data-slot="resizable-panel-group"]') as HTMLElement | null
  const previous = handle.previousElementSibling as HTMLElement | null
  const next = handle.nextElementSibling as HTMLElement | null
  if (!group || !previous || !next) return

  const horizontal = group.dataset.direction !== 'vertical'
  const groupRect = group.getBoundingClientRect()
  const groupSize = horizontal ? groupRect.width : groupRect.height
  if (groupSize <= 0) return

  const previousRect = previous.getBoundingClientRect()
  const nextRect = next.getBoundingClientRect()
  const previousStart = ((horizontal ? previousRect.width : previousRect.height) / groupSize) * 100
  const nextStart = ((horizontal ? nextRect.width : nextRect.height) / groupSize) * 100
  const pairSize = previousStart + nextStart
  const start = horizontal ? event.clientX : event.clientY
  const minPrevious = readPanelLimit(previous, 'minSize', 5)
  const maxPrevious = readPanelLimit(previous, 'maxSize', 95)
  const minNext = readPanelLimit(next, 'minSize', 5)
  const maxNext = readPanelLimit(next, 'maxSize', 95)

  const onPointerMove = (moveEvent: PointerEvent) => {
    const position = horizontal ? moveEvent.clientX : moveEvent.clientY
    const delta = ((position - start) / groupSize) * 100
    const lowerBound = Math.max(minPrevious, pairSize - maxNext)
    const upperBound = Math.min(maxPrevious, pairSize - minNext)
    const previousSize = clamp(previousStart + delta, lowerBound, upperBound)
    const nextSize = pairSize - previousSize

    previous.style.flexBasis = String(previousSize) + '%'
    next.style.flexBasis = String(nextSize) + '%'
    handle.setAttribute('aria-valuenow', String(Math.round(previousSize)))
  }

  const stopResize = () => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', stopResize)
    window.removeEventListener('pointercancel', stopResize)
    handle.removeAttribute('data-resizing')
  }

  event.preventDefault()
  handle.setAttribute('data-resizing', 'true')
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopResize, { once: true })
  window.addEventListener('pointercancel', stopResize, { once: true })
}

export function ResizablePanelGroup(props: GenericProps) {
  const { class: className, direction = 'horizontal', style, ...rest } = props
  return (
    <div
      data-slot='resizable-panel-group'
      data-direction={direction}
      class={cn('flex h-full w-full rounded-lg border', direction === 'vertical' && 'flex-col', className)}
      style={{
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        ...(typeof style === 'object' && style ? style : {}),
      }}
      {...rest}
    />
  )
}

export function ResizablePanel(props: GenericProps) {
  const { class: className, defaultSize = 50, minSize = 5, maxSize = 95, style, ...rest } = props
  return (
    <div
      data-slot='resizable-panel'
      data-min-size={minSize}
      data-max-size={maxSize}
      class={cn('overflow-auto p-4', className)}
      style={{
        flexBasis: String(defaultSize) + '%',
        flexGrow: 0,
        flexShrink: 0,
        ...(typeof style === 'object' && style ? style : {}),
      }}
      {...rest}
    />
  )
}

export function ResizableHandle(props: GenericProps) {
  const { class: className, onPointerDown, ...rest } = props
  return (
    <div
      role='separator'
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot='resizable-handle'
      class={cn('relative bg-border after:absolute after:inset-0 after:m-auto after:h-10 after:w-1 after:rounded-full after:bg-muted-foreground/30', className)}
      onPointerDown={(event: PointerEvent) => {
        ;(onPointerDown as ((event: PointerEvent) => void) | undefined)?.(event)
        if (!event.defaultPrevented) beginResize(event)
      }}
      {...rest}
    />
  )
}
`

const scrollAreaTemplate: TemplateFn =
  context => `import { ScrollArea as ScrollAreaPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function ScrollArea(props: GenericProps) {
  const { class: className, ...rest } = props
  return <ScrollAreaPrimitive.Root class={cn('relative overflow-hidden rounded-md border', className)} {...rest} />
}

export function ScrollBar(props: GenericProps) {
  const { class: className, orientation = 'vertical', ...rest } = props
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      class={cn(
        'flex select-none touch-none p-0.5 transition-colors',
        orientation === 'vertical' ? 'h-full w-2.5 border-l border-l-transparent' : 'h-2.5 w-full border-t border-t-transparent',
        className,
      )}
      {...rest}
    >
      <ScrollAreaPrimitive.Thumb class='relative flex-1 rounded-full bg-border' />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export function ScrollAreaViewport(props: GenericProps) {
  const { class: className, ...rest } = props
  return <ScrollAreaPrimitive.Viewport class={cn('h-full w-full rounded-[inherit]', className)} {...rest} />
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

export type {
  ToastActionRecord as SonnerActionRecord,
  ToastPosition as SonnerPosition,
  ToastRecord as SonnerRecord,
  ToastVariant as SonnerVariant,
} from '${context.uiImport('toast')}'
`

const spinnerTemplate: TemplateFn =
  context => `import { cva, type VariantProps } from 'class-variance-authority'

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
    description: 'Accessible date grid with controlled selection and month navigation',
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
    description: 'Filterable command palette with controlled selection',
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
    description: 'Directional drawer primitives powered by sheet components',
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
    registryDependencies: ['button', 'input', 'textarea'],
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
    dependencies: ['@fictjs/radix-ui'],
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
    description: 'Pointer-resizable panel group with size constraints',
    content: resizableTemplate,
  }),
  createComponentEntry({
    name: 'scroll-area',
    description: 'Scroll area wrappers with themed scrollbar',
    dependencies: ['@fictjs/radix-ui'],
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

type ExpandedBlockKind =
  | 'calendar'
  | 'chart'
  | 'dashboard'
  | 'sidebar'
  | 'login'
  | 'otp'
  | 'showcase'

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

export const expandedBlockRegistry: RegistryEntry[] = expandedBlockNames.map(name =>
  createExpandedBlockEntry(name),
)

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
