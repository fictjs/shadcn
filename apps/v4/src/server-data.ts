import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type {
  BlockEntry,
  DocContentBlock,
  DocHeading,
  DocNavSection,
  DocPage,
  DocSummary,
  DocTabPanel,
  ExampleShowcase,
  ResolvedRoute,
  ThemeEntry,
} from "./types"

interface SiteCatalog {
  docs: DocSummary[]
  docsBySlug: Map<string, DocPage>
  docNavigation: DocNavSection[]
  docOrder: string[]
  components: string[]
  examples: string[]
  charts: string[]
  blocks: BlockEntry[]
  themes: ThemeEntry[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const runtimeRoot = (globalThis as Record<string, unknown>).__FICT_SSR_BASE__
const appRoot = typeof runtimeRoot === "string" ? runtimeRoot : path.resolve(__dirname, "..")
const docsRoot = path.join(appRoot, "content", "docs")
const componentsRoot = path.join(appRoot, "registry", "new-york-v4", "ui")
const examplesRoot = path.join(appRoot, "registry", "new-york-v4", "examples")
const chartsRoot = path.join(appRoot, "registry", "new-york-v4", "charts")
const blocksFile = path.join(appRoot, "registry", "__blocks__.json")
const themesFile = path.join(appRoot, "registry", "themes.ts")
const registryStylesRoot = path.join(appRoot, "public", "r", "styles")
const featuredExamplePages: ExampleShowcase[] = [
  {
    slug: "dashboard",
    title: "Dashboard",
    description: "Admin dashboard example using cards, charts, tables, and sidebar layouts.",
    imageLight: "/examples/dashboard-light.png",
    imageDark: "/examples/dashboard-dark.png",
  },
  {
    slug: "tasks",
    title: "Tasks",
    description: "A task and issue tracker build using Tanstack Table.",
    imageLight: "/examples/tasks-light.png",
    imageDark: "/examples/tasks-dark.png",
  },
  {
    slug: "playground",
    title: "Playground",
    description: "The OpenAI Playground built using the components.",
    imageLight: "/examples/playground-light.png",
    imageDark: "/examples/playground-dark.png",
  },
  {
    slug: "authentication",
    title: "Authentication",
    description: "Authentication forms built using the components.",
    imageLight: "/examples/authentication-light.png",
    imageDark: "/examples/authentication-dark.png",
  },
  {
    slug: "rtl",
    title: "RTL",
    description: "RTL example page with right-to-left language support.",
    imageLight: "/examples/cards-light.png",
    imageDark: "/examples/cards-dark.png",
  },
]
const chartTypeOrder = ["area", "bar", "line", "pie", "radar", "radial", "tooltip"]
const featuredBlockNames = ["dashboard-01", "sidebar-07", "sidebar-03", "login-03", "login-04"]

let cachedCatalog: SiteCatalog | null = null
const registryItemCache = new Map<string, { path: string; content: string } | null>()

export function resolveRoute(rawUrl: string): ResolvedRoute {
  const catalog = getSiteCatalog()
  const pathname = normalizePathname(rawUrl)
  const chartTypes = getChartTypes(catalog.charts)
  const blockCategories = getBlockCategories(catalog.blocks)
  const basePayload = {
    docs: catalog.docs,
    doc: null,
    docNavigation: catalog.docNavigation,
    docPrev: null,
    docNext: null,
    components: catalog.components,
    examples: catalog.examples,
    examplePages: featuredExamplePages,
    activeExample: null,
    exampleSlug: null,
    charts: catalog.charts,
    chartTypes,
    activeChartType: null,
    chartItems: [],
    chartType: null,
    blocks: catalog.blocks,
    blockCategories,
    blockCategory: null,
    themes: catalog.themes,
  }

  if (pathname === "/") {
    return {
      kind: "home",
      status: 200,
      pathname,
      pageTitle: "@fictjs/shadcn v4 - Fict SSR Website",
      ...basePayload,
    }
  }

  if (pathname === "/create") {
    return {
      kind: "create",
      status: 200,
      pathname,
      pageTitle: "New Project - @fictjs/shadcn",
      ...basePayload,
    }
  }

  if (pathname === "/docs") {
    const doc = catalog.docsBySlug.get("") ?? null
    const { previous, next } = getDocNeighbors(catalog, "")

    if (doc) {
      return {
        kind: "docs-detail",
        status: 200,
        pathname,
        pageTitle: `${doc.title} - Docs - @fictjs/shadcn`,
        docs: catalog.docs,
        doc,
        docNavigation: catalog.docNavigation,
        docPrev: previous,
        docNext: next,
        components: catalog.components,
        examples: catalog.examples,
        examplePages: featuredExamplePages,
        activeExample: null,
        exampleSlug: null,
        charts: catalog.charts,
        chartTypes,
        activeChartType: null,
        chartItems: [],
        chartType: null,
        blocks: catalog.blocks,
        blockCategories,
        blockCategory: null,
        themes: catalog.themes,
      }
    }

    return {
      kind: "docs-index",
      status: 200,
      pathname,
      pageTitle: "Docs - @fictjs/shadcn",
      ...basePayload,
    }
  }

  if (pathname.startsWith("/docs/")) {
    const slug = pathname.slice("/docs/".length)
    const doc = catalog.docsBySlug.get(slug) ?? null
    const { previous, next } = getDocNeighbors(catalog, slug)
    return {
      kind: doc ? "docs-detail" : "not-found",
      status: doc ? 200 : 404,
      pathname,
      pageTitle: doc ? `${doc.title} - Docs - @fictjs/shadcn` : "Not Found - @fictjs/shadcn",
      docs: catalog.docs,
      doc,
      docNavigation: catalog.docNavigation,
      docPrev: previous,
      docNext: next,
      components: catalog.components,
      examples: catalog.examples,
      examplePages: featuredExamplePages,
      activeExample: null,
      exampleSlug: null,
      charts: catalog.charts,
      chartTypes,
      activeChartType: null,
      chartItems: [],
      chartType: null,
      blocks: catalog.blocks,
      blockCategories,
      blockCategory: null,
      themes: catalog.themes,
    }
  }

  if (pathname === "/components") {
    const doc = catalog.docsBySlug.get("components") ?? null
    const { previous, next } = getDocNeighbors(catalog, "components")
    if (doc) {
      return {
        kind: "docs-detail",
        status: 200,
        pathname,
        pageTitle: `${doc.title} - Docs - @fictjs/shadcn`,
        docs: catalog.docs,
        doc,
        docNavigation: catalog.docNavigation,
        docPrev: previous,
        docNext: next,
        components: catalog.components,
        examples: catalog.examples,
        examplePages: featuredExamplePages,
        activeExample: null,
        exampleSlug: null,
        charts: catalog.charts,
        chartTypes,
        activeChartType: null,
        chartItems: [],
        chartType: null,
        blocks: catalog.blocks,
        blockCategories,
        blockCategory: null,
        themes: catalog.themes,
      }
    }

    return {
      kind: "not-found",
      status: 404,
      pathname,
      pageTitle: "Not Found - @fictjs/shadcn",
      ...basePayload,
    }
  }

  if (pathname === "/examples") {
    return {
      kind: "examples",
      status: 200,
      pathname,
      pageTitle: "Examples - @fictjs/shadcn",
      ...basePayload,
    }
  }

  if (pathname.startsWith("/examples/")) {
    const exampleSlug = pathname.slice("/examples/".length)
    const activeExample = getFeaturedExample(exampleSlug)
    if (activeExample) {
      return {
        kind: "examples",
        status: 200,
        pathname,
        pageTitle: `${humanizeSegment(exampleSlug)} - Examples - @fictjs/shadcn`,
        ...basePayload,
        activeExample,
        exampleSlug,
      }
    }
  }

  if (pathname === "/charts") {
    const activeChartType = chartTypes[0] ?? null
    const chartItems = activeChartType
      ? getChartsForType(catalog.charts, activeChartType)
      : []
    return {
      kind: "charts",
      status: 200,
      pathname,
      pageTitle: "Charts - @fictjs/shadcn",
      ...basePayload,
      activeChartType,
      chartItems,
    }
  }

  if (pathname.startsWith("/charts/")) {
    const chartType = pathname.slice("/charts/".length)
    if (chartTypes.includes(chartType)) {
      return {
        kind: "charts",
        status: 200,
        pathname,
        pageTitle: `${humanizeSegment(chartType)} Charts - @fictjs/shadcn`,
        ...basePayload,
        activeChartType: chartType,
        chartItems: getChartsForType(catalog.charts, chartType),
        chartType,
      }
    }
  }

  if (pathname === "/blocks") {
    return {
      kind: "blocks",
      status: 200,
      pathname,
      pageTitle: "Blocks - @fictjs/shadcn",
      ...basePayload,
      blocks: getFeaturedBlocks(catalog.blocks),
    }
  }

  if (pathname.startsWith("/blocks/")) {
    const blockCategory = pathname.slice("/blocks/".length)
    if (blockCategories.includes(blockCategory)) {
      return {
        kind: "blocks",
        status: 200,
        pathname,
        pageTitle: `${humanizeSegment(blockCategory)} Blocks - @fictjs/shadcn`,
        ...basePayload,
        blocks: filterBlocksByCategory(catalog.blocks, blockCategory),
        blockCategory,
      }
    }
  }

  if (pathname === "/themes") {
    return {
      kind: "themes",
      status: 200,
      pathname,
      pageTitle: "Themes - @fictjs/shadcn",
      ...basePayload,
    }
  }

  if (pathname === "/colors") {
    return {
      kind: "colors",
      status: 200,
      pathname,
      pageTitle: "Colors - @fictjs/shadcn",
      ...basePayload,
    }
  }

  return {
    kind: "not-found",
    status: 404,
    pathname,
    pageTitle: "Not Found - @fictjs/shadcn",
    ...basePayload,
  }
}

function getSiteCatalog(): SiteCatalog {
  if (cachedCatalog) {
    return cachedCatalog
  }

  const docs = loadDocs()
  const docsBySlug = new Map<string, DocPage>()
  for (const doc of docs) {
    docsBySlug.set(doc.slug, doc)
  }

  const summaries: DocSummary[] = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    section: doc.section,
  }))

  summaries.sort((a, b) => {
    if (a.section === b.section) {
      return a.title.localeCompare(b.title)
    }
    return a.section.localeCompare(b.section)
  })

  const { sections: docNavigation, order: docOrder } = buildDocsNavigation(summaries)

  const catalog: SiteCatalog = {
    docs: summaries,
    docsBySlug,
    docNavigation,
    docOrder,
    components: loadComponents(),
    examples: loadExamples(),
    charts: loadCharts(),
    blocks: loadBlocks(),
    themes: loadThemes(),
  }

  cachedCatalog = catalog
  return catalog
}

