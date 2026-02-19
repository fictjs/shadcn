import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import { listBuiltinBlockNames, listBuiltinComponentNames, listBuiltinThemeNames } from '../src/registry'

const STORYBOOK_REGISTRY_STORY_PATH = new URL('../stories/registry-builtins.stories.jsx', import.meta.url)

describe('storybook builtin registry coverage', () => {
  it('covers every builtin component, block, and theme entry', async () => {
    const storySource = await readFile(STORYBOOK_REGISTRY_STORY_PATH, 'utf8')

    const componentStories = extractStoryNames(storySource, 'component')
    const blockStories = extractStoryNames(storySource, 'block')
    const themeStories = extractStoryNames(storySource, 'theme')

    const builtinComponents = listBuiltinComponentNames()
    const builtinBlocks = listBuiltinBlockNames()
    const builtinThemes = listBuiltinThemeNames()

    expect(componentStories).toEqual(builtinComponents)
    expect(blockStories).toEqual(builtinBlocks)
    expect(themeStories).toEqual(builtinThemes)

    expect(componentStories.length + blockStories.length + themeStories.length).toBe(206)
  })
})

function extractStoryNames(storySource: string, kind: 'component' | 'block' | 'theme'): string[] {
  const pattern = new RegExp(`createRegistryStory\\('${kind}', '([^']+)'\\)`, 'g')
  const matches = Array.from(storySource.matchAll(pattern), match => match[1])
  return matches.sort((left, right) => left.localeCompare(right))
}
