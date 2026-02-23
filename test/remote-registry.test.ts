import { once } from 'node:events'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterEach, describe, expect, it } from 'vitest'

import { runAdd } from '../src/commands/add'
import { runBlocksInstall } from '../src/commands/blocks'
import { runDiff } from '../src/commands/diff'
import { runListFromRegistry } from '../src/commands/list'
import { runSearchFromRegistry } from '../src/commands/search'
import { runUpdate } from '../src/commands/update'
import { LOCK_FILE } from '../src/core/constants'

describe('remote registry support', () => {
  const servers: Array<ReturnType<typeof createServer>> = []

  afterEach(async () => {
    await Promise.all(
      servers.map(async server => {
        server.close()
        await once(server, 'close')
      }),
    )
    servers.length = 0
  })

  it('lists remote entries from an index endpoint', async () => {
    const { registryUrl } = await startRegistryServer(servers, [
      {
        name: 'x-button',
        type: 'ui-component',
        description: 'Remote button component',
      },
      {
        name: 'remote/auth-form',
        type: 'block',
        description: 'Remote auth block',
      },
      {
        name: 'theme-remote',
        type: 'theme',
        description: 'Remote theme',
      },
    ])

    const output = await runListFromRegistry({
      registry: registryUrl,
      type: 'all',
      json: true,
    })
    const parsed = JSON.parse(output) as Array<{ kind: string; name: string }>

    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'component', name: 'x-button' }),
        expect.objectContaining({ kind: 'block', name: 'remote/auth-form' }),
        expect.objectContaining({ kind: 'theme', name: 'theme-remote' }),
      ]),
    )
  })

  it('searches remote entries by name and description', async () => {
    const { registryUrl } = await startRegistryServer(servers, [
      {
        name: 'remote-command-palette',
        type: 'ui-component',
        description: 'Command palette with fuzzy search',
      },
      {
        name: 'theme-forest',
        type: 'theme',
        description: 'Forest tones',
      },
    ])

    const output = await runSearchFromRegistry('fuzzy', {
      registry: registryUrl,
    })

    expect(output).toContain('remote-command-palette')
    expect(output).not.toContain('theme-forest')
  })

  it('retries transient remote failures', async () => {
    let attempts = 0
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url !== '/registry/index.json') {
        response.writeHead(404)
        response.end('not found')
        return
      }

      attempts += 1
      if (attempts === 1) {
        response.writeHead(503, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ message: 'temporary outage' }))
        return
      }

      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify([
          {
            name: 'retry-ok',
            type: 'ui-component',
            description: 'resolved after retry',
          },
        ]),
      )
    })

    const output = await runListFromRegistry({
      registry: registryUrl,
      type: 'components',
    })

    expect(output).toContain('retry-ok')
    expect(attempts).toBe(2)
  })

  it('caches remote registry responses across list/search calls', async () => {
    let requests = 0
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url !== '/registry/index.json') {
        response.writeHead(404)
        response.end('not found')
        return
      }

      requests += 1
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify([
          {
            name: 'cached-entry',
            type: 'ui-component',
            description: 'served from cache',
          },
        ]),
      )
    })

    const listOutput = await runListFromRegistry({
      registry: registryUrl,
      type: 'components',
    })
    const searchOutput = await runSearchFromRegistry('cached-entry', {
      registry: registryUrl,
    })

    expect(listOutput).toContain('cached-entry')
    expect(searchOutput).toContain('cached-entry')
    expect(requests).toBe(1)
  })

  it('falls back to registry.json when index.json is missing', async () => {
    let indexRequests = 0
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url === '/registry/index.json') {
        indexRequests += 1
        response.writeHead(404, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ message: 'index missing' }))
        return
      }

      if (request.url === '/registry/registry.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(
          JSON.stringify([
            {
              name: 'fallback-button',
              type: 'ui-component',
              description: 'Loaded from registry.json fallback',
            },
          ]),
        )
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    const output = await runListFromRegistry({
      registry: registryUrl,
      type: 'components',
    })

    expect(output).toContain('fallback-button')
    expect(indexRequests).toBe(1)
  })

  it('supports direct .json registry URLs and items payloads', async () => {
    let indexRequests = 0
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url === '/registry/index.json') {
        indexRequests += 1
        response.writeHead(500, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ message: 'should not be called' }))
        return
      }

      if (request.url === '/registry/custom.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(
          JSON.stringify({
            items: [
              {
                name: 'items-theme',
                type: 'theme',
                description: 'Theme delivered through items[]',
              },
            ],
          }),
        )
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    const customRegistryUrl = `${registryUrl}/custom.json`
    const output = await runListFromRegistry({
      registry: customRegistryUrl,
      type: 'themes',
      json: true,
    })
    const parsed = JSON.parse(output) as Array<{ kind: string; name: string }>

    expect(parsed).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'theme', name: 'items-theme' })]),
    )
    expect(indexRequests).toBe(0)
  })

  it('loads file:// registries and referenced template files', async () => {
    const registryRoot = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-file-protocol-'))
    await mkdir(path.join(registryRoot, 'src/lib/registry/ui'), { recursive: true })

    await writeFile(
      path.join(registryRoot, 'index.json'),
      `${JSON.stringify(
        [
          {
            name: 'file-registry-button',
            type: 'ui-component',
            version: '1.0.0',
            files: [{ path: 'src/lib/registry/ui/file-registry-button.tsx' }],
          },
        ],
        null,
        2,
      )}\n`,
      'utf8',
    )
    await writeFile(
      path.join(registryRoot, 'src/lib/registry/ui/file-registry-button.tsx'),
      'export function FileRegistryButton() {\\n  return <button>file registry</button>\\n}\\n',
      'utf8',
    )

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-file-protocol-project-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.ts',
          registry: pathToFileURL(path.join(registryRoot, 'index.json')).toString(),
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    const addResult = await runAdd({ cwd, components: ['file-registry-button'], skipInstall: true })
    expect(addResult.added).toContain('file-registry-button')

    const buttonPath = path.join(cwd, 'src/components/ui/file-registry-button.tsx')
    expect(await readFile(buttonPath, 'utf8')).toContain('FileRegistryButton')
  })

  it('rejects remote template paths that escape project root', async () => {
    const { registryUrl } = await startRegistryServer(servers, [
      {
        name: 'escape-file',
        type: 'ui-component',
        version: '1.0.0',
        files: [
          {
            path: '../outside.txt',
            content: 'escape',
          },
        ],
      },
    ])

    const sandboxRoot = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-path-escape-'))
    const cwd = path.join(sandboxRoot, 'project')
    await mkdir(cwd, { recursive: true })
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.ts',
          registry: registryUrl,
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    await expect(runAdd({ cwd, components: ['escape-file'], skipInstall: true })).rejects.toThrow(
      'Remote file path cannot traverse parent directories',
    )
    await expect(readFile(path.join(sandboxRoot, 'outside.txt'), 'utf8')).rejects.toThrow()
    await expect(readFile(path.join(cwd, LOCK_FILE), 'utf8')).rejects.toThrow()
  })

  it('rejects HTTP registries that try to reference local file:// templates', async () => {
    const localSecret = await mkdtemp(path.join(tmpdir(), 'fictcn-http-registry-file-secret-'))
    const localSecretPath = path.join(localSecret, 'secret.tsx')
    await writeFile(localSecretPath, 'export const SECRET = true\n', 'utf8')

    const { registryUrl } = await startRegistryServer(servers, [
      {
        name: 'file-scheme-in-http',
        type: 'ui-component',
        version: '1.0.0',
        files: [
          {
            path: pathToFileURL(localSecretPath).toString(),
          },
        ],
      },
    ])

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-http-file-protocol-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.ts',
          registry: registryUrl,
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    await expect(runAdd({ cwd, components: ['file-scheme-in-http'], skipInstall: true })).rejects.toThrow(
      'Remote HTTP registries cannot reference local file URLs',
    )
    await expect(readFile(path.join(cwd, LOCK_FILE), 'utf8')).rejects.toThrow()
  })

  it('reports invalid JSON payloads from remote registries', async () => {
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url === '/registry/index.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end('not-json')
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    await expect(
      runListFromRegistry({
        registry: registryUrl,
        type: 'all',
      }),
    ).rejects.toThrow('is not valid JSON')
  })

  it('reports file:// registry paths that do not exist', async () => {
    const missingPath = path.join(tmpdir(), `fictcn-missing-registry-${Date.now()}`, 'index.json')
    await expect(
      runListFromRegistry({
        registry: pathToFileURL(missingPath).toString(),
        type: 'all',
      }),
    ).rejects.toThrow('File not found for registry source')
  })

  it('rejects empty remote registry payloads', async () => {
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url === '/registry/index.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end('[]')
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    await expect(
      runListFromRegistry({
        registry: registryUrl,
        type: 'all',
      }),
    ).rejects.toThrow('did not contain valid entries')
  })

  it('ignores entries with non-string or unsupported type values', async () => {
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url === '/registry/index.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(
          JSON.stringify([
            { name: 'bad-type-number', type: 123, description: 'ignored' },
            { name: 'bad-type-string', type: 'unsupported-type', description: 'ignored' },
            { name: 'good-entry', type: 'ui-component', description: 'kept' },
          ]),
        )
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    const output = await runListFromRegistry({
      registry: registryUrl,
      type: 'components',
    })
    expect(output).toContain('good-entry')
    expect(output).not.toContain('bad-type-number')
    expect(output).not.toContain('bad-type-string')
  })

  it('adds, diffs, and updates remote components', async () => {
    const { registryUrl } = await startRegistryServer(servers, [
      {
        name: 'remote-button',
        type: 'ui-component',
        version: '1.0.0',
        description: 'Remote button primitive',
        dependencies: [],
        registryDependencies: [],
        files: [
          {
            path: '{{componentsDir}}/remote-button.tsx',
            content: 'export function RemoteButton() {\n  return <button>Remote</button>\n}\n',
          },
        ],
      },
      {
        name: 'remote-dialog',
        type: 'ui-component',
        version: '1.0.0',
        description: 'Remote dialog depending on remote-button',
        dependencies: [],
        registryDependencies: ['remote-button'],
        files: [
          {
            path: '{{componentsDir}}/remote-dialog.tsx',
            content: 'export function RemoteDialog() {\n  return <section>Dialog</section>\n}\n',
          },
        ],
      },
    ])

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-mutation-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.ts',
          registry: registryUrl,
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    const addResult = await runAdd({ cwd, components: ['remote-dialog'], skipInstall: true })
    expect(addResult.added).toContain('remote-button')
    expect(addResult.added).toContain('remote-dialog')

    const buttonPath = path.join(cwd, 'src/components/ui/remote-button.tsx')
    const dialogPath = path.join(cwd, 'src/components/ui/remote-dialog.tsx')
    expect(await readFile(buttonPath, 'utf8')).toContain('RemoteButton')
    expect(await readFile(dialogPath, 'utf8')).toContain('RemoteDialog')

    const lockRaw = await readFile(path.join(cwd, LOCK_FILE), 'utf8')
    expect(lockRaw).toContain(registryUrl)

    await writeFile(buttonPath, 'local remote edits\n', 'utf8')
    const diff = await runDiff({ cwd, components: ['remote-button'] })
    expect(diff.changed).toContain('remote-button')

    const guardedUpdate = await runUpdate({ cwd, components: ['remote-button'], skipInstall: true })
    expect(guardedUpdate.skipped).toContain('remote-button')

    const forcedUpdate = await runUpdate({
      cwd,
      components: ['remote-button'],
      force: true,
      skipInstall: true,
    })
    expect(forcedUpdate.updated).toContain('remote-button')
    expect(await readFile(buttonPath, 'utf8')).toContain('RemoteButton')
  })

  it('resolves registry file references for component and block installs', async () => {
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url === '/registry/index.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(
          JSON.stringify([
            {
              name: 'utils',
              type: 'registry:lib',
              files: [
                {
                  path: 'src/lib/registry/lib/utils.ts',
                },
              ],
            },
            {
              name: 'ref-accordion',
              type: 'registry:ui',
              registryDependencies: ['utils'],
              files: [
                {
                  path: 'src/lib/registry/ui/ref-accordion/index.ts',
                },
              ],
            },
            {
              name: 'ref-dashboard',
              type: 'registry:block',
              registryDependencies: ['ref-accordion'],
              files: [
                {
                  path: 'src/lib/registry/blocks/ref-dashboard.tsx',
                },
              ],
            },
          ]),
        )
        return
      }

      if (request.url === '/registry/src/lib/registry/lib/utils.ts') {
        response.writeHead(200, { 'content-type': 'text/plain' })
        response.end("export const cn = (...classes: string[]) => classes.filter(Boolean).join(' ')\\n")
        return
      }

      if (request.url === '/registry/src/lib/registry/ui/ref-accordion/index.ts') {
        response.writeHead(200, { 'content-type': 'text/plain' })
        response.end("export const RefAccordion = 'ok'\\n")
        return
      }

      if (request.url === '/registry/src/lib/registry/blocks/ref-dashboard.tsx') {
        response.writeHead(200, { 'content-type': 'text/plain' })
        response.end('export function RefDashboardBlock() {\\n  return <section>dashboard</section>\\n}\\n')
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-file-refs-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.ts',
          registry: registryUrl,
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    const addResult = await runAdd({ cwd, components: ['ref-accordion'], skipInstall: true })
    expect(addResult.added).toContain('utils')
    expect(addResult.added).toContain('ref-accordion')

    const utilsPath = path.join(cwd, 'src/lib/utils.ts')
    const accordionPath = path.join(cwd, 'src/components/ui/ref-accordion/index.ts')
    expect(await readFile(utilsPath, 'utf8')).toContain('export const cn')
    expect(await readFile(accordionPath, 'utf8')).toContain("export const RefAccordion = 'ok'")

    const blockResult = await runBlocksInstall({ cwd, blocks: ['ref-dashboard'], skipInstall: true })
    expect(blockResult.added).toContain('ref-dashboard')

    const blockPath = path.join(cwd, 'src/components/blocks/ref-dashboard.tsx')
    expect(await readFile(blockPath, 'utf8')).toContain('<section>dashboard</section>')
  })

  it('maps legacy blocks/* file paths for block entries', async () => {
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url === '/registry/index.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(
          JSON.stringify([
            {
              name: 'legacy-mapped-block',
              type: 'block',
              files: [
                {
                  path: 'blocks/legacy-mapped-block.tsx',
                  content: 'export function LegacyMappedBlock() {\\n  return <section>legacy</section>\\n}\\n',
                },
              ],
            },
          ]),
        )
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-block-legacy-path-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.ts',
          registry: registryUrl,
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    const result = await runBlocksInstall({ cwd, blocks: ['legacy-mapped-block'], skipInstall: true })
    expect(result.added).toContain('legacy-mapped-block')
    const blockPath = path.join(cwd, 'src/components/blocks/legacy-mapped-block.tsx')
    expect(await readFile(blockPath, 'utf8')).toContain('LegacyMappedBlock')
  })

  it('retries transient file fetch failures for remote template files', async () => {
    let fileRequests = 0
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url === '/registry/index.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(
          JSON.stringify([
            {
              name: 'retry-file-button',
              type: 'ui-component',
              files: [
                {
                  path: 'src/lib/registry/ui/retry-file-button.tsx',
                },
              ],
            },
          ]),
        )
        return
      }

      if (request.url === '/registry/src/lib/registry/ui/retry-file-button.tsx') {
        fileRequests += 1
        if (fileRequests === 1) {
          response.writeHead(503, { 'content-type': 'text/plain' })
          response.end('retry me')
          return
        }
        response.writeHead(200, { 'content-type': 'text/plain' })
        response.end('export function RetryFileButton() {\\n  return <button>retry file</button>\\n}\\n')
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-file-retry-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.ts',
          registry: registryUrl,
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    const result = await runAdd({ cwd, components: ['retry-file-button'], skipInstall: true })
    expect(result.added).toContain('retry-file-button')
    expect(fileRequests).toBe(2)
  })

  it('fails fast when remote file references are unavailable', async () => {
    const { registryUrl } = await startCustomRegistryServer(servers, (request, response) => {
      if (request.url === '/registry/index.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(
          JSON.stringify([
            {
              name: 'broken-button',
              type: 'ui-component',
              version: '1.0.0',
              files: [
                {
                  path: 'src/lib/registry/ui/broken-button.tsx',
                },
              ],
            },
          ]),
        )
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-file-missing-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.ts',
          registry: registryUrl,
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    await expect(runAdd({ cwd, components: ['broken-button'], skipInstall: true })).rejects.toThrow(
      'Failed to fetch registry',
    )

    await expect(readFile(path.join(cwd, 'src/components/ui/broken-button.tsx'), 'utf8')).rejects.toThrow()
    await expect(readFile(path.join(cwd, LOCK_FILE), 'utf8')).rejects.toThrow()
  })

  it('reports circular dependency graphs from remote registries', async () => {
    const { registryUrl } = await startRegistryServer(servers, [
      {
        name: 'alpha-card',
        type: 'ui-component',
        version: '1.0.0',
        registryDependencies: ['beta-card'],
        files: [
          {
            path: '{{componentsDir}}/alpha-card.tsx',
            content: 'export function AlphaCard() {\\n  return <div>alpha</div>\\n}\\n',
          },
        ],
      },
      {
        name: 'beta-card',
        type: 'ui-component',
        version: '1.0.0',
        registryDependencies: ['alpha-card'],
        files: [
          {
            path: '{{componentsDir}}/beta-card.tsx',
            content: 'export function BetaCard() {\\n  return <div>beta</div>\\n}\\n',
          },
        ],
      },
    ])

    const cwd = await mkdtemp(path.join(tmpdir(), 'fictcn-remote-circular-'))
    await writeFile(path.join(cwd, 'package.json'), '{"name":"sandbox"}\n', 'utf8')
    await writeFile(path.join(cwd, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8')
    await writeFile(
      path.join(cwd, 'fictcn.json'),
      `${JSON.stringify(
        {
          $schema: 'https://fict.js.org/schemas/fictcn.schema.json',
          version: 1,
          style: 'tailwind-css-vars',
          componentsDir: 'src/components/ui',
          libDir: 'src/lib',
          css: 'src/styles/globals.css',
          tailwindConfig: 'tailwind.config.ts',
          registry: registryUrl,
          aliases: {
            base: '@',
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    await expect(runAdd({ cwd, components: ['alpha-card'], skipInstall: true })).rejects.toThrow(
      'Circular registry component dependency detected',
    )

    await expect(readFile(path.join(cwd, 'src/components/ui/alpha-card.tsx'), 'utf8')).rejects.toThrow()
    await expect(readFile(path.join(cwd, LOCK_FILE), 'utf8')).rejects.toThrow()
  })
})

async function startRegistryServer(
  servers: Array<ReturnType<typeof createServer>>,
  entries: unknown[],
): Promise<{ registryUrl: string }> {
  return startCustomRegistryServer(servers, (request, response) => {
    if (request.url === '/registry/index.json') {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify(entries))
      return
    }

    response.writeHead(404)
    response.end('not found')
  })
}

async function startCustomRegistryServer(
  servers: Array<ReturnType<typeof createServer>>,
  handler: (request: IncomingMessage, response: ServerResponse<IncomingMessage>) => void,
): Promise<{ registryUrl: string }> {
  const server = createServer(handler)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  servers.push(server)

  const address = server.address() as AddressInfo
  return {
    registryUrl: `http://127.0.0.1:${address.port}/registry`,
  }
}