function getDocNeighbors(
  catalog: SiteCatalog,
  currentSlug: string,
): { previous: DocSummary | null; next: DocSummary | null } {
  const currentIndex = catalog.docOrder.indexOf(currentSlug)
  if (currentIndex === -1) {
    return { previous: null, next: null }
  }

  const previousSlug = currentIndex > 0 ? catalog.docOrder[currentIndex - 1] : null
  const nextSlug =
    currentIndex < catalog.docOrder.length - 1 ? catalog.docOrder[currentIndex + 1] : null

  return {
    previous: toDocSummary(previousSlug ? catalog.docsBySlug.get(previousSlug) : null),
    next: toDocSummary(nextSlug ? catalog.docsBySlug.get(nextSlug) : null),
  }
}

function toDocSummary(doc: DocPage | null | undefined): DocSummary | null {
  if (!doc) {
    return null
  }

  return {
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    section: doc.section,
  }
}

function buildDocsNavigation(docs: DocSummary[]): {
  sections: DocNavSection[]
  order: string[]
} {
  const docsBySlug = new Map<string, DocSummary>()
  for (const doc of docs) {
    docsBySlug.set(doc.slug, doc)
  }

  const sections: DocNavSection[] = []
  const order: string[] = []
  const seen = new Set<string>()

  const pushOrderedSlug = (slug: string): void => {
    if (seen.has(slug)) {
      return
    }
    seen.add(slug)
    order.push(slug)
  }

  const rootMeta = readDocsMetaFile(docsRoot)
  const rootPages = Array.isArray(rootMeta?.pages) ? rootMeta.pages : []

  for (const pageToken of rootPages) {
    if (isDocsLinkToken(pageToken)) {
      continue
    }

    const childSections = buildDocsSectionsFromDirectory(pageToken, docsBySlug, pushOrderedSlug)
    for (const section of childSections) {
      if (section.items.length > 0) {
        sections.push(section)
      }
    }
  }

  if (sections.length === 0) {
    const fallback = docs
      .map((doc) => ({
        slug: doc.slug,
        title: doc.title,
        href: toDocHref(doc.slug),
      }))
      .sort((a, b) => a.title.localeCompare(b.title))
    for (const item of fallback) {
      pushOrderedSlug(item.slug)
    }
    return {
      sections: [{ title: "Documentation", items: fallback }],
      order,
    }
  }

  const extras = docs
    .filter((doc) => !seen.has(doc.slug))
    .map((doc) => ({ slug: doc.slug, title: doc.title, href: toDocHref(doc.slug) }))
    .sort((a, b) => a.title.localeCompare(b.title))

  if (extras.length > 0) {
    for (const extra of extras) {
      pushOrderedSlug(extra.slug)
    }
    sections.push({
      title: "More",
      items: extras,
    })
  }

  return { sections, order }
}

