import fs from 'node:fs'
import path from 'node:path'

const segmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function loadFictExampleSource({ exampleRoot, componentName, previewName }) {
  assertSafeSegment(componentName, 'component name')
  assertSafeSegment(previewName, 'preview name')

  const directSourcePath = path.join(exampleRoot, componentName, `${previewName}.tsx`)
  const sourcePaths = fs.existsSync(directSourcePath)
    ? [directSourcePath]
    : findSharedSourcePaths(exampleRoot, previewName)
  if (sourcePaths.length === 0) {
    return null
  }
  if (sourcePaths.length > 1) {
    throw new Error(`Multiple curated sources found for ${previewName}: ${sourcePaths.join(', ')}`)
  }

  const [sourcePath] = sourcePaths
  const content = fs.readFileSync(sourcePath, 'utf8').trimEnd()
  validateFictExampleSource(content, sourcePath)
  return `${content}\n`
}

export function extractFictRegistryDependencies(content) {
  const dependencies = new Set()
  for (const match of content.matchAll(/\bfrom\s+["']@\/components\/ui\/([^"']+)["']/g)) {
    dependencies.add(match[1])
  }
  return [...dependencies].sort()
}

export function extractFictRegistryExports(content) {
  const exports = new Set()
  for (const match of content.matchAll(/\bexport\s+(?:default\s+)?(?:function|const|class|interface|type)\s+([A-Za-z_$][\w$]*)|\bexport\s*\{([^}]+)\}/g)) {
    if (match[1]) exports.add(match[1])
    if (!match[2]) continue
    for (const specifier of match[2].split(',')) {
      const names = specifier.trim().replace(/^type\s+/, '').split(/\s+as\s+/)
      const exportedName = names.at(-1)?.trim()
      if (exportedName) exports.add(exportedName)
    }
  }
  return exports
}

export function validateFictRegistryImports(content, registryExports, sourcePath = 'Fict example source') {
  for (const match of content.matchAll(/\bimport\s*\{([^}]+)\}\s*from\s*["']@\/components\/ui\/([^"']+)["']/g)) {
    const [, specifiers, componentName] = match
    const availableExports = registryExports.get(componentName)
    if (!availableExports) {
      throw new Error(`${sourcePath} imports unknown registry component: ${componentName}`)
    }
    for (const specifier of specifiers.split(',')) {
      const importedName = specifier.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]?.trim()
      if (importedName && !availableExports.has(importedName)) {
        throw new Error(`${sourcePath} imports ${componentName}.${importedName}, which is not exported by the Fict registry.`)
      }
    }
  }
}

export function validateFictExampleSource(content, sourcePath = 'Fict example source') {
  if (!content.trim()) {
    throw new Error(`${sourcePath} is empty.`)
  }
  if (!/export default function\s+[A-Za-z_$][\w$]*\s*\(/.test(content)) {
    throw new Error(`${sourcePath} must export a named default function.`)
  }

  const forbiddenPatterns = [
    [/^["']use client["'];?$/m, 'React client directive'],
    [/\bfrom\s+["']react["']/, 'React import'],
    [/\bfrom\s+["'](?:lucide-react|@tabler\/icons-react)["']/, 'React icon import'],
    [/\bfrom\s+["']next(?:\/[^"']*)?["']/, 'Next.js import'],
    [/\bfrom\s+["'](?:recharts|react-day-picker(?:\/[^"']*)?|input-otp|@tanstack\/react-table|react-textarea-autosize)["']/, 'React-only package import'],
    [/\bfrom\s+["']@\/(?:examples|registry)\//, 'upstream website import'],
    [/\bfrom\s+["']@\/components\/(?!ui\/)/, 'website-internal component import'],
    [/\bfrom\s+["'](?!@\/components\/ui\/|\.\.?\/)[^"']+["']/, 'non-registry package import'],
    [/\bclassName=/, 'React className attribute'],
    [/\b(?:useState|useEffect|useMemo|useCallback)\s*\(/, 'React hook'],
  ]

  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(content)) {
      throw new Error(`${sourcePath} contains a ${label}; examples must use Fict syntax.`)
    }
  }
}

function assertSafeSegment(value, label) {
  if (!segmentPattern.test(value)) {
    throw new Error(`Invalid ${label}: ${value}`)
  }
}

function findSharedSourcePaths(exampleRoot, previewName) {
  if (!fs.existsSync(exampleRoot)) {
    return []
  }

  return fs.readdirSync(exampleRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && segmentPattern.test(entry.name))
    .map(entry => path.join(exampleRoot, entry.name, `${previewName}.tsx`))
    .filter(sourcePath => fs.existsSync(sourcePath))
}
