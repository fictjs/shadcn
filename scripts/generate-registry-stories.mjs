import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distEntryPath = path.join(rootDir, 'dist/index.js')
const outputPath = path.join(rootDir, 'stories/registry-builtins.stories.jsx')

if (!fs.existsSync(distEntryPath)) {
  throw new Error('dist/index.js not found. Run `pnpm build` before generating Storybook registry stories.')
}

const registryModule = await import(distEntryPath)
const componentNames = registryModule.listBuiltinComponentNames()
const blockNames = registryModule.listBuiltinBlockNames()
const themeNames = registryModule.listBuiltinThemeNames()

function toExportIdentifier(prefix, name, used) {
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

const usedIdentifiers = new Set()
const storyExports = []

for (const name of componentNames) {
  storyExports.push({ identifier: toExportIdentifier('Component', name, usedIdentifiers), kind: 'component', name })
}
for (const name of blockNames) {
  storyExports.push({ identifier: toExportIdentifier('Block', name, usedIdentifiers), kind: 'block', name })
}
for (const name of themeNames) {
  storyExports.push({ identifier: toExportIdentifier('Theme', name, usedIdentifiers), kind: 'theme', name })
}

const lines = []
lines.push('/** @jsxImportSource fict */')
lines.push('')
lines.push("import { DEFAULT_CONFIG } from '../src/core/constants'")
lines.push("import { builtinBlocks, builtinComponents, builtinThemes } from '../src/registry/builtin'")
lines.push('')
lines.push("import { renderFict } from './render-fict'")
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
lines.push('const templateContext = {')
lines.push('  config: DEFAULT_CONFIG,')
lines.push('  imports: {')
lines.push("    cn: '@/lib/cn',")
lines.push("    variants: '@/lib/variants',")
lines.push('  },')
lines.push("  aliasFor: relativePath => '@/' + relativePath,")
lines.push("  uiImport: componentName => '@/components/ui/' + componentName,")
lines.push('}')
lines.push('')
lines.push('const entryRegistry = {')
lines.push("  component: new Map(builtinComponents.map(entry => [entry.name, entry])),")
lines.push("  block: new Map(builtinBlocks.map(entry => [entry.name, entry])),")
lines.push("  theme: new Map(builtinThemes.map(entry => [entry.name, entry])),")
lines.push('}')
lines.push('')
lines.push('function getRegistryEntry(kind, name) {')
lines.push('  const entry = entryRegistry[kind].get(name)')
lines.push('  if (!entry) {')
lines.push("    throw new Error('Unknown registry entry: ' + kind + '/' + name)")
lines.push('  }')
lines.push('  return entry')
lines.push('}')
lines.push('')
lines.push('function renderRegistryEntry(kind, name) {')
lines.push('  const entry = getRegistryEntry(kind, name)')
lines.push('  const files = entry.files.map(file => ({')
lines.push('    path: file.path,')
lines.push('    content: file.content(templateContext),')
lines.push('  }))')
lines.push('')
lines.push('  return renderFict(() => (')
lines.push("    <div class='min-h-screen w-full bg-background p-6 text-foreground'>")
lines.push("      <div class='mx-auto grid w-full max-w-6xl gap-4'>")
lines.push("        <header class='rounded-lg border bg-card p-4'>")
lines.push("          <p class='text-xs uppercase tracking-wider text-muted-foreground'>{kind}</p>")
lines.push("          <h1 class='mt-1 text-xl font-semibold'>{entry.name}</h1>")
lines.push("          <p class='mt-1 text-sm text-muted-foreground'>{entry.description}</p>")
lines.push("          <div class='mt-3 flex flex-wrap gap-2'>")
lines.push("            <span class='rounded border px-2 py-1 text-xs'>version: {entry.version}</span>")
lines.push("            <span class='rounded border px-2 py-1 text-xs'>files: {files.length}</span>")
lines.push("            <span class='rounded border px-2 py-1 text-xs'>deps: {entry.dependencies.length}</span>")
lines.push("            <span class='rounded border px-2 py-1 text-xs'>registry deps: {entry.registryDependencies.length}</span>")
lines.push('          </div>')
lines.push('        </header>')
lines.push('')
lines.push('        {files.map(file => (')
lines.push("          <section class='overflow-hidden rounded-lg border bg-card'>")
lines.push("            <div class='border-b px-4 py-2 text-xs text-muted-foreground'>{file.path}</div>")
lines.push("            <pre class='max-h-[500px] overflow-auto p-4 text-xs leading-relaxed'>")
lines.push('              <code>{file.content}</code>')
lines.push('            </pre>')
lines.push('          </section>')
lines.push('        ))}')
lines.push('      </div>')
lines.push('    </div>')
lines.push('  ))')
lines.push('}')
lines.push('')
lines.push('function createRegistryStory(kind, name) {')
lines.push('  return {')
lines.push("    name: kind + '/' + name,")
lines.push('    render: () => renderRegistryEntry(kind, name),')
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

fs.writeFileSync(outputPath, lines.join('\n'))
