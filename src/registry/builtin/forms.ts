import type { RegistryEntry } from '../types'

export const formComponentRegistry: RegistryEntry[] = [
  {
    name: 'checkbox',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Checkbox primitive wrapper',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/checkbox.tsx',
        content: context => `import { Checkbox as CheckboxPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

type CheckboxProps = {
  class?: string
  indicatorClass?: string
  children?: unknown
  [key: string]: unknown
}

export function Checkbox(props: CheckboxProps) {
  const { class: className, indicatorClass, children, ...rest } = props

  return (
    <CheckboxPrimitive.Root
      class={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      <CheckboxPrimitive.Indicator class={cn('flex items-center justify-center text-[10px]', indicatorClass)}>
        {children ?? '✓'}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
`,
      },
    ],
  },
  {
    name: 'radio-group',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Radio group primitives with style wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/radio-group.tsx',
        content: context => `import { RadioGroup as RadioGroupPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

type GroupProps = {
  class?: string
  [key: string]: unknown
}

type ItemProps = {
  class?: string
  indicatorClass?: string
  children?: unknown
  [key: string]: unknown
}

export function RadioGroup(props: GroupProps) {
  const { class: className, ...rest } = props
  return <RadioGroupPrimitive.Root class={cn('grid gap-2', className)} {...rest} />
}

export function RadioGroupItem(props: ItemProps) {
  const { class: className, indicatorClass, children, ...rest } = props
  return (
    <RadioGroupPrimitive.Item
      class={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      <RadioGroupPrimitive.Indicator class={cn('flex items-center justify-center', indicatorClass)}>
        {children ?? <span class='block h-2.5 w-2.5 rounded-full bg-current' />}
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}
`,
      },
    ],
  },
  {
    name: 'switch',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Switch primitive wrapper',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/switch.tsx',
        content: context => `import { Switch as SwitchPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

type SwitchProps = {
  class?: string
  thumbClass?: string
  size?: 'default' | 'sm'
  [key: string]: unknown
}

export function Switch(props: SwitchProps) {
  const { class: className, thumbClass, size = 'default', ...rest } = props
  return (
    <SwitchPrimitive.Root
      data-size={size}
      class={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input transition-colors data-[state=checked]:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-4 w-7' : 'h-5 w-9',
        className,
      )}
      {...rest}
    >
      <SwitchPrimitive.Thumb
        class={cn(
          'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
          size === 'sm'
            ? 'h-3 w-3 data-[state=checked]:translate-x-3'
            : 'h-4 w-4 data-[state=checked]:translate-x-4',
          thumbClass,
        )}
      />
    </SwitchPrimitive.Root>
  )
}
`,
      },
    ],
  },
  {
    name: 'select',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Select primitive wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/select.tsx',
        content: context => `import { Select as SelectPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const Select = SelectPrimitive.Root

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function SelectTrigger(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <SelectPrimitive.Trigger
      class={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </SelectPrimitive.Trigger>
  )
}

export function SelectValue(props: GenericProps) {
  const { class: className, ...rest } = props
  return <SelectPrimitive.Value class={cn('truncate', className)} {...rest} />
}

export function SelectContent(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        class={cn('relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md', className)}
        {...rest}
      >
        <SelectPrimitive.Viewport class='p-1'>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <SelectPrimitive.Item
      class={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground',
        className,
      )}
      {...rest}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator class='absolute right-2'>✓</SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
`,
      },
    ],
  },
  {
    name: 'combobox',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Filterable combobox with controlled value and open state',
    dependencies: [],
    registryDependencies: ['input'],
    files: [
      {
        path: '{{componentsDir}}/combobox.tsx',
        content: context => `import { createContext, useContext } from 'fict'
import { createSignal } from 'fict/advanced'

import { cn } from '${context.imports.cn}'

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

type MaybeAccessor<T> = T | (() => T)

type ComboboxProps = GenericProps & {
  value?: MaybeAccessor<string | string[]>
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  open?: MaybeAccessor<boolean>
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  multiple?: boolean
  autoHighlight?: boolean
}

type ComboboxItemProps = GenericProps & {
  value: string
}

type ComboboxContextValue = {
  values: () => string[]
  selectValue: (value: string) => void
  removeValue: (value: string) => void
  clear: () => void
  open: () => boolean
  setOpen: (open: boolean) => void
  query: () => string
  setQuery: (query: string) => void
  multiple: boolean
  autoHighlight: boolean
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null)

function read<T>(value: MaybeAccessor<T> | undefined, fallback: T): T {
  if (typeof value === 'function') return (value as () => T)()
  return value ?? fallback
}

function useCombobox(): ComboboxContextValue {
  const context = useContext(ComboboxContext)
  if (!context) throw new Error('Combobox components must be used inside Combobox')
  return context
}

export function Combobox(props: ComboboxProps) {
  const initialValues = Array.isArray(props.defaultValue) ? props.defaultValue : props.defaultValue ? [props.defaultValue] : []
  const internalValues = createSignal<string[]>(initialValues)
  const internalOpen = createSignal(props.defaultOpen ?? false)
  const query = createSignal('')

  const values = () => {
    const controlled = read(props.value, props.multiple ? [] : '')
    if (props.value === undefined) return internalValues()
    return Array.isArray(controlled) ? controlled : controlled ? [controlled] : []
  }
  const commitValues = (next: string[]) => {
    if (props.value === undefined) internalValues(next)
    props.onValueChange?.(props.multiple ? next : next[0] ?? '')
  }
  const setOpen = (open: boolean) => {
    if (props.open === undefined) internalOpen(open)
    props.onOpenChange?.(open)
  }
  const contextValue: ComboboxContextValue = {
    values,
    selectValue: value => {
      const current = values()
      if (props.multiple) commitValues(current.includes(value) ? current.filter(item => item !== value) : [...current, value])
      else commitValues([value])
    },
    removeValue: value => commitValues(values().filter(item => item !== value)),
    clear: () => commitValues([]),
    open: () => read(props.open, internalOpen()),
    setOpen,
    query,
    setQuery: value => {
      query(value)
    },
    multiple: props.multiple ?? false,
    autoHighlight: props.autoHighlight ?? false,
  }

  const {
    class: className,
    children,
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    multiple,
    autoHighlight,
    ...rest
  } = props

  return (
    <ComboboxContext.Provider value={contextValue}>
      <div data-slot='combobox' class={cn('relative', className)} {...rest}>
        {children}
      </div>
    </ComboboxContext.Provider>
  )
}

export function ComboboxInput(props: GenericProps) {
  const context = useCombobox()
  const { class: className, onFocus, onInput, onKeyDown, children, showClear, ...rest } = props
  const input = <input
    type='text'
    role='combobox'
    aria-autocomplete='list'
    aria-expanded={() => context.open()}
    value={() => context.query() || (context.multiple ? '' : context.values()[0] ?? '')}
    data-slot='combobox-input-control'
    class='min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
    onFocus={(event: FocusEvent) => {
      ;(onFocus as ((event: FocusEvent) => void) | undefined)?.(event)
      if (!event.defaultPrevented) context.setOpen(true)
    }}
    onInput={(event: Event) => {
      ;(onInput as ((event: Event) => void) | undefined)?.(event)
      if (event.defaultPrevented) return
      const target = event.currentTarget as HTMLInputElement
      context.setQuery(target.value)
      context.setOpen(true)
    }}
    onKeyDown={(event: KeyboardEvent) => {
      ;(onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event)
      if (event.key === 'Escape') context.setOpen(false)
    }}
    {...rest}
  />
  return (
    <div
      data-slot='combobox-input'
      class={cn(
        'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring has-[[aria-invalid=true]]:border-destructive',
        className,
      )}
    >
      {children}
      {input}
      {showClear && context.values().length ? <button type='button' aria-label='Clear selection' onClick={() => { context.clear(); context.setQuery('') }}>×</button> : null}
      <button type='button' aria-label='Toggle options' tabIndex={-1} onClick={() => context.setOpen(!context.open())}>⌄</button>
    </div>
  )
}

export function ComboboxList(props: GenericProps) {
  const context = useCombobox()
  const { class: className, children, forceMount, ...rest } = props
  return () =>
    context.open() || forceMount ? (
      <div
        role='listbox'
        data-slot='combobox-list'
        class={cn('mt-1 max-h-64 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
        {...rest}
      >
        {children}
      </div>
    ) : null
}

export function ComboboxContent(props: GenericProps) {
  const context = useCombobox()
  const { class: className, children, forceMount, ...rest } = props
  return () => context.open() || forceMount ? <div data-slot='combobox-content' class={cn('absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)} {...rest}>{children}</div> : null
}

export function ComboboxEmpty(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div data-slot='combobox-empty' class={cn('px-2 py-6 text-center text-sm text-muted-foreground', className)} {...rest} />
}

export function ComboboxGroup(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div role='group' data-slot='combobox-group' class={cn('py-1', className)} {...rest} />
}

export function ComboboxLabel(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div data-slot='combobox-label' class={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)} {...rest} />
}

export function ComboboxSeparator(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div role='separator' data-slot='combobox-separator' class={cn('-mx-1 my-1 h-px bg-border', className)} {...rest} />
}

export function ComboboxChips(props: GenericProps) {
  const context = useCombobox()
  const { class: className, onClick, ...rest } = props
  return <div data-slot='combobox-chips' class={cn('flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border px-2 py-1', className)} onClick={(event: MouseEvent) => { ;(onClick as ((event: MouseEvent) => void) | undefined)?.(event); if (!event.defaultPrevented) context.setOpen(true) }} {...rest} />
}

export function ComboboxChip(props: ComboboxItemProps) {
  const context = useCombobox()
  const { class: className, children, value, ...rest } = props
  return (
    <span data-slot='combobox-chip' class={cn('inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-sm', className)} {...rest}>
      {children}
      <button type='button' aria-label={\`Remove \${value}\`} onClick={() => context.removeValue(value)}>×</button>
    </span>
  )
}

export function ComboboxChipsInput(props: GenericProps) {
  const context = useCombobox()
  const { class: className, onInput, ...rest } = props
  return <input role='combobox' aria-expanded={() => context.open()} value={() => context.query()} class={cn('min-w-20 flex-1 bg-transparent py-1 text-sm outline-none', className)} onFocus={() => context.setOpen(true)} onInput={(event: Event) => { ;(onInput as ((event: Event) => void) | undefined)?.(event); context.setQuery((event.currentTarget as HTMLInputElement).value); context.setOpen(true) }} {...rest} />
}

export function ComboboxValue(props: GenericProps) {
  const context = useCombobox()
  const { children, ...rest } = props
  return () => <span data-slot='combobox-value' {...rest}>{typeof children === 'function' ? children(context.values()) : children ?? context.values().join(', ')}</span>
}

export function ComboboxTrigger(props: GenericProps) {
  const context = useCombobox()
  const { class: className, children, onClick, ...rest } = props
  return <button type='button' role='combobox' aria-expanded={() => context.open()} data-slot='combobox-trigger' class={cn('flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm', className)} onClick={(event: MouseEvent) => { ;(onClick as ((event: MouseEvent) => void) | undefined)?.(event); if (!event.defaultPrevented) context.setOpen(!context.open()) }} {...rest}>{children}<span aria-hidden='true'>⌄</span></button>
}

export function ComboboxItem(props: ComboboxItemProps) {
  const context = useCombobox()
  const { class: className, children, value, onClick, ...rest } = props
  const matches = () => {
    const query = context.query().trim().toLowerCase()
    const label = typeof children === 'string' ? children : value
    return !query || label.toLowerCase().includes(query)
  }

  return () =>
    matches() ? (
      <button
        type='button'
        role='option'
        aria-selected={() => context.values().includes(value)}
        data-slot='combobox-item'
        data-state={() => (context.values().includes(value) ? 'selected' : 'idle')}
        data-highlighted={() => context.autoHighlight && !context.query() ? 'true' : undefined}
        class={cn('relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground', className)}
        onClick={(event: MouseEvent) => {
          ;(onClick as ((event: MouseEvent) => void) | undefined)?.(event)
          if (event.defaultPrevented) return
          context.selectValue(value)
          context.setQuery(context.multiple ? '' : value)
          if (!context.multiple) context.setOpen(false)
        }}
        {...rest}
      >
        {children}
      </button>
    ) : null
}
`,
      },
    ],
  },
  {
    name: 'slider',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Slider primitive wrapper',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/slider.tsx',
        content: context => `import { Slider as SliderPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

type SliderProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function Slider(props: SliderProps) {
  const { class: className, children, ...rest } = props
  return (
    <SliderPrimitive.Root
      class={cn('relative flex w-full touch-none select-none items-center', className)}
      {...rest}
    >
      {children ?? (
        <>
          <SliderPrimitive.Track class='relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20'>
            <SliderPrimitive.Range class='absolute h-full bg-primary' />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb class='block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50' />
        </>
      )}
    </SliderPrimitive.Root>
  )
}
`,
      },
    ],
  },
  {
    name: 'toggle',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Toggle primitive wrapper',
    dependencies: ['@fictjs/radix-ui', 'class-variance-authority'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/toggle.tsx',
        content: context => `import { Toggle as TogglePrimitive } from '@fictjs/radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '${context.imports.cn}'

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2.5',
        lg: 'h-10 px-3.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ToggleProps = VariantProps<typeof toggleVariants> & {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function Toggle(props: ToggleProps) {
  const { class: className, variant, size, children, ...rest } = props
  return (
    <TogglePrimitive.Root class={cn(toggleVariants({ variant, size }), className)} {...rest}>
      {children}
    </TogglePrimitive.Root>
  )
}

export { toggleVariants }
`,
      },
    ],
  },
  {
    name: 'toggle-group',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Toggle group wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: ['toggle'],
    files: [
      {
        path: '{{componentsDir}}/toggle-group.tsx',
        content: context => `import { ToggleGroup as ToggleGroupPrimitive } from '@fictjs/radix-ui'
import { createContext, useContext } from 'fict'

import { cn } from '${context.imports.cn}'
import { toggleVariants } from '${context.uiImport('toggle')}'

type GroupProps = {
  class?: string
  children?: unknown
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  spacing?: number
  style?: Record<string, string | number>
  [key: string]: unknown
}

type ItemProps = {
  class?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  children?: unknown
  [key: string]: unknown
}

type ToggleGroupContextValue = Pick<GroupProps, 'variant' | 'size' | 'spacing'>

const ToggleGroupContext = createContext<ToggleGroupContextValue>({ spacing: 0 })

export function ToggleGroup(props: GroupProps) {
  const {
    class: className,
    children,
    variant,
    size,
    spacing = 0,
    style,
    ...rest
  } = props
  return (
    <ToggleGroupPrimitive.Root
      data-slot='toggle-group'
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ '--toggle-group-gap': \`${'${spacing * 0.25}'}rem\`, ...style }}
      class={cn(
        'inline-flex w-fit items-center justify-center gap-[var(--toggle-group-gap)] rounded-md data-[orientation=vertical]:flex-col',
        className,
      )}
      {...rest}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

export function ToggleGroupItem(props: ItemProps) {
  const { class: className, variant, size, children, ...rest } = props
  const context = useContext(ToggleGroupContext)
  const resolvedVariant = context.variant ?? variant
  const resolvedSize = context.size ?? size
  return (
    <ToggleGroupPrimitive.Item
      data-slot='toggle-group-item'
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.spacing ?? 0}
      class={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        'w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10',
        'data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l',
        className,
      )}
      {...rest}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}
`,
      },
    ],
  },
  {
    name: 'form',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Form field structure wrappers',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: ['label'],
    files: [
      {
        path: '{{componentsDir}}/form.tsx',
        content: context => `import { Form as FormPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

export const Form = FormPrimitive.Root
export const FormField = FormPrimitive.Field

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function FormLabel(props: GenericProps) {
  const { class: className, ...rest } = props
  return <FormPrimitive.Label class={cn('text-sm font-medium leading-none', className)} {...rest} />
}

export function FormControl(props: GenericProps) {
  const { class: className, ...rest } = props
  return <FormPrimitive.Control class={cn('w-full', className)} {...rest} />
}

export function FormDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <p class={cn('text-[0.8rem] text-muted-foreground', className)} {...rest} />
}

export function FormMessage(props: GenericProps) {
  const { class: className, ...rest } = props
  return <FormPrimitive.Message class={cn('text-[0.8rem] font-medium text-destructive', className)} {...rest} />
}
`,
      },
    ],
  },
]
