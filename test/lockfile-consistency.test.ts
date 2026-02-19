import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

describe('lockfile consistency', () => {
  it('keeps pnpm-lock importer specifiers in sync with package.json', async () => {
    const packageJsonRaw = await readFile(new URL('../package.json', import.meta.url), 'utf8')
    const lockRaw = await readFile(new URL('../pnpm-lock.yaml', import.meta.url), 'utf8')

    const packageJson = JSON.parse(packageJsonRaw) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }

    const parsed = parseRootImporterSpecifiers(lockRaw)

    expect(parsed.dependencies).toEqual(packageJson.dependencies ?? {})
    expect(parsed.devDependencies).toEqual(packageJson.devDependencies ?? {})
  })
})

function parseRootImporterSpecifiers(lockRaw: string): {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
} {
  const lines = lockRaw.split(/\r?\n/)
  const dependencies: Record<string, string> = {}
  const devDependencies: Record<string, string> = {}

  let inRootImporter = false
  let section: 'dependencies' | 'devDependencies' | null = null
  let currentPackageName: string | null = null

  for (const line of lines) {
    if (!inRootImporter) {
      if (line === '  .:') {
        inRootImporter = true
      }
      continue
    }

    if (line === 'packages:' || line === 'snapshots:') {
      break
    }

    if (/^\s{2}\S.*:$/.test(line) && line !== '  .:') {
      break
    }

    if (line === '    dependencies:') {
      section = 'dependencies'
      currentPackageName = null
      continue
    }

    if (line === '    devDependencies:') {
      section = 'devDependencies'
      currentPackageName = null
      continue
    }

    if (/^\s{4}\S.*:$/.test(line) && !/^\s{4}(dependencies|devDependencies):$/.test(line)) {
      section = null
      currentPackageName = null
      continue
    }

    const packageMatch = line.match(/^\s{6}(.+):$/)
    if (section && packageMatch) {
      currentPackageName = stripYamlQuotes(packageMatch[1].trim())
      continue
    }

    const specifierMatch = line.match(/^\s{8}specifier: (.+)$/)
    if (section && currentPackageName && specifierMatch) {
      const specifier = specifierMatch[1].trim()
      if (section === 'dependencies') {
        dependencies[currentPackageName] = specifier
      } else {
        devDependencies[currentPackageName] = specifier
      }
      currentPackageName = null
    }
  }

  return { dependencies, devDependencies }
}

function stripYamlQuotes(value: string): string {
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1)
  }

  return value
}
