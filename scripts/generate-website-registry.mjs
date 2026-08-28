import fs from 'node:fs'
import path from 'node:path'
import { stdout } from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  extractFictRegistryDependencies,
  extractFictRegistryExports,
  loadFictExampleSource,
  validateFictRegistryImports,
} from './lib/fict-example-source.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distEntryPath = path.join(rootDir, 'dist/index.js')
const outputRoot = path.join(rootDir, 'apps/v4/public/r/fict')
const previewCatalogPath = path.join(rootDir, 'apps/v4/content/docs/components/fict/preview-catalog.json')
const exampleSourceRoot = path.join(rootDir, 'apps/v4/content/examples/fict')

if (!fs.existsSync(distEntryPath)) {
  throw new Error('dist/index.js not found. Run `pnpm build` before generating the website registry.')
}

const registry = await import(distEntryPath)
const config = {
  ...registry.DEFAULT_CONFIG,
  aliases: { base: '@' },
}

const entries = [
  ...registry.listBuiltinComponentNames().map(name => registry.getBuiltinComponent(name)),
  ...registry.listBuiltinBlockNames().map(name => registry.getBuiltinBlock(name)),
  ...registry.listBuiltinThemeNames().map(name => registry.getBuiltinTheme(name)),
].filter(Boolean)
const previewCatalog = fs.existsSync(previewCatalogPath)
  ? JSON.parse(fs.readFileSync(previewCatalogPath, 'utf8'))
  : {}
const entriesByName = new Map(entries.map(entry => [entry.name, entry]))
const registryExports = new Map(
  entries
    .filter(entry => entry.type === 'ui-component')
    .map(entry => [
      entry.name,
      extractFictRegistryExports(
        registry.renderRegistryEntryFiles(entry, config).map(file => file.content).join('\n'),
      ),
    ]),
)

fs.rmSync(outputRoot, { recursive: true, force: true })

for (const entry of entries) {
  const files = registry.renderRegistryEntryFiles(entry, config).map(file => ({
    path: file.relativePath,
    content: file.content,
    type: file.relativePath.endsWith('.tsx')
      ? 'registry:ui'
      : file.relativePath.endsWith('.css')
        ? 'registry:style'
        : 'registry:lib',
  }))
  const payload = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: entry.name,
    type:
      entry.type === 'ui-component'
        ? 'registry:ui'
        : entry.type === 'block'
          ? 'registry:block'
          : 'registry:style',
    description: entry.description,
    dependencies: entry.dependencies,
    registryDependencies: entry.registryDependencies,
    files,
  }
  const outputPath = path.join(outputRoot, `${entry.name}.json`)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

const previews = new Map()
for (const [componentName, previewNames] of Object.entries(previewCatalog)) {
  for (const previewName of previewNames) {
    if (!previews.has(previewName)) previews.set(previewName, componentName)
  }
}

for (const [previewName, componentName] of previews) {
    const content = loadFictExampleSource({
      exampleRoot: exampleSourceRoot,
      componentName,
      previewName,
    })
    if (!content) {
      throw new Error(`Missing curated Fict example source for ${componentName}/${previewName}.`)
    }
    validateFictRegistryImports(content, registryExports, `${componentName}/${previewName}`)
    const entry = entriesByName.get(componentName)
    const payload = {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name: previewName,
      type: 'registry:example',
      description: `${entry?.description ?? componentName} example for Fict`,
      dependencies: [],
      registryDependencies: extractFictRegistryDependencies(content),
      files: [{ path: `src/examples/${previewName}.tsx`, content, type: 'registry:page' }],
    }
    fs.writeFileSync(path.join(outputRoot, `${previewName}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

const index = entries.map(entry => ({
  name: entry.name,
  type: entry.type,
  description: entry.description,
}))
fs.writeFileSync(path.join(outputRoot, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8')

stdout.write(`Generated ${entries.length} registry entries and ${previews.size} Fict examples in ${path.relative(rootDir, outputRoot)}\n`)
