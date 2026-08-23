import assert from 'node:assert/strict'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const nodeModulesRoot = realpathSync(path.join(appRoot, 'node_modules'))
const appPackage = JSON.parse(readFileSync(path.join(appRoot, 'package.json'), 'utf8'))
const lockfile = readFileSync(path.join(appRoot, 'pnpm-lock.yaml'), 'utf8')
const require = createRequire(import.meta.url)

const publishedPackages = [
  { name: 'fict', section: 'dependencies' },
  { name: '@fictjs/runtime', section: 'dependencies' },
  { name: '@fictjs/ssr', section: 'dependencies' },
  { name: '@fictjs/compiler', section: 'devDependencies' },
  { name: '@fictjs/hooks', section: 'devDependencies' },
  { name: '@fictjs/vite-plugin', section: 'devDependencies' },
]

assert.doesNotMatch(
  lockfile,
  /(?:^|\s)(?:file|link|workspace):/m,
  'apps/v4 lockfile must not contain local dependency protocols',
)

const installedVersions = new Map()

for (const dependency of publishedPackages) {
  const expectedVersion = appPackage[dependency.section]?.[dependency.name]
  assert.match(
    expectedVersion || '',
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
    `${dependency.name} must use an exact published version`,
  )

  const resolvedEntry = realpathSync(require.resolve(dependency.name))
  assert.ok(
    isWithin(nodeModulesRoot, resolvedEntry),
    `${dependency.name} resolved outside apps/v4/node_modules: ${resolvedEntry}`,
  )

  const installedPackage = findPackageManifest(resolvedEntry, dependency.name)
  assert.equal(
    installedPackage.version,
    expectedVersion,
    `${dependency.name} resolved version does not match apps/v4/package.json`,
  )

  installedVersions.set(dependency.name, installedPackage.version)
  console.log(`${dependency.name}@${installedPackage.version}\t${resolvedEntry}`)
}

const coreVersion = installedVersions.get('fict')
for (const dependencyName of ['@fictjs/runtime', '@fictjs/compiler', '@fictjs/vite-plugin']) {
  assert.equal(
    installedVersions.get(dependencyName),
    coreVersion,
    `${dependencyName} must stay aligned with fict`,
  )
}

const hooksModule = await import('@fictjs/hooks')
assert.equal(typeof hooksModule.useMediaQuery, 'function')

function findPackageManifest(resolvedEntry, expectedName) {
  let currentDirectory = path.dirname(resolvedEntry)

  while (isWithin(nodeModulesRoot, currentDirectory)) {
    const packagePath = path.join(currentDirectory, 'package.json')
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
      if (packageJson.name === expectedName) {
        return packageJson
      }
    }

    const parentDirectory = path.dirname(currentDirectory)
    if (parentDirectory === currentDirectory) {
      break
    }
    currentDirectory = parentDirectory
  }

  assert.fail(`Unable to locate package.json for ${expectedName} from ${resolvedEntry}`)
}

function isWithin(parentDirectory, candidatePath) {
  const relativePath = path.relative(parentDirectory, candidatePath)
  return (
    relativePath === '' ||
    (!relativePath.startsWith(`..${path.sep}`) &&
      relativePath !== '..' &&
      !path.isAbsolute(relativePath))
  )
}
