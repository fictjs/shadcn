export interface DocSummary {
  slug: string
  title: string
  description: string
  section: string
}

export interface DocPage extends DocSummary {
  body: string
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

export type RouteKind =
  | "home"
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
  components: string[]
  examples: string[]
  charts: string[]
  blocks: BlockEntry[]
  themes: ThemeEntry[]
}
