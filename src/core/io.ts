import { createHash } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { WriteFileResult } from './types'

export async function exists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}

export async function ensureDir(targetPath: string): Promise<void> {
  await mkdir(targetPath, { recursive: true })
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export async function readTextIfExists(targetPath: string): Promise<string | null> {
  if (!(await exists(targetPath))) return null
  return readFile(targetPath, 'utf8')
}

export async function writeTextFile(
  rootDir: string,
  relativePath: string,
  content: string,
  force = false,
): Promise<WriteFileResult> {
  const absolutePath = path.resolve(rootDir, relativePath)
  await ensureDir(path.dirname(absolutePath))

  const current = await readTextIfExists(absolutePath)
  if (current !== null && current === content) {
    return { path: relativePath, changed: false, created: false }
  }

  if (current !== null && !force) {
    return { path: relativePath, changed: false, created: false }
  }

  await writeFile(absolutePath, content, 'utf8')
  return {
    path: relativePath,
    changed: true,
    created: current === null,
  }
}

export async function upsertTextFile(rootDir: string, relativePath: string, content: string): Promise<WriteFileResult> {
  const absolutePath = path.resolve(rootDir, relativePath)
  await ensureDir(path.dirname(absolutePath))

  const current = await readTextIfExists(absolutePath)
  if (current === content) {
    return { path: relativePath, changed: false, created: false }
  }

  await writeFile(absolutePath, content, 'utf8')
  return {
    path: relativePath,
    changed: true,
    created: current === null,
  }
}

export async function readJsonFile<T>(targetPath: string): Promise<T> {
  const raw = await readFile(targetPath, 'utf8')
  return JSON.parse(raw) as T
}

export async function writeJsonFile(targetPath: string, value: unknown): Promise<void> {
  const serialized = `${JSON.stringify(value, null, 2)}\n`
  await ensureDir(path.dirname(targetPath))
  await writeFile(targetPath, serialized, 'utf8')
}

export function sortRecord<T extends Record<string, unknown>>(value: T): T {
  const sortedEntries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
  return Object.fromEntries(sortedEntries) as T
}
