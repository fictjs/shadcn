import { once } from 'node:events'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'

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
