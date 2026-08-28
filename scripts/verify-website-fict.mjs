import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docsRoot = path.join(rootDir, 'apps/v4/content/docs')
const registryRoot = path.join(rootDir, 'apps/v4/public/r/fict')
const legacyPublicRoot = path.join(rootDir, 'apps/v4/public/r/styles')
const siteSourceRoot = path.join(rootDir, 'apps/v4/src')
const registrySourceRoot = path.join(rootDir, 'apps/v4/registry')

const forbiddenCode = [
  /from\s+["']react["']/,
  /import\s+\*\s+as\s+React/,
  /\bReact\./,
  /["']use client["']/,
  /from\s+["']radix-ui["']/,
  /npm install radix-ui/,
]

for (const filePath of walkFiles(docsRoot).filter(file => file.endsWith('.mdx'))) {
  assertFictSource(filePath)
}
for (const filePath of walkFiles(registryRoot).filter(file => file.endsWith('.json'))) {
  assertFictSource(filePath)
}
for (const filePath of walkFiles(siteSourceRoot).filter(file => /\.[cm]?[jt]sx?$/.test(file))) {
  assertFictSource(filePath)
}

const legacyJson = walkFiles(legacyPublicRoot).filter(file => file.endsWith('.json'))
assert.deepEqual(legacyJson, [], 'Legacy React registry JSON must not be published by the website.')

const allowedRegistrySources = new Set([
  '_legacy-base-colors.ts',
  '_legacy-colors.ts',
  '__blocks__.json',
  'themes.ts',
])
for (const filePath of walkFiles(registrySourceRoot)) {
  const relativePath = path.relative(registrySourceRoot, filePath).replaceAll('\\', '/')
  assert.ok(allowedRegistrySources.has(relativePath), `Unexpected legacy website registry source: ${relativePath}`)
}

const previewNames = new Set()
for (const filePath of walkFiles(docsRoot).filter(file => file.endsWith('.mdx'))) {
  const source = fs.readFileSync(filePath, 'utf8')
  for (const match of source.matchAll(/<ComponentPreview[\s\S]*?name="([^"]+)"[\s\S]*?\/>/g)) {
    previewNames.add(match[1])
    const registryPath = path.join(registryRoot, `${match[1]}.json`)
    assert.ok(fs.existsSync(registryPath), `Missing Fict source for documentation preview ${match[1]}`)
  }
}

const staleRoutes = ['/docs/directory', '/docs/mcp', '/docs/forms', '/docs/changelog', '/docs/components/radix', '/docs/components/base']
for (const filePath of [...walkFiles(docsRoot), ...walkFiles(siteSourceRoot)]) {
  if (!/\.(?:mdx|[cm]?[jt]sx?)$/.test(filePath)) continue
  const source = fs.readFileSync(filePath, 'utf8')
  for (const route of staleRoutes) {
    assert.ok(!source.includes(route), `Stale React documentation route ${route} in ${path.relative(rootDir, filePath)}`)
  }
}

const registryIndex = JSON.parse(fs.readFileSync(path.join(registryRoot, 'index.json'), 'utf8'))
const expectedRegistryFiles = new Set(['index.json'])
for (const entry of registryIndex) expectedRegistryFiles.add(`${entry.name}.json`)
for (const previewName of previewNames) expectedRegistryFiles.add(`${previewName}.json`)
const actualRegistryFiles = walkFiles(registryRoot)
  .filter(file => file.endsWith('.json'))
  .map(file => path.relative(registryRoot, file).replaceAll('\\', '/'))
assert.deepEqual(actualRegistryFiles.sort(), Array.from(expectedRegistryFiles).sort(), 'Generated Fict registry file set is stale.')

console.log('Verified Fict-only website documentation and registry sources')

function assertFictSource(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  for (const pattern of forbiddenCode) {
    assert.ok(!pattern.test(source), `React source pattern ${pattern} found in ${path.relative(rootDir, filePath)}`)
  }
}

function walkFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) return []
  const files = []
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(entryPath))
    else files.push(entryPath)
  }
  return files
}
