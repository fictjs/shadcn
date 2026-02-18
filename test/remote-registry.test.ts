import { once } from 'node:events'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import { afterEach, describe, expect, it } from 'vitest'

import { runListFromRegistry } from '../src/commands/list'
import { runSearchFromRegistry } from '../src/commands/search'

describe('remote registry read-only commands', () => {
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
})

async function startRegistryServer(
  servers: Array<ReturnType<typeof createServer>>,
  entries: unknown[],
): Promise<{ registryUrl: string }> {
  const server = createServer((request, response) => {
    if (request.url === '/registry/index.json') {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify(entries))
      return
    }

    response.writeHead(404)
    response.end('not found')
  })

  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  servers.push(server)

  const address = server.address() as AddressInfo
  const registryUrl = `http://127.0.0.1:${address.port}/registry`

  return {
    registryUrl,
  }
}
