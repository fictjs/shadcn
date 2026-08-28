import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  extractFictRegistryDependencies,
  loadFictExampleSource,
  validateFictExampleSource,
} from '../scripts/lib/fict-example-source.mjs'

describe('Fict website example sources', () => {
  it('loads a curated Fict source with a stable trailing newline', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fict-example-source-'))
    const componentRoot = path.join(root, 'button')
    fs.mkdirSync(componentRoot, { recursive: true })
    fs.writeFileSync(
      path.join(componentRoot, 'button-size.tsx'),
      "import { Button } from '@/components/ui/button'\n\nexport default function ButtonSizeExample() {\n  return <Button size=\"sm\">Small</Button>\n}\n",
      'utf8'
    )

    expect(loadFictExampleSource({
      exampleRoot: root,
      componentName: 'button',
      previewName: 'button-size',
    })).toMatch(/<Button size="sm">Small<\/Button>\n}\n$/)
    expect(loadFictExampleSource({
      exampleRoot: root,
      componentName: 'button-group',
      previewName: 'button-size',
    })).toMatch(/<Button size="sm">Small<\/Button>/)
    expect(loadFictExampleSource({
      exampleRoot: root,
      componentName: 'button',
      previewName: 'button-demo',
    })).toBeNull()

    fs.rmSync(root, { recursive: true, force: true })
  })

  it('derives registry dependencies from curated UI imports', () => {
    const source = `import { Button } from '@/components/ui/button'
import { ButtonGroup } from "@/components/ui/button-group"
import { format } from '@/lib/utils'

export default function Demo() { return <ButtonGroup><Button>{format('Save')}</Button></ButtonGroup> }`

    expect(extractFictRegistryDependencies(source)).toEqual(['button', 'button-group'])
  })

  it('provides curated Fict source for every Button preview', () => {
    const root = path.join(process.cwd(), 'apps/v4/content/examples/fict')
    const catalog = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'apps/v4/content/docs/components/fict/preview-catalog.json'),
      'utf8'
    )) as Record<string, string[]>

    for (const previewName of catalog.button) {
      const source = loadFictExampleSource({
        exampleRoot: root,
        componentName: 'button',
        previewName,
      })
      expect(source, previewName).not.toBeNull()
      expect(source, previewName).not.toContain('import * as UI')
    }

    const sizeSource = loadFictExampleSource({
      exampleRoot: root,
      componentName: 'button',
      previewName: 'button-size',
    })
    expect(sizeSource).toContain('size="xs"')
    expect(sizeSource).toContain('size="icon-xs"')
    expect(sizeSource).toContain('size="icon-lg"')

    const asChildSource = loadFictExampleSource({
      exampleRoot: root,
      componentName: 'button',
      previewName: 'button-aschild',
    })
    expect(asChildSource).toContain('<Button asChild><a href="/login">Login</a></Button>')
  })

  it.each([
    ['React import', "import { useState } from 'react'\nexport default function Demo() { return null }"],
    ['React className attribute', 'export default function Demo() { return <div className="x" /> }'],
    ['React hook', 'export default function Demo() { const value = useState(0); return value }'],
    ['Next.js import', "import Link from 'next/link'\nexport default function Demo() { return <Link /> }"],
  ])('rejects %s', (_label, source) => {
    expect(() => validateFictExampleSource(source)).toThrow(/must use Fict syntax/)
  })
})
