import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distEntryPath = path.join(rootDir, 'dist/index.js')
const outputPath = path.join(rootDir, 'stories/registry-builtins.stories.jsx')
const runtimeRoot = path.join(rootDir, 'stories/generated/runtime')

if (!fs.existsSync(distEntryPath)) {
  throw new Error('dist/index.js not found. Run `pnpm build` before generating Storybook registry stories.')
}

const registryModule = await import(distEntryPath)
const componentNames = registryModule.listBuiltinComponentNames().sort((left, right) => left.localeCompare(right))
const blockNames = registryModule.listBuiltinBlockNames().sort((left, right) => left.localeCompare(right))
const themeNames = registryModule.listBuiltinThemeNames().sort((left, right) => left.localeCompare(right))

function toIdentifier(prefix, name, used) {
  const base = name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  let id = `${prefix}${base || 'Entry'}`
  if (/^[0-9]/.test(id)) {
    id = `_${id}`
  }

  if (!used.has(id)) {
    used.add(id)
    return id
  }

  let index = 2
  while (used.has(`${id}${index}`)) {
    index += 1
  }

  const uniqueId = `${id}${index}`
  used.add(uniqueId)
  return uniqueId
}

function ensurePosixPath(value) {
  return value.replace(/\\/g, '/')
}

function ensureDir(targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
}

function writeFile(targetPath, content) {
  ensureDir(targetPath)
  fs.writeFileSync(targetPath, content, 'utf8')
}

function collectAllRegistryEntries() {
  const allEntries = new Map()
  const saveEntry = entry => {
    const key = `${entry.type}:${entry.name}`
    allEntries.set(key, entry)
  }

  for (const name of componentNames) {
    for (const entry of registryModule.resolveBuiltinComponentGraph([name])) {
      saveEntry(entry)
    }
  }

  for (const name of blockNames) {
    for (const entry of registryModule.resolveBuiltinBlockGraph([name])) {
      saveEntry(entry)
    }
  }

  for (const name of themeNames) {
    const entry = registryModule.getBuiltinTheme(name)
    if (entry) {
      saveEntry(entry)
    }
  }

  return [...allEntries.values()]
}

function pickPrimaryFile(entry, renderedFiles) {
  const preferredPrefixes =
    entry.type === 'ui-component'
      ? ['src/components/ui/', 'src/lib/hooks/', 'src/lib/']
      : entry.type === 'block'
        ? ['src/components/blocks/']
        : ['src/styles/themes/']

  for (const prefix of preferredPrefixes) {
    const match = renderedFiles.find(file => file.relativePath.startsWith(prefix))
    if (match) return match
  }

  const tsx = renderedFiles.find(file => file.relativePath.endsWith('.tsx'))
  if (tsx) return tsx
  const ts = renderedFiles.find(file => file.relativePath.endsWith('.ts'))
  if (ts) return ts
  return renderedFiles[0]
}

const runtimeConfig = {
  ...registryModule.DEFAULT_CONFIG,
  componentsDir: 'src/components/ui',
  libDir: 'src/lib',
  css: 'src/styles/globals.css',
  tailwindConfig: 'tailwind.config.cjs',
  aliases: {
    base: '@',
  },
}

fs.rmSync(runtimeRoot, { recursive: true, force: true })

const entries = collectAllRegistryEntries()
for (const entry of entries) {
  const renderedFiles = registryModule.renderRegistryEntryFiles(entry, runtimeConfig)
  for (const file of renderedFiles) {
    writeFile(path.join(runtimeRoot, file.relativePath), file.content)
  }
}

writeFile(
  path.join(runtimeRoot, 'src/lib/cn.ts'),
  `import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: unknown[]): string {
  return twMerge(clsx(inputs))
}
`,
)

const templateContext = {
  config: runtimeConfig,
  imports: {
    cn: '@/lib/cn',
    variants: '@/lib/variants',
  },
  aliasFor: relativePath => '@/' + relativePath,
  uiImport: componentName => '@/components/ui/' + componentName,
}