function buildDocsSectionsFromDirectory(
  relativeDirectory: string,
  docsBySlug: Map<string, DocSummary>,
  pushOrderedSlug: (slug: string) => void,
): DocNavSection[] {
  const normalizedDirectory = normalizeDocsDirectory(relativeDirectory)
  const directoryPath = path.join(docsRoot, normalizedDirectory)

  if (!fs.existsSync(directoryPath)) {
    return []
  }

  const meta = readDocsMetaFile(directoryPath)
  const title = meta?.title?.trim() || humanizeSegment(relativeDirectory)
  const pages = Array.isArray(meta?.pages) ? meta.pages : []

  if (pages.includes("...")) {
    const nestedSections: DocNavSection[] = []
    const childDirectories = fs
      .readdirSync(directoryPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((entryName) =>
        fs.existsSync(path.join(directoryPath, entryName, "meta.json")),
      )
      .sort((a, b) => a.localeCompare(b))

    for (const childDirectory of childDirectories) {
      const childPath = path.posix.join(normalizedDirectory, childDirectory)
      nestedSections.push(...buildDocsSectionsFromDirectory(childPath, docsBySlug, pushOrderedSlug))
    }

    return nestedSections
  }

  const items: Array<{ slug: string; title: string; href: string }> = []
  const pushItem = (slug: string, fallbackTitle?: string): void => {
    const doc = docsBySlug.get(slug)
    if (!doc) {
      return
    }

    items.push({
      slug: doc.slug,
      title: fallbackTitle || doc.title,
      href: toDocHref(doc.slug),
    })
    pushOrderedSlug(doc.slug)
  }

  if (pages.length > 0) {
    for (const pageToken of pages) {
      if (pageToken === "...") {
        continue
      }

      const linked = parseDocsLinkToken(pageToken)
      if (linked) {
        pushItem(linked.slug, linked.title)
        continue
      }

      const slug = resolveMetaPageSlug(normalizedDirectory, pageToken)
      if (slug === null) {
        continue
      }

      pushItem(slug)
    }
  } else {
    const prefix = normalizeDocsPrefix(normalizedDirectory)
    const fallbackDocs = Array.from(docsBySlug.values())
      .filter((doc) => doc.slug === prefix || doc.slug.startsWith(`${prefix}/`))
      .sort((a, b) => {
        if (prefix === "changelog") {
          if (a.slug === "changelog") {
            return -1
          }
          if (b.slug === "changelog") {
            return 1
          }
          return b.slug.localeCompare(a.slug)
        }

        if (a.slug === prefix) {
          return -1
        }
        if (b.slug === prefix) {
          return 1
        }
        return a.title.localeCompare(b.title)
      })

    for (const doc of fallbackDocs) {
      pushItem(doc.slug)
    }
  }

  if (items.length === 0) {
    return []
  }

  return [{ title, items }]
}

function readDocsMetaFile(directoryPath: string): { title?: string; pages?: string[] } | null {
  const metaPath = path.join(directoryPath, "meta.json")
  if (!fs.existsSync(metaPath)) {
    return null
  }

  try {
    const raw = fs.readFileSync(metaPath, "utf8")
    return JSON.parse(raw) as { title?: string; pages?: string[] }
  } catch {
    return null
  }
}

function resolveMetaPageSlug(relativeDirectory: string, pageToken: string): string | null {
  const token = pageToken.trim()
  if (!token) {
    return null
  }

  const normalizedDirectory = normalizeDocsPrefix(relativeDirectory)
  if (token === "index") {
    return normalizedDirectory
  }

  const segments = normalizedDirectory ? normalizedDirectory.split("/") : []
  return [...segments, token].filter(Boolean).join("/")
}

function normalizeDocsDirectory(relativeDirectory: string): string {
  return relativeDirectory.replace(/\\/g, "/")
}

function normalizeDocsPrefix(relativeDirectory: string): string {
  const segments = normalizeDocsDirectory(relativeDirectory)
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => !/^\(.*\)$/.test(segment))

  return segments.join("/")
}

