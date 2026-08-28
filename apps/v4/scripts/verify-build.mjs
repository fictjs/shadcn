import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const clientRoot = path.join(appRoot, 'dist', 'client')
const serverEntry = path.join(appRoot, 'dist', 'server', 'entry-server.js')
const clientEntry = path.join(clientRoot, 'index.html')
const manifestPath = path.join(clientRoot, 'fict.manifest.json')
const siteBasePath = normalizeBasePath(process.env.SITE_BASE_PATH)

for (const outputPath of [clientEntry, serverEntry, manifestPath]) {
  assert.ok(existsSync(outputPath), `Missing build output: ${path.relative(appRoot, outputPath)}`)
  assert.ok(
    statSync(outputPath).size > 0,
    `Empty build output: ${path.relative(appRoot, outputPath)}`,
  )
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const manifestEntries = Object.entries(manifest)

assert.ok(
  manifestEntries.some(([key]) => key.startsWith('fict:module:')),
  'Build manifest does not contain a Fict module',
)
assert.ok(
  manifestEntries.some(([key]) => key.startsWith('virtual:fict-handler:')),
  'Build manifest does not contain resumable handlers',
)

for (const [key, assetPath] of manifestEntries) {
  assert.equal(typeof assetPath, 'string', `Manifest entry ${key} must point to a string path`)
  assert.ok(
    assetPath.startsWith(`${siteBasePath}/`),
    `Manifest entry ${key} must use the configured site base path`,
  )

  const relativeAssetPath = assetPath.slice(siteBasePath.length)
  const outputPath = path.resolve(clientRoot, `.${relativeAssetPath}`)
  assert.ok(isWithin(clientRoot, outputPath), `Manifest entry ${key} escapes dist/client`)
  assert.ok(existsSync(outputPath), `Manifest entry ${key} points to missing output ${assetPath}`)
  assert.ok(
    statSync(outputPath).size > 0,
    `Manifest entry ${key} points to empty output ${assetPath}`,
  )
}

console.log(`Verified ${manifestEntries.length} generated Fict manifest entries`)

function isWithin(parentDirectory, candidatePath) {
  const relativePath = path.relative(parentDirectory, candidatePath)
  return (
    relativePath === '' ||
    (!relativePath.startsWith(`..${path.sep}`) &&
      relativePath !== '..' &&
      !path.isAbsolute(relativePath))
  )
}

function normalizeBasePath(value) {
  if (!value || value === '/') {
    return ''
  }

  return `/${value.replace(/^\/+|\/+$/g, '')}`
}