const usedIds = new Set()
const importLines = []
const moduleMapLines = {
  component: [],
  block: [],
}
const themeImportLines = []
const storyExports = []

for (const name of componentNames) {
  const entry = registryModule.getBuiltinComponent(name)
  if (!entry) continue
  const rendered = registryModule.renderRegistryEntryFiles(entry, runtimeConfig)
  const primary = pickPrimaryFile(entry, rendered)
  const importId = toIdentifier('ComponentModule', name, usedIds)
  const importPath = './generated/runtime/' + ensurePosixPath(primary.relativePath)
  importLines.push(`import * as ${importId} from '${importPath}'`)
  moduleMapLines.component.push(`    '${name}': ${importId},`)
  storyExports.push({ identifier: toIdentifier('Component', name, usedIds), kind: 'component', name })
}

for (const name of blockNames) {
  const entry = registryModule.getBuiltinBlock(name)
  if (!entry) continue
  const rendered = registryModule.renderRegistryEntryFiles(entry, runtimeConfig)
  const primary = pickPrimaryFile(entry, rendered)
  const importId = toIdentifier('BlockModule', name, usedIds)
  const importPath = './generated/runtime/' + ensurePosixPath(primary.relativePath)
  importLines.push(`import * as ${importId} from '${importPath}'`)
  moduleMapLines.block.push(`    '${name}': ${importId},`)
  storyExports.push({ identifier: toIdentifier('Block', name, usedIds), kind: 'block', name })
}

for (const name of themeNames) {
  const entry = registryModule.getBuiltinTheme(name)
  if (!entry) continue
  const rendered = registryModule.renderRegistryEntryFiles(entry, runtimeConfig)
  const primary = pickPrimaryFile(entry, rendered)
  const importPath = './generated/runtime/' + ensurePosixPath(primary.relativePath)
  themeImportLines.push(`import '${importPath}'`)
  storyExports.push({ identifier: toIdentifier('Theme', name, usedIds), kind: 'theme', name })
}

const lines = []
lines.push('/** @jsxImportSource fict */')
lines.push('')
lines.push("import { renderRegistryEntryPreview } from './registry-runtime-preview'")
lines.push('')
lines.push(...importLines.sort((left, right) => left.localeCompare(right)))
lines.push('')
lines.push(...themeImportLines.sort((left, right) => left.localeCompare(right)))
lines.push('')
lines.push('const liveModules = {')
lines.push('  component: {')
lines.push(...moduleMapLines.component.sort((left, right) => left.localeCompare(right)))
lines.push('  },')
lines.push('  block: {')
lines.push(...moduleMapLines.block.sort((left, right) => left.localeCompare(right)))
lines.push('  },')
lines.push('}')
lines.push('')
lines.push('const meta = {')
lines.push("  title: 'Fict Shadcn/Builtin Registry',")
lines.push('  parameters: {')
lines.push("    layout: 'fullscreen',")
lines.push('  },')
lines.push('}')
lines.push('')
lines.push('export default meta')
lines.push('')
lines.push('function createRegistryStory(kind, name) {')
lines.push('  return {')
lines.push("    name: kind + '/' + name,")
lines.push('    render: () => renderRegistryEntryPreview(kind, name, liveModules),')
lines.push('  }')
lines.push('}')
lines.push('')
for (const entry of storyExports) {
  lines.push(`export const ${entry.identifier} = createRegistryStory('${entry.kind}', '${entry.name}')`)
}
lines.push('')
lines.push('export const __namedExportsOrder = [')
for (const entry of storyExports) {
  lines.push(`  '${entry.identifier}',`)
}
lines.push(']')
lines.push('')

writeFile(outputPath, lines.join('\n'))

const previewMetaPath = path.join(rootDir, 'stories/generated/runtime/.generated-meta.json')
writeFile(
  previewMetaPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      entries: {
        components: componentNames.length,
        blocks: blockNames.length,
        themes: themeNames.length,
      },
      runtimeFiles: entries.length,
      templateContext,
    },
    null,
    2,
  )}\n`,
)