function parseDocsLinkToken(token: string): { title: string; slug: string } | null {
  const match = token.match(/^\[([^\]]+)\]\((\/docs[^)]*)\)$/)
  if (!match) {
    return null
  }

  const title = match[1]?.trim()
  const href = match[2]?.trim()
  if (!title || !href) {
    return null
  }

  const slug = href
    .replace(/^\/docs\/?/, "")
    .replace(/\/+$|\?.*$/g, "")
    .trim()

  return {
    title,
    slug,
  }
}

function isDocsLinkToken(token: string): boolean {
  return parseDocsLinkToken(token) !== null
}

function toDocHref(slug: string): string {
  return slug ? `/docs/${slug}` : "/docs"
}

function getChartTypes(charts: string[]): string[] {
  const types = new Set<string>()
  for (const chart of charts) {
    const match = chart.match(/^chart-([a-z0-9]+)-/)
    if (match && match[1]) {
      types.add(match[1])
    }
  }

  return Array.from(types).sort((a, b) => {
    const aIndex = chartTypeOrder.indexOf(a)
    const bIndex = chartTypeOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b)
    }
    if (aIndex === -1) {
      return 1
    }
    if (bIndex === -1) {
      return -1
    }
    return aIndex - bIndex
  })
}

function getChartsForType(charts: string[], chartType: string): string[] {
  return charts
    .filter((chart) => chart.startsWith(`chart-${chartType}-`))
    .sort((a, b) => a.localeCompare(b))
}

function getFeaturedExample(slug: string): ExampleShowcase | null {
  for (const example of featuredExamplePages) {
    if (example.slug === slug) {
      return example
    }
  }

  return null
}

function getBlockCategories(blocks: BlockEntry[]): string[] {
  const categories = new Set<string>()
  for (const block of blocks) {
    for (const category of block.categories) {
      categories.add(category)
    }
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b))
}

function filterBlocksByCategory(blocks: BlockEntry[], category: string): BlockEntry[] {
  return blocks.filter((block) => block.categories.includes(category))
}

function getFeaturedBlocks(blocks: BlockEntry[]): BlockEntry[] {
  const featured: BlockEntry[] = []
  for (const name of featuredBlockNames) {
    const match = blocks.find((block) => block.name === name)
    if (match) {
      featured.push(match)
    }
  }

  return featured
}

