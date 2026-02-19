import { once } from 'node:events'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import { afterEach, describe, expect, it, vi } from 'vitest'

describe('registry source env parsing', () => {
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

  it('handles invalid numeric env values by falling back to defaults', async () => {
    const original = process.env.FICTCN_REGISTRY_TIMEOUT_MS
    process.env.FICTCN_REGISTRY_TIMEOUT_MS = 'not-a-number'

    try {
      vi.resetModules()
      const mod = await import('../src/registry/source')
      expect(typeof mod.loadRegistryCatalog).toBe('function')
    } finally {
      if (original === undefined) {
        delete process.env.FICTCN_REGISTRY_TIMEOUT_MS
      } else {
        process.env.FICTCN_REGISTRY_TIMEOUT_MS = original
      }
    }
  })

  it('accepts positive numeric env values', async () => {
    const original = process.env.FICTCN_REGISTRY_TIMEOUT_MS
    process.env.FICTCN_REGISTRY_TIMEOUT_MS = '25'

    try {
      vi.resetModules()
      const mod = await import('../src/registry/source')
      expect(typeof mod.loadRegistryDataset).toBe('function')
    } finally {
      if (original === undefined) {
        delete process.env.FICTCN_REGISTRY_TIMEOUT_MS
      } else {
        process.env.FICTCN_REGISTRY_TIMEOUT_MS = original
      }
    }
  })

  it('surfaces timeout errors when remote responses exceed timeout', async () => {
    const server = createServer((_request, response) => {
      setTimeout(() => {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify([{ name: 'slow-entry', type: 'ui-component' }]))
      }, 50)
    })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    servers.push(server)

    const address = server.address() as AddressInfo
    const registryUrl = `http://127.0.0.1:${address.port}/registry`

    const timeoutOriginal = process.env.FICTCN_REGISTRY_TIMEOUT_MS
    const retriesOriginal = process.env.FICTCN_REGISTRY_RETRIES
    process.env.FICTCN_REGISTRY_TIMEOUT_MS = '1'
    process.env.FICTCN_REGISTRY_RETRIES = '1'

    try {
      vi.resetModules()
      const mod = await import('../src/registry/source')
      await expect(
        mod.loadRegistryCatalog({
          registry: registryUrl,
        }),
      ).rejects.toThrow('Timed out fetching registry')
    } finally {
      if (timeoutOriginal === undefined) {
        delete process.env.FICTCN_REGISTRY_TIMEOUT_MS
      } else {
        process.env.FICTCN_REGISTRY_TIMEOUT_MS = timeoutOriginal
      }
      if (retriesOriginal === undefined) {
        delete process.env.FICTCN_REGISTRY_RETRIES
      } else {
        process.env.FICTCN_REGISTRY_RETRIES = retriesOriginal
      }
    }
  })
})
