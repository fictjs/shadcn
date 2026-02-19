import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type RegistryStoryKind = 'component' | 'block' | 'theme'

export interface RegistryStory {
  exportName: string
  kind: RegistryStoryKind
  name: string
  id: string
}

const STORYBOOK_TITLE_ID = 'fict-shadcn-builtin-registry'

export function listRegistryStories(kind?: RegistryStoryKind): RegistryStory[] {
  const source = readFileSync(getRegistryStoryFilePath(), 'utf8')
  const pattern = /export const (\w+) = createRegistryStory\('(component|block|theme)', '([^']+)'\)/g
  const stories: RegistryStory[] = []

  for (const match of source.matchAll(pattern)) {
    const exportName = match[1]
    const entryKind = match[2] as RegistryStoryKind
    const name = match[3]

    stories.push({
      exportName,
      kind: entryKind,
      name,
      id: `${STORYBOOK_TITLE_ID}--${toStoryId(entryKind + '/' + name)}`,
    })
  }

  if (stories.length === 0) {
    throw new Error('No registry stories found in stories/registry-builtins.stories.jsx')
  }

  if (!kind) {
    return stories
  }

  return stories.filter(story => story.kind === kind)
}

function getRegistryStoryFilePath(): string {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(dirname, '../stories/registry-builtins.stories.jsx')
}

function toStoryId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
