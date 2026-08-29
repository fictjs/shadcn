import type { RegistryEntry } from '../types'

export const basicComponentRegistry: RegistryEntry[] = [
  {
    name: 'button',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Accessible button with variants',
    dependencies: ['@fictjs/radix-ui', 'class-variance-authority'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/button.tsx',
        content: context => `import { Slot } from '@fictjs/radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '${context.imports.cn}'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        xs: 'h-6 rounded-md px-2 text-xs',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        'icon-xs': 'h-6 w-6 rounded-md',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-10 w-10 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = JSX.IntrinsicElements['button'] & VariantProps<typeof buttonVariants> & {
  asChild?: boolean
}

export function Button(props: ButtonProps) {
  const { asChild, class: className, variant, size, ...rest } = props
  const classValue = cn(buttonVariants({ variant, size }), className)

  if (asChild) {
    return <Slot.Root class={classValue} data-slot='button' data-variant={variant} data-size={size} {...rest} />
  }

  return <button class={classValue} data-slot='button' data-variant={variant} data-size={size} {...rest} />
}

export { buttonVariants }
`,
      },
    ],
  },
  {
    name: 'badge',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Small status badge with variants',
    dependencies: ['@fictjs/radix-ui', 'class-variance-authority'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/badge.tsx',
        content: context => `import { Slot } from '@fictjs/radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '${context.imports.cn}'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        ghost: 'border-transparent hover:bg-accent hover:text-accent-foreground',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type BadgeProps = JSX.IntrinsicElements['span'] & VariantProps<typeof badgeVariants> & {
  asChild?: boolean
}

export function Badge(props: BadgeProps) {
  const { asChild, class: className, variant = 'default', ...rest } = props
  const classValue = cn(badgeVariants({ variant }), className)

  if (asChild) {
    return <Slot.Root class={classValue} data-slot='badge' data-variant={variant} {...rest} />
  }

  return <span class={classValue} data-slot='badge' data-variant={variant} {...rest} />
}

export { badgeVariants }
`,
      },
    ],
  },
  {
    name: 'card',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Card layout primitives',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/card.tsx',
        content: context => `import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type HeadingProps = JSX.IntrinsicElements['h3']
type ParagraphProps = JSX.IntrinsicElements['p']

export function Card(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('rounded-xl border bg-card text-card-foreground shadow', className)} {...rest} />
}

export function CardHeader(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col space-y-1.5 p-6', className)} {...rest} />
}

export function CardTitle(props: HeadingProps) {
  const { class: className, ...rest } = props
  return <h3 class={cn('font-semibold leading-none tracking-tight', className)} {...rest} />
}

export function CardDescription(props: ParagraphProps) {
  const { class: className, ...rest } = props
  return <p class={cn('text-sm text-muted-foreground', className)} {...rest} />
}

export function CardContent(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('p-6 pt-0', className)} {...rest} />
}

export function CardFooter(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex items-center p-6 pt-0', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'separator',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Visual separator based on primitives',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/separator.tsx',
        content: context => `import { Separator as SeparatorPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

type SeparatorProps = {
  class?: string
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
  [key: string]: unknown
}

export function Separator(props: SeparatorProps) {
  const { class: className, orientation = 'horizontal', decorative = true, ...rest } = props
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      class={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
  {
    name: 'avatar',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Avatar primitives with badges, sizes, and groups',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/avatar.tsx',
        content: context => `import { Avatar as AvatarPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

type GenericProps = {
  class?: string
  children?: unknown
  [key: string]: unknown
}

type AvatarProps = GenericProps & {
  size?: 'default' | 'sm' | 'lg'
}

export function Avatar(props: AvatarProps) {
  const { class: className, size = 'default', ...rest } = props
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      data-size={size}
      class={cn(
        'group/avatar relative flex shrink-0 select-none rounded-full',
        size === 'sm' ? 'size-6' : size === 'lg' ? 'size-10' : 'size-8',
        className,
      )}
      {...rest}
    />
  )
}

export function AvatarImage(props: GenericProps) {
  const { class: className, ...rest } = props
  return <AvatarPrimitive.Image data-slot='avatar-image' class={cn('aspect-square size-full rounded-full object-cover', className)} {...rest} />
}

export function AvatarFallback(props: GenericProps) {
  const { class: className, ...rest } = props
  return <AvatarPrimitive.Fallback data-slot='avatar-fallback' class={cn('flex size-full items-center justify-center rounded-full bg-muted text-sm group-data-[size=sm]/avatar:text-xs', className)} {...rest} />
}

export function AvatarBadge(props: GenericProps) {
  const { class: className, ...rest } = props
  return <span data-slot='avatar-badge' class={cn('absolute bottom-0 right-0 z-10 inline-flex size-2.5 items-center justify-center rounded-full ring-2 ring-background [&_svg]:size-2', className)} {...rest} />
}

export function AvatarGroup(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div data-slot='avatar-group' class={cn('flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background', className)} {...rest} />
}

export function AvatarGroupCount(props: GenericProps) {
  const { class: className, ...rest } = props
  return <div data-slot='avatar-group-count' class={cn('relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs ring-2 ring-background [&_svg]:size-4', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'aspect-ratio',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Aspect ratio primitive wrapper',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/aspect-ratio.tsx',
        content: () => `import { AspectRatio as AspectRatioPrimitive } from '@fictjs/radix-ui'

export const AspectRatio = AspectRatioPrimitive.Root
`,
      },
    ],
  },
  {
    name: 'skeleton',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Skeleton placeholder',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/skeleton.tsx',
        content: context => `import { cn } from '${context.imports.cn}'

type SkeletonProps = JSX.IntrinsicElements['div']

export function Skeleton(props: SkeletonProps) {
  const { class: className, ...rest } = props
  return (
    <div
      aria-hidden='true'
      data-slot='skeleton'
      class={cn('animate-pulse rounded-md bg-muted', className)}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
  {
    name: 'label',
    version: '0.2.0',
    type: 'ui-component',
    description: 'Form label wrapper',
    dependencies: ['@fictjs/radix-ui'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/label.tsx',
        content: context => `import { Label as LabelPrimitive } from '@fictjs/radix-ui'

import { cn } from '${context.imports.cn}'

type LabelProps = {
  class?: string
  [key: string]: unknown
}

export function Label(props: LabelProps) {
  const { class: className, ...rest } = props
  return <LabelPrimitive.Root class={cn('text-sm font-medium leading-none', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'input',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Styled text input',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/input.tsx',
        content: context => `import { cn } from '${context.imports.cn}'

type InputProps = JSX.IntrinsicElements['input']

export function Input(props: InputProps) {
  const { class: className, type = 'text', ...rest } = props
  return (
    <input
      type={type}
      class={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
  {
    name: 'textarea',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Styled textarea',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/textarea.tsx',
        content: context => `import { cn } from '${context.imports.cn}'

type TextareaProps = JSX.IntrinsicElements['textarea']

export function Textarea(props: TextareaProps) {
  const { class: className, ...rest } = props
  return (
    <textarea
      class={cn(
        'min-h-20 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  )
}
`,
      },
    ],
  },
]
