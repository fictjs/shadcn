import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { BlockEntry, DocPage, DocSummary, ResolvedRoute, ThemeEntry } from "./types"

interface SiteCatalog {
  docs: DocSummary[]
  docsBySlug: Map<string, DocPage>
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

let cachedCatalog: SiteCatalog | null = null

export function resolveRoute(rawUrl: string): ResolvedRoute {
  const catalog = getSiteCatalog()
  const pathname = normalizePathname(rawUrl)
  const basePayload = {
    docs: catalog.docs,
    doc: null,
    components: catalog.components,
    examples: catalog.examples,
    charts: catalog.charts,
    blocks: catalog.blocks,
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

  if (pathname === "/docs") {
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
    return {
      kind: doc ? "docs-detail" : "not-found",
      status: doc ? 200 : 404,
      pathname,
      pageTitle: doc ? `${doc.title} - Docs - @fictjs/shadcn` : "Not Found - @fictjs/shadcn",
      docs: catalog.docs,
      doc,
      components: catalog.components,
      examples: catalog.examples,
      charts: catalog.charts,
      blocks: catalog.blocks,
      themes: catalog.themes,
    }
  }

  if (pathname === "/components") {
    return {
      kind: "components",
      status: 200,
      pathname,
      pageTitle: "Components - @fictjs/shadcn",
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

  if (pathname === "/charts") {
    return {
      kind: "charts",
      status: 200,
      pathname,
      pageTitle: "Charts - @fictjs/shadcn",
      ...basePayload,
    }
  }

  if (pathname === "/blocks") {
    return {
      kind: "blocks",
      status: 200,
      pathname,
      pageTitle: "Blocks - @fictjs/shadcn",
      ...basePayload,
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

  const catalog: SiteCatalog = {
    docs: summaries,
    docsBySlug,
    components: loadComponents(),
    examples: loadExamples(),
    charts: loadCharts(),
    blocks: loadBlocks(),
    themes: loadThemes(),
  }

  cachedCatalog = catalog
  return catalog
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
    if (!slug) {
      continue
    }

    const raw = fs.readFileSync(filePath, "utf8")
    const { frontmatter, body } = parseFrontmatter(raw)
    const title = frontmatter.title || slug
    const description = frontmatter.description || ""
    const section = slug.includes("/") ? slug.split("/")[0] : "overview"

    docs.push({
      slug,
      title,
      description,
      section,
      body: normalizeMdxBody(body),
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

function normalizePathname(rawUrl: string): string {
  const parsed = new URL(rawUrl, "http://localhost")
  const decoded = decodeURIComponent(parsed.pathname)
  if (decoded === "/") {
    return "/"
  }
  return decoded.replace(/\/+$/, "")
}
