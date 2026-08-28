import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distEntryPath = path.join(rootDir, 'dist/index.js')
const outputRoot = path.join(rootDir, 'apps/v4/public/r/fict')
const previewCatalogPath = path.join(rootDir, 'apps/v4/content/docs/components/fict/preview-catalog.json')

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

for (const entry of entries.filter(candidate => candidate.type === 'ui-component' && !['is-mobile', 'utils'].includes(candidate.name))) {
  const previews = previewCatalog[entry.name]?.length
    ? previewCatalog[entry.name]
    : [`${entry.name}-demo`]
  for (const previewName of previews) {
    const componentName = toIdentifier(entry.name)
    const exampleName = `${toIdentifier(previewName)}Example`
    const content = `import * as UI from '@/components/ui/${entry.name}'

export default function ${exampleName}() {
  return ${getExampleMarkup(entry.name, previewName, componentName)}
}
`
    const payload = {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name: previewName,
      type: 'registry:example',
      description: `${entry.description} example for Fict`,
      dependencies: [],
      registryDependencies: [entry.name],
      files: [{ path: `src/examples/${previewName}.tsx`, content, type: 'registry:page' }],
    }
    fs.writeFileSync(path.join(outputRoot, `${previewName}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  }
}

const index = entries.map(entry => ({
  name: entry.name,
  type: entry.type,
  description: entry.description,
}))
fs.writeFileSync(path.join(outputRoot, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8')

console.log(`Generated ${entries.length} Fict website registry entries in ${path.relative(rootDir, outputRoot)}`)

function toIdentifier(value) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
    .replace(/Otp/g, 'OTP')
}

function getExampleMarkup(componentName, previewName, exportName) {
  if (componentName === 'button') {
    const variant = ['destructive', 'outline', 'secondary', 'ghost', 'link'].find(value => previewName.includes(value))
    const size = ['sm', 'lg', 'icon'].find(value => previewName.endsWith(`-${value}`) || previewName.includes(`-${value}-`))
    const props = [variant ? `variant='${variant}'` : '', size ? `size='${size}'` : ''].filter(Boolean).join(' ')
    return `<UI.${exportName}${props ? ` ${props}` : ''}>Button</UI.${exportName}>`
  }
  if (previewName.includes('disabled')) {
    return `<UI.${exportName} disabled />`
  }
  return `<UI.${exportName} />`
}
