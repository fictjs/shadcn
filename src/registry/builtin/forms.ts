import type { RegistryEntry } from '../types'

export const formComponentRegistry: RegistryEntry[] = [
  {
    name: 'checkbox',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Checkbox primitive wrapper',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/checkbox.tsx',
        content: context => `import { Checkbox as PrimitiveCheckbox } from '@fictjs/ui-primitives'

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
    <PrimitiveCheckbox
      class={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      <span class={cn('flex items-center justify-center text-[10px]', indicatorClass)}>{children ?? '✓'}</span>
    </PrimitiveCheckbox>
  )
}
`,
      },
    ],
  },
  {
    name: 'radio-group',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Radio group primitives with style wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/radio-group.tsx',
        content: context => `import { RadioGroup as PrimitiveRadioGroup, RadioItem as PrimitiveRadioItem } from '@fictjs/ui-primitives'

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
  return <PrimitiveRadioGroup class={cn('grid gap-2', className)} {...rest} />
}

export function RadioGroupItem(props: ItemProps) {
  const { class: className, indicatorClass, children, ...rest } = props
  return (
    <PrimitiveRadioItem
      class={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      <span class={cn('block h-2.5 w-2.5 rounded-full bg-current', indicatorClass)}>{children ?? null}</span>
    </PrimitiveRadioItem>
  )
}
`,
      },
    ],
  },
  {
    name: 'switch',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Switch primitive wrapper',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/switch.tsx',
        content: context => `import { Switch as PrimitiveSwitch, SwitchThumb } from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

type SwitchProps = {
  class?: string
  thumbClass?: string
  [key: string]: unknown
}

export function Switch(props: SwitchProps) {
  const { class: className, thumbClass, ...rest } = props
  return (
    <PrimitiveSwitch
      class={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input transition-colors data-[state=checked]:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      <SwitchThumb
        class={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
          thumbClass,
        )}
      />
    </PrimitiveSwitch>
  )
}
`,
      },
    ],
  },
  {
    name: 'select',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Select primitive wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/select.tsx',
        content: context => `import {
  SelectRoot,
  SelectTrigger as PrimitiveSelectTrigger,
  SelectValue as PrimitiveSelectValue,
  SelectContent as PrimitiveSelectContent,
  SelectItem as PrimitiveSelectItem,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Select = SelectRoot

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function SelectTrigger(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <PrimitiveSelectTrigger
      class={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </PrimitiveSelectTrigger>
  )
}

export function SelectValue(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveSelectValue class={cn('truncate', className)} {...rest} />
}

export function SelectContent(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveSelectContent
      class={cn('relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md', className)}
      {...rest}
    />
  )
}

export function SelectItem(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <PrimitiveSelectItem
      class={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </PrimitiveSelectItem>
  )
}
`,
      },
    ],
  },
  {
    name: 'combobox',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Combobox primitive wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: ['input'],
    files: [
      {
        path: '{{componentsDir}}/combobox.tsx',
        content: context => `import {
  ComboboxRoot,
  ComboboxInput as PrimitiveComboboxInput,
  ComboboxList as PrimitiveComboboxList,
  ComboboxItem as PrimitiveComboboxItem,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Combobox = ComboboxRoot

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function ComboboxInput(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveComboboxInput
      class={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  )
}

export function ComboboxList(props: GenericProps) {
  const { class: className, ...rest } = props
  return (
    <PrimitiveComboboxList
      class={cn('mt-1 max-h-64 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
      {...rest}
    />
  )
}

export function ComboboxItem(props: GenericProps) {
  const { class: className, children, ...rest } = props
  return (
    <PrimitiveComboboxItem
      class={cn('relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground', className)}
      {...rest}
    >
      {children}
    </PrimitiveComboboxItem>
  )
}
`,
      },
    ],
  },
  {
    name: 'slider',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Slider primitive wrapper',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/slider.tsx',
        content: context => `import { Slider as PrimitiveSlider } from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

type SliderProps = {
  class?: string
  [key: string]: unknown
}

export function Slider(props: SliderProps) {
  const { class: className, ...rest } = props
  return <PrimitiveSlider class={cn('w-full accent-primary', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'toggle',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Toggle primitive wrapper',
    dependencies: ['@fictjs/ui-primitives', 'class-variance-authority'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/toggle.tsx',
        content: context => `import { Toggle as PrimitiveToggle } from '@fictjs/ui-primitives'
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
    <PrimitiveToggle class={cn(toggleVariants({ variant, size }), className)} {...rest}>
      {children}
    </PrimitiveToggle>
  )
}

export { toggleVariants }
`,
      },
    ],
  },
  {
    name: 'toggle-group',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Toggle group wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: ['toggle'],
    files: [
      {
        path: '{{componentsDir}}/toggle-group.tsx',
        content: context => `import { ToggleGroup as PrimitiveToggleGroup, ToggleGroupItem as PrimitiveToggleGroupItem } from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'
import { toggleVariants } from '${context.uiImport('toggle')}'

type GroupProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

type ItemProps = {
  class?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  children?: unknown
  [key: string]: unknown
}

export function ToggleGroup(props: GroupProps) {
  const { class: className, children, ...rest } = props
  return (
    <PrimitiveToggleGroup class={cn('inline-flex items-center justify-center gap-1', className)} {...rest}>
      {children}
    </PrimitiveToggleGroup>
  )
}

export function ToggleGroupItem(props: ItemProps) {
  const { class: className, variant, size, children, ...rest } = props
  return (
    <PrimitiveToggleGroupItem class={cn(toggleVariants({ variant, size }), className)} {...rest}>
      {children}
    </PrimitiveToggleGroupItem>
  )
}
`,
      },
    ],
  },
  {
    name: 'form',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Form field structure wrappers',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: ['label'],
    files: [
      {
        path: '{{componentsDir}}/form.tsx',
        content: context => `import {
  Form as PrimitiveForm,
  FormField as PrimitiveFormField,
  FormLabel as PrimitiveFormLabel,
  FormControl as PrimitiveFormControl,
  FormDescription as PrimitiveFormDescription,
  FormMessage as PrimitiveFormMessage,
} from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

export const Form = PrimitiveForm
export const FormField = PrimitiveFormField

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

export function FormLabel(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveFormLabel class={cn('text-sm font-medium leading-none', className)} {...rest} />
}

export function FormControl(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveFormControl class={cn('w-full', className)} {...rest} />
}

export function FormDescription(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveFormDescription class={cn('text-[0.8rem] text-muted-foreground', className)} {...rest} />
}

export function FormMessage(props: GenericProps) {
  const { class: className, ...rest } = props
  return <PrimitiveFormMessage class={cn('text-[0.8rem] font-medium text-destructive', className)} {...rest} />
}
`,
      },
    ],
  },
]
