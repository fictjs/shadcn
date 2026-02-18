import type { RegistryEntry } from '../types'

export const dataComponentRegistry: RegistryEntry[] = [
  {
    name: 'table',
    version: '0.1.0',
    type: 'ui-component',
    description: 'Table composition primitives',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{componentsDir}}/table.tsx',
        content: context => `import { cn } from '${context.imports.cn}'

type DivProps = JSX.IntrinsicElements['div']
type TableProps = JSX.IntrinsicElements['table']
type SectionProps = JSX.IntrinsicElements['thead']
type BodyProps = JSX.IntrinsicElements['tbody']
type RowProps = JSX.IntrinsicElements['tr']
type HeadProps = JSX.IntrinsicElements['th']
type CellProps = JSX.IntrinsicElements['td']
type CaptionProps = JSX.IntrinsicElements['caption']

export function Table(props: TableProps) {
  const { class: className, ...rest } = props
  return (
    <div class='relative w-full overflow-auto'>
      <table class={cn('w-full caption-bottom text-sm', className)} {...rest} />
    </div>
  )
}

export function TableHeader(props: SectionProps) {
  const { class: className, ...rest } = props
  return <thead class={cn('[&_tr]:border-b', className)} {...rest} />
}

export function TableBody(props: BodyProps) {
  const { class: className, ...rest } = props
  return <tbody class={cn('[&_tr:last-child]:border-0', className)} {...rest} />
}

export function TableFooter(props: SectionProps) {
  const { class: className, ...rest } = props
  return <tfoot class={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)} {...rest} />
}

export function TableRow(props: RowProps) {
  const { class: className, ...rest } = props
  return <tr class={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)} {...rest} />
}

export function TableHead(props: HeadProps) {
  const { class: className, ...rest } = props
  return <th class={cn('h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', className)} {...rest} />
}

export function TableCell(props: CellProps) {
  const { class: className, ...rest } = props
  return <td class={cn('p-2 align-middle [&:has([role=checkbox])]:pr-0', className)} {...rest} />
}

export function TableCaption(props: CaptionProps) {
  const { class: className, ...rest } = props
  return <caption class={cn('mt-4 text-sm text-muted-foreground', className)} {...rest} />
}

export function TableContainer(props: DivProps) {
  const { class: className, ...rest } = props
  return <div class={cn('w-full rounded-md border', className)} {...rest} />
}
`,
      },
    ],
  },
]