function humanizeSegment(value: string): string {
  const normalized = value
    .replace(/\(root\)/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!normalized) {
    return "Documentation"
  }

  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function loadDocs(): DocPage[] {
  if (!fs.existsSync(docsRoot)) {
    return []
  }

  const files: string[] = []
  walkDirectory(docsRoot, files)

  const docs: DocPage[] = []
  for (const filePath of files) {
    if (!filePath.endsWith(".mdx")) {
      continue
    }

    const relativePath = path.relative(docsRoot, filePath).replace(/\\/g, "/")
    const slug = toDocSlug(relativePath)

    const raw = fs.readFileSync(filePath, "utf8")
    const { frontmatter, body } = parseFrontmatter(raw)
    const title = frontmatter.title || slug
    const description = frontmatter.description || ""
    const section = slug.includes("/") ? slug.split("/")[0] : "overview"
    const normalizedBody = normalizeMdxBody(body)
    const { headings, blocks } = parseDocBody(normalizedBody)

    docs.push({
      slug,
      title,
      description,
      section,
      body: normalizedBody,
      headings,
      blocks,
      sourcePath: relativePath,
    })
  }

  return docs
}

function loadComponents(): string[] {
  return listTsxFileBaseNames(componentsRoot)
}

function loadExamples(): string[] {
  return listTsxFileBaseNames(examplesRoot)
}

function loadCharts(): string[] {
  return listTsxFileBaseNames(chartsRoot)
}

function loadThemes(): ThemeEntry[] {
  if (!fs.existsSync(themesFile)) {
    return []
  }

  const raw = fs.readFileSync(themesFile, "utf8")
  const themes: ThemeEntry[] = []
  const seen = new Set<string>()
  const themePattern = /name:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"/g

  for (const match of raw.matchAll(themePattern)) {
    const name = match[1]?.trim()
    const title = match[2]?.trim()
    if (!name || !title || seen.has(name)) {
      continue
    }
    seen.add(name)
    themes.push({ name, title })
  }

  return themes.sort((a, b) => a.title.localeCompare(b.title))
}

function loadBlocks(): BlockEntry[] {
  if (!fs.existsSync(blocksFile)) {
    return []
  }

  const raw = fs.readFileSync(blocksFile, "utf8")
  const parsed = JSON.parse(raw) as Array<{
    name?: string
    description?: string
    categories?: string[]
  }>

  return parsed
    .filter((entry) => typeof entry.name === "string")
    .map((entry) => ({
      name: entry.name || "",
      description: entry.description || "",
      categories: Array.isArray(entry.categories) ? entry.categories : [],
    }))
}

function listTsxFileBaseNames(directoryPath: string): string[] {
  if (!fs.existsSync(directoryPath)) {
    return []
  }

  return fs
    .readdirSync(directoryPath)
    .filter((fileName) => fileName.endsWith(".tsx"))
    .map((fileName) => fileName.slice(0, -4))
    .sort((a, b) => a.localeCompare(b))
}

function walkDirectory(currentPath: string, files: string[]): void {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = path.join(currentPath, entry.name)
    if (entry.isDirectory()) {
      walkDirectory(entryPath, files)
      continue
    }
    files.push(entryPath)
  }
}

function toDocSlug(relativePath: string): string {
  const withoutExt = relativePath.replace(/\.mdx$/, "")
  const segments = withoutExt
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => !/^\(.*\)$/.test(segment))

  if (segments.length === 0) {
    return ""
  }

  if (segments[segments.length - 1] === "index") {
    segments.pop()
  }

  return segments.join("/")
}

function parseFrontmatter(raw: string): {
  frontmatter: Record<string, string>
  body: string
} {
  if (!raw.startsWith("---")) {
    return { frontmatter: {}, body: raw }
  }

  const end = raw.indexOf("\n---", 3)
  if (end === -1) {
    return { frontmatter: {}, body: raw }
  }

  const frontmatterBlock = raw.slice(3, end).trim()
  const body = raw.slice(end + 4).replace(/^\n+/, "")
  const frontmatter: Record<string, string> = {}

  for (const line of frontmatterBlock.split("\n")) {
    const separatorIndex = line.indexOf(":")
    if (separatorIndex === -1) {
      continue
    }
    const key = line.slice(0, separatorIndex).trim()
    const value = normalizeYamlValue(line.slice(separatorIndex + 1).trim())
    if (key) {
      frontmatter[key] = value
    }
  }

  return { frontmatter, body }
}

