import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  extractFictRegistryDependencies,
  loadFictExampleSource,
  validateFictExampleSource,
} from '../scripts/lib/fict-example-source.mjs'

const repositoryExampleRoot = path.join(process.cwd(), 'apps/v4/content/examples/fict')
const previewCatalog = JSON.parse(fs.readFileSync(
  path.join(process.cwd(), 'apps/v4/content/docs/components/fict/preview-catalog.json'),
  'utf8'
)) as Record<string, string[]>

function expectCuratedFamily(family: string) {
  for (const previewName of previewCatalog[family]) {
    const source = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: family,
      previewName,
    })
    expect(source, previewName).not.toBeNull()
    expect(source, previewName).not.toContain('import * as UI')
  }
}

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
    expectCuratedFamily('button')

    const sizeSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'button',
      previewName: 'button-size',
    })
    expect(sizeSource).toContain('size="xs"')
    expect(sizeSource).toContain('size="icon-xs"')
    expect(sizeSource).toContain('size="icon-lg"')

    const asChildSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'button',
      previewName: 'button-aschild',
    })
    expect(asChildSource).toContain('<Button asChild><a href="/login">Login</a></Button>')
  })

  it('provides curated Fict source for every Accordion preview', () => {
    expectCuratedFamily('accordion')

    const multipleSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'accordion',
      previewName: 'accordion-multiple',
    })
    expect(multipleSource).toContain('type="multiple"')
    expect(multipleSource).toContain('defaultValue={["notifications"]}')

    const disabledSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'accordion',
      previewName: 'accordion-disabled',
    })
    expect(disabledSource).toContain('<AccordionItem value="item-2" disabled>')

    const rtlSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'accordion',
      previewName: 'accordion-rtl',
    })
    expect(rtlSource).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(rtlSource).not.toContain('language-selector')
  })

  it('provides curated Fict source for every Dialog preview', () => {
    expectCuratedFamily('dialog')

    const demoSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'dialog',
      previewName: 'dialog-demo',
    })
    expect(demoSource).toContain('<DialogContent class="sm:max-w-sm">')
    expect(demoSource).toContain('<DialogTrigger asChild>')

    const rtlSource = loadFictExampleSource({
      exampleRoot: repositoryExampleRoot,
      componentName: 'dialog',
      previewName: 'dialog-rtl',
    })
    expect(rtlSource).toContain("let language = $state<keyof typeof translations>('ar')")
    expect(rtlSource).not.toContain('language-selector')
  })

  it.each([
    ['React import', "import { useState } from 'react'\nexport default function Demo() { return null }"],
    ['React className attribute', 'export default function Demo() { return <div className="x" /> }'],
    ['React hook', 'export default function Demo() { const value = useState(0); return value }'],
    ['Next.js import', "import Link from 'next/link'\nexport default function Demo() { return <Link /> }"],
    ['React-only package import', "import { AreaChart } from 'recharts'\nexport default function Demo() { return <AreaChart /> }"],
    ['upstream website import', "import { Button } from '@/examples/radix/ui/button'\nexport default function Demo() { return <Button /> }"],
    ['website-internal component import', "import { LanguageSelector } from '@/components/language-selector'\nexport default function Demo() { return <LanguageSelector /> }"],
  ])('rejects %s', (_label, source) => {
    expect(() => validateFictExampleSource(source)).toThrow(/must use Fict syntax/)
  })
})
