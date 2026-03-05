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
    description: "Task and issue tracker built with table, filters, and status-driven UI patterns.",
    imageLight: "/examples/tasks-light.png",
    imageDark: "/examples/tasks-dark.png",
  },
  {
    slug: "playground",
    title: "Playground",
    description: "Prompt playground interface with presets, tabs, and advanced form controls.",
    imageLight: "/examples/playground-light.png",
    imageDark: "/examples/playground-dark.png",
  },
  {
    slug: "authentication",
    title: "Authentication",
    description: "Authentication screen composition with split panels and production-ready form patterns.",
    imageLight: "/examples/authentication-light.png",
    imageDark: "/examples/authentication-dark.png",
  },
  {
    slug: "rtl",
    title: "RTL",
    description: "Right-to-left interface examples and direction-aware component behavior.",
    imageLight: "/examples/cards-light.png",
    imageDark: "/examples/cards-dark.png",
  },
]
const chartTypeOrder = ["area", "bar", "line", "pie", "radar", "radial", "tooltip"]
const featuredBlockNames = ["dashboard-01", "sidebar-07", "sidebar-03", "login-03", "login-04"]

let cachedCatalog: SiteCatalog | null = null

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

  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    const slug = pathname === "/docs" ? "" : pathname.slice("/docs/".length)
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
  return body
    .replace(/^import\s+.*$/gm, "")
    .replace(/^export\s+const\s+.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
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
