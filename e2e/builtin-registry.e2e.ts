import { expect, test } from '@playwright/test'

import { listRegistryStories } from './registry-stories'

const UNEXPECTED_UI_ERRORS = [
  'The component failed to render properly',
  'Failed to render',
  'Missing generated runtime module',
  'Could not locate an exported',
]

const IGNORED_CONSOLE_ERRORS = [/favicon\.ico/i]

const stories = listRegistryStories()

test.describe.configure({ mode: 'parallel' })

for (const story of stories) {
  test(`${story.kind}/${story.name} renders in Storybook`, async ({ page }) => {
    test.setTimeout(60_000)

    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    const onConsoleError = (message: { type(): string; text(): string }) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    }
    const onPageError = (error: Error) => {
      pageErrors.push(error.message)
    }

    page.on('console', onConsoleError)
    page.on('pageerror', onPageError)

    try {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'domcontentloaded' })

      const storyRoot = page.locator('#storybook-root')
      await expect(storyRoot).toBeVisible({ timeout: 10_000 })
      await expect(storyRoot.getByRole('heading', { name: story.name })).toBeVisible({ timeout: 10_000 })
      await expect(storyRoot.getByText('live preview')).toBeVisible({ timeout: 10_000 })

      for (const errorText of UNEXPECTED_UI_ERRORS) {
        await expect(storyRoot.getByText(errorText).first()).not.toBeVisible()
      }

      const unexpectedErrors = [...consoleErrors, ...pageErrors].filter(message =>
        IGNORED_CONSOLE_ERRORS.every(pattern => !pattern.test(message)),
      )
      expect(unexpectedErrors).toEqual([])
    } finally {
      page.off('console', onConsoleError)
      page.off('pageerror', onPageError)
    }
  })
}
