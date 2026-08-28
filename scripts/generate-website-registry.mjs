import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distEntryPath = path.join(rootDir, 'dist/index.js')
const outputRoot = path.join(rootDir, 'apps/v4/public/r/fict')

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

const index = entries.map(entry => ({
  name: entry.name,
  type: entry.type,
  description: entry.description,
}))
fs.writeFileSync(path.join(outputRoot, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8')

console.log(`Generated ${entries.length} Fict website registry entries in ${path.relative(rootDir, outputRoot)}`)
