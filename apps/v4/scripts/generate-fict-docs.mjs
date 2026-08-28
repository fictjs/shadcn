import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const componentsRoot = path.join(appRoot, 'content/docs/components')
const legacyDocsRoot = path.join(componentsRoot, 'radix')
const outputRoot = path.join(componentsRoot, 'fict')
const previewCatalogPath = path.join(outputRoot, 'preview-catalog.json')
const registryRoot = path.join(appRoot, 'public/r/fict')
const registryIndex = JSON.parse(fs.readFileSync(path.join(registryRoot, 'index.json'), 'utf8'))

fs.mkdirSync(outputRoot, { recursive: true })

let previewCatalog = {}
if (fs.existsSync(previewCatalogPath)) {
  previewCatalog = JSON.parse(fs.readFileSync(previewCatalogPath, 'utf8'))
} else if (fs.existsSync(legacyDocsRoot)) {
  for (const fileName of fs.readdirSync(legacyDocsRoot).filter(name => name.endsWith('.mdx'))) {
    const name = fileName.slice(0, -4)
    const source = fs.readFileSync(path.join(legacyDocsRoot, fileName), 'utf8')
    previewCatalog[name] = Array.from(source.matchAll(/<ComponentPreview[\s\S]*?name="([^"]+)"[\s\S]*?\/>/g), match => match[1])
  }
}

fs.writeFileSync(previewCatalogPath, `${JSON.stringify(previewCatalog, null, 2)}\n`, 'utf8')

const components = registryIndex
  .filter(entry => entry.type === 'ui-component')
  .map(entry => {
    const payload = JSON.parse(fs.readFileSync(path.join(registryRoot, `${entry.name}.json`), 'utf8'))
    return { ...entry, payload }
  })
  .filter(entry => entry.payload.files.some(file => file.path.startsWith('src/components/ui/')))
  .sort((left, right) => left.name.localeCompare(right.name))

const generatedNames = new Set(components.map(entry => `${entry.name}.mdx`))
for (const fileName of fs.readdirSync(outputRoot)) {
  if (fileName.endsWith('.mdx') && !generatedNames.has(fileName)) {
    fs.rmSync(path.join(outputRoot, fileName))
  }
}

for (const entry of components) {
  const title = humanize(entry.name)
  const previews = Array.from(new Set(
    previewCatalog[entry.name]?.length
      ? previewCatalog[entry.name]
      : [`${entry.name}-demo`],
  ))
  const dependencies = entry.payload.dependencies ?? []
  const dependencyStep = dependencies.length
    ? `\n<Step>Install the runtime dependencies:</Step>\n\n\`\`\`bash\nnpm install ${dependencies.join(' ')}\n\`\`\`\n`
    : ''
  const examples = previews
    .slice(1)
    .map(name => `### ${humanize(name.replace(new RegExp(`^${escapeRegExp(entry.name)}-?`), ''))}\n\n<ComponentPreview name="${name}" />`)
    .join('\n\n')
  const examplesSection = examples ? `## Examples\n\n${examples}` : ''

  const source = `---
title: ${title}
description: ${entry.description}
component: true
---

<ComponentPreview name="${previews[0]}" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

\`\`\`bash
npx @fictjs/shadcn@latest add ${entry.name}
\`\`\`

</TabsContent>
<TabsContent value="manual">

<Steps>
${dependencyStep}
<Step>Copy the Fict shadcn component into your project.</Step>

<ComponentSource name="${entry.name}" title="components/ui/${entry.name}.tsx" />

</Steps>

</TabsContent>
</CodeTabs>

## Usage

\`\`\`tsx
import * as ${toIdentifier(title)} from "@/components/ui/${entry.name}"
\`\`\`

${examplesSection}
`
  fs.writeFileSync(path.join(outputRoot, `${entry.name}.mdx`), source.replace(/\n{2,}$/, '\n'), 'utf8')
}

fs.writeFileSync(
  path.join(outputRoot, 'meta.json'),
  `${JSON.stringify({ title: 'Fict shadcn', pages: components.map(entry => entry.name) }, null, 2)}\n`,
  'utf8',
)

console.log(`Generated ${components.length} Fict component documentation pages`)

function humanize(value) {
  const normalized = value.replace(/[-_]+/g, ' ').trim()
  return normalized ? normalized.replace(/\b\w/g, character => character.toUpperCase()) : 'Example'
}

function toIdentifier(value) {
  return value.replace(/[^a-zA-Z0-9]+/g, '') || 'Component'
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
