import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const clientRoot = path.join(appRoot, 'dist', 'client')
const staticRoot = path.join(appRoot, 'dist', 'static')
const serverEntry = path.join(appRoot, 'dist', 'server', 'entry-server.js')
const clientEntry = path.join(clientRoot, 'index.html')
const manifestPath = path.join(clientRoot, 'fict.manifest.json')

for (const outputPath of [clientEntry, serverEntry, manifestPath]) {
  assert.ok(existsSync(outputPath), `Missing build output: ${path.relative(appRoot, outputPath)}`)
}

globalThis.__FICT_SSR_BASE__ = appRoot
globalThis.__FICT_MANIFEST__ = JSON.parse(readFileSync(manifestPath, 'utf8'))

const template = readFileSync(clientEntry, 'utf8')
assert.ok(template.includes('__APP_HEAD__'), 'Client template is missing __APP_HEAD__')
assert.ok(template.includes('__APP_HTML__'), 'Client template is missing __APP_HTML__')

const { getStaticRoutes, render } = await import(pathToFileURL(serverEntry).href)
const routes = getStaticRoutes()

rmSync(staticRoot, { recursive: true, force: true })
cpSync(clientRoot, staticRoot, { recursive: true })

for (const route of routes) {
  const result = render(route)
  assert.equal(result.status, 200, `Static route did not render successfully: ${route}`)
  writeRoute(route, renderDocument(result))
}

const notFound = render('/404')
assert.equal(notFound.status, 404, 'The static 404 route must return a 404 result')
writeFileSync(path.join(staticRoot, '404.html'), renderDocument(notFound))
writeFileSync(path.join(staticRoot, '.nojekyll'), '')

const escapedRootReference = /(?:href|src|action)=["']\/(?!\/|shadcn(?:\/|["']))/
for (const route of routes) {
  const html = readFileSync(routeOutputPath(route), 'utf8')
  assert.ok(
    !escapedRootReference.test(html),
    `Static route contains an unscoped root path: ${route}`,
  )
}

console.log(`Exported ${routes.length} static routes to ${path.relative(appRoot, staticRoot)}`)

function renderDocument(result) {
  return template
    .replace('__APP_HEAD__', `<title>${escapeHtml(result.title)}</title>`)
    .replace('__APP_HTML__', () => result.html)
}

function writeRoute(route, html) {
  const outputPath = routeOutputPath(route)
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, html)
}

function routeOutputPath(route) {
  if (route === '/') {
    return path.join(staticRoot, 'index.html')
  }

  const segments = route.split('/').filter(Boolean)
  return path.join(staticRoot, ...segments, 'index.html')
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
