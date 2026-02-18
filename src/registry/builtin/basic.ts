import type { RegistryEntry } from '../types'

export const basicComponentRegistry: RegistryEntry[] = [
  {
    name: 'button',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Accessible button with variants',
    dependencies: ['class-variance-authority'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/button.tsx',
        content: context => `import { cva, type VariantProps } from 'class-variance-authority'

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
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = JSX.IntrinsicElements['button'] & VariantProps<typeof buttonVariants>

export function Button(props: ButtonProps) {
  const { class: className, variant, size, ...rest } = props
  return <button class={cn(buttonVariants({ variant, size }), className)} {...rest} />
}

export { buttonVariants }
`,
      },
    ],
  },
  {
    name: 'badge',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Small status badge with variants',
    dependencies: ['class-variance-authority'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/badge.tsx',
        content: context => `import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '${context.imports.cn}'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type BadgeProps = JSX.IntrinsicElements['div'] & VariantProps<typeof badgeVariants>

export function Badge(props: BadgeProps) {
  const { class: className, variant, ...rest } = props
  return <div class={cn(badgeVariants({ variant }), className)} {...rest} />
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
    version: '0.1.0',
    type: 'ui-component',
    description: 'Visual separator based on primitives',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/separator.tsx',
        content: context => `import { Separator as PrimitiveSeparator } from '@fictjs/ui-primitives'

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
    <PrimitiveSeparator
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
    version: '0.1.0',
    type: 'ui-component',
    description: 'Simple avatar wrapper',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/avatar.tsx',
        content: context => `import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type ImgProps = JSX.IntrinsicElements['img']

export function Avatar(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...rest} />
}

export function AvatarImage(props: ImgProps) {
  const { class: className, ...rest } = props
  return <img class={cn('aspect-square h-full w-full', className)} {...rest} />
}

export function AvatarFallback(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'aspect-ratio',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Aspect ratio primitive wrapper',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/aspect-ratio.tsx',
        content: () => `export { AspectRatio } from '@fictjs/ui-primitives'
`,
      },
    ],
  },
  {
    name: 'skeleton',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Skeleton placeholder',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/skeleton.tsx',
        content: context => `import { Skeleton as PrimitiveSkeleton } from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

type SkeletonProps = {
  class?: string
  [key: string]: unknown
}

export function Skeleton(props: SkeletonProps) {
  const { class: className, ...rest } = props
  return <PrimitiveSkeleton class={cn('animate-pulse rounded-md bg-muted', className)} {...rest} />
}
`,
      },
    ],
  },
  {
    name: 'label',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Form label wrapper',
    dependencies: ['@fictjs/ui-primitives'],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/label.tsx',
        content: context => `import { Label as PrimitiveLabel } from '@fictjs/ui-primitives'

import { cn } from '${context.imports.cn}'

type LabelProps = {
  class?: string
  [key: string]: unknown
}

export function Label(props: LabelProps) {
  const { class: className, ...rest } = props
  return <PrimitiveLabel class={cn('text-sm font-medium leading-none', className)} {...rest} />
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
