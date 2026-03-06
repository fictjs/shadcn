export interface DocSummary {
  slug: string
  title: string
  description: string
  section: string
}

export interface DocHeading {
  id: string
  title: string
  level: number
}

export interface DocTabPanel {
  value: string
  label: string
  blocks: DocContentBlock[]
}

export interface DocContentBlock {
  kind:
    | "heading"
    | "paragraph"
    | "code"
    | "list"
    | "blockquote"
    | "hr"
    | "image"
    | "callout"
    | "tabs"
    | "component-preview"
    | "component-source"
  text: string
  id?: string
  level?: number
  items?: string[]
  ordered?: boolean
  src?: string
  alt?: string
  title?: string
  panels?: DocTabPanel[]
  children?: DocContentBlock[]
  name?: string
  filePath?: string
  code?: string
  styleName?: string
  direction?: "ltr" | "rtl"
}

export interface DocPage extends DocSummary {
  body: string
  headings: DocHeading[]
  blocks: DocContentBlock[]
  sourcePath: string
}

export interface BlockEntry {
  name: string
  description: string
  categories: string[]
}

export interface ThemeEntry {
  name: string
  title: string
}

export interface ExampleShowcase {
  slug: string
  title: string
  description: string
  imageLight: string
  imageDark: string
}

export interface DocNavItem {
  slug: string
  title: string
  href: string
}

export interface DocNavSection {
  title: string
  items: DocNavItem[]
}

export type RouteKind =
  | "home"
  | "create"
  | "docs-index"
  | "docs-detail"
  | "components"
  | "examples"
  | "charts"
  | "blocks"
  | "themes"
  | "colors"
  | "not-found"

export interface ResolvedRoute {
  kind: RouteKind
  status: number
  pathname: string
  pageTitle: string
  docs: DocSummary[]
  doc: DocPage | null
  docNavigation: DocNavSection[]
  docPrev: DocSummary | null
  docNext: DocSummary | null
  components: string[]
  examples: string[]
  examplePages: ExampleShowcase[]
  activeExample: ExampleShowcase | null
  exampleSlug: string | null
  charts: string[]
  chartTypes: string[]
  activeChartType: string | null
  chartItems: string[]
  chartType: string | null
  blocks: BlockEntry[]
  blockCategories: string[]
  blockCategory: string | null
  themes: ThemeEntry[]
}
