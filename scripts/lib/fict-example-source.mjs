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