function normalizeYamlValue(raw: string): string {
  const trimmed = raw.trim()
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function normalizeMdxBody(body: string): string {
  const withoutImports = body
    .replace(/^import\s+.*$/gm, "")
    .replace(/^export\s+const\s+.*$/gm, "")

  const normalizedStructures = normalizeMdxStructures(withoutImports)

  return transformOutsideCodeFences(normalizedStructures, normalizeMdxMarkup)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function normalizeMdxStructures(value: string): string {
  let normalized = value

  normalized = replaceSelfClosingMdxTag(normalized, "ComponentPreview", (attributes) => {
    const name = readMdxAttribute(attributes, "name") || "component-preview"
    const styleName = readMdxAttribute(attributes, "styleName") || "new-york-v4"
    const direction = readMdxAttribute(attributes, "direction") || "ltr"
    return `\n${createDocMarker("component-preview", { name, styleName, direction })}\n`
  })

  normalized = replaceSelfClosingMdxTag(normalized, "ComponentSource", (attributes) => {
    const name = readMdxAttribute(attributes, "name") || "component-source"
    const title = readMdxAttribute(attributes, "title")
    const styleName = readMdxAttribute(attributes, "styleName") || "new-york-v4"
    return `\n${createDocMarker("component-source", { name, title, styleName })}\n`
  })

  normalized = normalizeTabsMarkup(normalized)
  normalized = normalizeCalloutMarkup(normalized)

  return normalized
}

function transformOutsideCodeFences(
  value: string,
  transform: (segment: string) => string,
): string {
  const parts = value.split(/(```[\s\S]*?```)/g)
  return parts
    .map((part) => (part.startsWith("```") ? part : transform(part)))
    .join("")
}

function normalizeMdxMarkup(segment: string): string {
  let normalized = segment

  normalized = replaceSelfClosingMdxTag(normalized, "Image", (attributes) => {
    const src = readMdxAttribute(attributes, "src")
    const alt = readMdxAttribute(attributes, "alt") || "Image"
    if (!src) {
      return ""
    }

    return `\n![${alt}](${src})\n`
  })

  normalized = normalized.replace(/<Steps(?:\s[^>]*)?>/g, "\n")
  normalized = normalized.replace(/<\/Steps>/g, "\n")
  normalized = normalized.replace(/<Step>([\s\S]*?)<\/Step>/g, (_, content) => {
    const item = collapseMdxWhitespace(stripResidualMdx(normalizeMdxMarkup(content)))
    return item ? `\n1. ${item}\n` : "\n"
  })

  normalized = normalized.replace(/<(?:Accordion|AccordionItem|AccordionPrimitive\.Item)(?:\s[^>]*)?>/g, "\n")
  normalized = normalized.replace(/<\/(?:Accordion|AccordionItem|AccordionPrimitive\.Item)>/g, "\n")
  normalized = normalized.replace(/<AccordionTrigger(?:\s[^>]*)?>([\s\S]*?)<\/AccordionTrigger>/g, (_, content) => {
    const title = collapseMdxWhitespace(stripResidualMdx(normalizeMdxMarkup(content)))
    return title ? `\n### ${title}\n` : "\n"
  })
  normalized = normalized.replace(/<AccordionContent(?:\s[^>]*)?>([\s\S]*?)<\/AccordionContent>/g, (_, content) => {
    const inner = normalizeMdxMarkup(content).trim()
    return inner ? `\n${inner}\n` : "\n"
  })

  normalized = normalized.replace(/<\/?p(?:\s[^>]*)?>/g, "\n")
  normalized = normalized.replace(/<br\s*\/?>/g, "\n")
  normalized = normalized.replace(/<\/?[A-Za-z][A-Za-z0-9_.-]*(?:\s[^>]*)?>/g, "")

  return normalized
}

function replaceSelfClosingMdxTag(
  value: string,
  tagName: string,
  render: (attributes: string) => string,
): string {
  const expression = new RegExp(`<${tagName}([\\s\\S]*?)\\/>`, "g")
  return value.replace(expression, (_, attributes) => render(attributes || ""))
}

function readMdxAttribute(attributes: string, attributeName: string): string {
  const quoted = new RegExp(`${attributeName}\\s*=\\s*"([^"]*)"`)
  const quotedMatch = attributes.match(quoted)
  if (quotedMatch?.[1]) {
    return quotedMatch[1]
  }

  const wrapped = new RegExp(`${attributeName}\\s*=\\s*\{([^}]*)\}`)
  const wrappedMatch = attributes.match(wrapped)
  if (wrappedMatch?.[1]) {
    return wrappedMatch[1].replace(/^['"]|['"]$/g, "").trim()
  }

  return ""
}

function createDocMarker(markerName: string, attributes: Record<string, string>): string {
  const serialized = Object.entries(attributes)
    .filter((entry) => entry[1].trim().length > 0)
    .map(([key, value]) => `${key}="${escapeDocMarkerValue(value)}"`)
    .join(" ")

  return `:::${markerName}${serialized ? ` ${serialized}` : ""}`
}

function escapeDocMarkerValue(value: string): string {
  return value.replace(/"/g, "'").replace(/\s+/g, " ").trim()
}

function normalizeTabsMarkup(value: string): string {
  return value.replace(/<(CodeTabs|Tabs)(?:\s[^>]*)?>([\s\S]*?)<\/(CodeTabs|Tabs)>/g, (_, __, content: string) => {
    const labels = new Map<string, string>()

    for (const match of content.matchAll(/<TabsTrigger([^>]*)>([\s\S]*?)<\/TabsTrigger>/g)) {
      const attributes = match[1] || ""
      const tabValue = readMdxAttribute(attributes, "value") || `tab-${labels.size + 1}`
      const tabLabel = collapseMdxWhitespace(stripResidualMdx(normalizeMdxMarkup(match[2] || ""))) || humanizeSegment(tabValue)
      labels.set(tabValue, tabLabel)
    }

    const panels: string[] = []
    for (const match of content.matchAll(/<TabsContent([^>]*)>([\s\S]*?)<\/TabsContent>/g)) {
      const attributes = match[1] || ""
      const tabValue = readMdxAttribute(attributes, "value") || `tab-${panels.length + 1}`
      const tabLabel = labels.get(tabValue) || humanizeSegment(tabValue)
      const inner = normalizeMdxBody(match[2] || "").trim()
      panels.push(`${createDocMarker("tab", { value: tabValue, label: tabLabel })}\n${inner}\n:::endtab`)
    }

    if (panels.length === 0) {
      return "\n"
    }

    return `\n:::tabs\n${panels.join("\n\n")}\n:::endtabs\n`
  })
}

function normalizeCalloutMarkup(value: string): string {
  return value.replace(/<Callout([^>]*)>([\s\S]*?)<\/Callout>/g, (_, attributes, content) => {
    const title = readMdxAttribute(attributes, "title")
    const inner = normalizeMdxBody(content).trim()
    return `\n${createDocMarker("callout", { title })}\n${inner}\n:::endcallout\n`
  })
}

function stripResidualMdx(value: string): string {
  return value
    .replace(/<\/?[A-Za-z][A-Za-z0-9_.-]*(?:\s[^>]*)?>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
}

function collapseMdxWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function readDocMarkerAttribute(line: string, attributeName: string): string {
  return readMdxAttribute(line.replace(/^:::[a-z-]+\s*/, ""), attributeName)
}

function loadRegistryItem(styleName: string, name: string): { path: string; content: string } | null {
  const cacheKey = `${styleName}:${name}`
  const cached = registryItemCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  for (const candidate of getRegistryLookupCandidates(name)) {
    const jsonPath = path.join(registryStylesRoot, styleName, `${candidate}.json`)
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, "utf8")
        const parsed = JSON.parse(raw) as { files?: Array<{ path?: string; content?: string }> }
        const firstFile = Array.isArray(parsed.files) ? parsed.files.find((file) => file.path && file.content) : null
        if (firstFile?.path && typeof firstFile.content === "string") {
          const resolved = { path: firstFile.path, content: firstFile.content }
          registryItemCache.set(cacheKey, resolved)
          return resolved
        }
      } catch {
      }
    }
  }

  for (const candidate of getRegistryLookupCandidates(name)) {
    const examplePath = path.join(examplesRoot, `${candidate}.tsx`)
    if (fs.existsSync(examplePath)) {
      const content = fs.readFileSync(examplePath, "utf8")
      const resolved = {
        path: path.relative(appRoot, examplePath).replace(/\\/g, "/"),
        content,
      }
      registryItemCache.set(cacheKey, resolved)
      return resolved
    }

    const componentPath = path.join(componentsRoot, `${candidate}.tsx`)
    if (fs.existsSync(componentPath)) {
      const content = fs.readFileSync(componentPath, "utf8")
      const resolved = {
        path: path.relative(appRoot, componentPath).replace(/\\/g, "/"),
        content,
      }
      registryItemCache.set(cacheKey, resolved)
      return resolved
    }
  }

  registryItemCache.set(cacheKey, null)
  return null
}

function getRegistryLookupCandidates(name: string): string[] {
  const candidates: string[] = []

  const pushCandidate = (value: string): void => {
    const normalized = value.trim()
    if (!normalized || candidates.includes(normalized)) {
      return
    }
    candidates.push(normalized)
  }

  pushCandidate(name)
  pushCandidate(name.replace(/-(rtl|ltr)$/g, ""))
  pushCandidate(name.replace(/-demo$/g, "-example"))
  pushCandidate(name.replace(/-demo$/g, ""))

  const family = resolvePreviewFamilyName(name)
  if (family) {
    pushCandidate(`${family}-example`)
    pushCandidate(family)
  }

  return candidates
}

function resolvePreviewFamilyName(name: string): string {
  const normalized = name.replace(/-(rtl|ltr)$/g, "")
  const families = [
    "dropdown-menu",
    "navigation-menu",
    "context-menu",
    "button-group",
    "data-table",
    "input-group",
    "native-select",
    "input-otp",
    "hover-card",
    "alert-dialog",
    "scroll-area",
    "radio-group",
    "date-picker",
    "aspect-ratio",
    "toggle-group",
    "collapsible",
    "combobox",
    "menubar",
    "carousel",
    "accordion",
    "separator",
    "typography",
    "breadcrumb",
    "checkbox",
    "pagination",
    "skeleton",
    "popover",
    "progress",
    "resizable",
    "textarea",
    "calendar",
    "sidebar",
    "tooltip",
    "avatar",
    "button",
    "switch",
    "select",
    "dialog",
    "drawer",
    "sheet",
    "table",
    "empty",
    "badge",
    "field",
    "input",
    "label",
    "alert",
    "toggle",
    "tabs",
    "item",
    "chart",
    "card",
    "mode-toggle",
    "kbd",
  ]

  for (const family of families) {
    if (normalized === family || normalized.startsWith(`${family}-`)) {
      return family
    }
  }

  return ""
}

function parseDocBody(body: string): {
  headings: DocHeading[]
  blocks: DocContentBlock[]
} {
  const headings: DocHeading[] = []
  const blocks: DocContentBlock[] = []
  const headingIdCounts = new Map<string, number>()
  const lines = body.split("\n")
  let index = 0

  while (index < lines.length) {
    const line = lines[index] || ""
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith(":::callout")) {
      const title = readDocMarkerAttribute(trimmed, "title")
      const nestedLines: string[] = []
      index += 1
      while (index < lines.length && !(lines[index] || "").trim().startsWith(":::endcallout")) {
        nestedLines.push(lines[index] || "")
        index += 1
      }
      if (index < lines.length) {
        index += 1
      }

      const nestedBody = parseDocBody(nestedLines.join("\n"))
      blocks.push({
        kind: "callout",
        text: title,
        title: title || undefined,
        children: nestedBody.blocks,
      })
      continue
    }

    if (trimmed.startsWith(":::tabs")) {
      const panels: DocTabPanel[] = []
      index += 1

      while (index < lines.length) {
        const current = (lines[index] || "").trim()
        if (current.startsWith(":::endtabs")) {
          index += 1
          break
        }

        if (!current.startsWith(":::tab")) {
          index += 1
          continue
        }

        const value = readDocMarkerAttribute(current, "value") || `tab-${panels.length + 1}`
        const label = readDocMarkerAttribute(current, "label") || humanizeSegment(value)
        const panelLines: string[] = []
        index += 1

        while (index < lines.length && !(lines[index] || "").trim().startsWith(":::endtab")) {
          panelLines.push(lines[index] || "")
          index += 1
        }

        if (index < lines.length) {
          index += 1
        }

        const panelBody = parseDocBody(panelLines.join("\n"))
        panels.push({
          value,
          label,
          blocks: panelBody.blocks,
        })
      }

      blocks.push({
        kind: "tabs",
        text: "",
        panels,
      })
      continue
    }

    if (trimmed.startsWith(":::component-preview") || trimmed.startsWith(":::component-source")) {
      const isPreview = trimmed.startsWith(":::component-preview")
      const name = readDocMarkerAttribute(trimmed, "name") || (isPreview ? "component-preview" : "component-source")
      const title = readDocMarkerAttribute(trimmed, "title")
      const styleName = readDocMarkerAttribute(trimmed, "styleName") || "new-york-v4"
      const directionValue = readDocMarkerAttribute(trimmed, "direction")
      const direction = directionValue === "rtl" ? "rtl" : "ltr"
      const registryItem = loadRegistryItem(styleName, name)

      blocks.push({
        kind: isPreview ? "component-preview" : "component-source",
        text: humanizeSegment(name),
        title: title || undefined,
        name,
        styleName,
        direction,
        filePath: registryItem?.path,
        code: registryItem?.content,
      })
      index += 1
      continue
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = []
      index += 1
      while (index < lines.length) {
        const nextLine = lines[index] || ""
        if (nextLine.trim().startsWith("```")) {
          index += 1
          break
        }
        codeLines.push(nextLine)
        index += 1
      }

      blocks.push({
        kind: "code",
        text: codeLines.join("\n").trimEnd(),
      })
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({
        kind: "hr",
        text: "",
      })
      index += 1
      continue
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imageMatch) {
      blocks.push({
        kind: "image",
        text: imageMatch[1] || "",
        alt: imageMatch[1] || "",
        src: imageMatch[2] || "",
      })
      index += 1
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1]?.length || 1
      const rawTitle = headingMatch[2] || ""
      const title = cleanInlineMarkdown(rawTitle)
      const baseId = toHeadingId(title)
      const nextCount = (headingIdCounts.get(baseId) || 0) + 1
      headingIdCounts.set(baseId, nextCount)
      const id = nextCount === 1 ? baseId : `${baseId}-${nextCount}`

      blocks.push({
        kind: "heading",
        text: title,
        level,
        id,
      })

      if (level >= 2 && level <= 3) {
        headings.push({
          id,
          title,
          level,
        })
      }

      index += 1
      continue
    }

    if (/^(?:[-*+])\s+/.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length) {
        const current = (lines[index] || "").trim()
        const listMatch = current.match(/^(?:[-*+])\s+(.+)$/)
        if (!listMatch) {
          break
        }
        items.push(cleanInlineMarkdown(listMatch[1] || ""))
        index += 1
      }

      blocks.push({
        kind: "list",
        text: "",
        ordered: false,
        items,
      })
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length) {
        const current = (lines[index] || "").trim()
        const listMatch = current.match(/^\d+\.\s+(.+)$/)
        if (!listMatch) {
          break
        }
        items.push(cleanInlineMarkdown(listMatch[1] || ""))
        index += 1
      }

      blocks.push({
        kind: "list",
        text: "",
        ordered: true,
        items,
      })
      continue
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = []
      while (index < lines.length) {
        const current = (lines[index] || "").trim()
        const quoteMatch = current.match(/^>\s?(.*)$/)
        if (!quoteMatch) {
          break
        }
        quoteLines.push(quoteMatch[1] || "")
        index += 1
      }

      blocks.push({
        kind: "blockquote",
        text: cleanInlineMarkdown(quoteLines.join(" ")),
      })
      continue
    }

    const paragraphLines: string[] = [trimmed]
    index += 1
    while (index < lines.length) {
      const nextLine = lines[index] || ""
      const nextTrimmed = nextLine.trim()
      if (!nextTrimmed) {
        break
      }
      if (
        nextTrimmed.startsWith(":::") ||
        nextTrimmed.startsWith("```") ||
        /^(#{1,3})\s+/.test(nextTrimmed) ||
        /^(?:[-*+])\s+/.test(nextTrimmed) ||
        /^\d+\.\s+/.test(nextTrimmed) ||
        /^>\s?/.test(nextTrimmed) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(nextTrimmed)
      ) {
        break
      }
      paragraphLines.push(nextTrimmed)
      index += 1
    }

    blocks.push({
      kind: "paragraph",
      text: cleanInlineMarkdown(paragraphLines.join(" ")),
    })
  }

  return { headings, blocks }
}

function cleanInlineMarkdown(value: string): string {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim()
}

function toHeadingId(value: string): string {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

  return base || "section"
}

function normalizePathname(rawUrl: string): string {
  const parsed = new URL(rawUrl, "http://localhost")
  const decoded = decodeURIComponent(parsed.pathname)
  if (decoded === "/") {
    return "/"
  }
  return decoded.replace(/\/+$/, "")
}
