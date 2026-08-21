import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { nativeCompilerInfo, transformSync } from '@fictjs/compiler'

const appPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const compilerInfo = nativeCompilerInfo()

assert.equal(compilerInfo.backend, 'rust')
assert.equal(compilerInfo.compilerProtocolVersion, 1)
assert.equal(
  compilerInfo.compilerCapabilityPackageVersion,
  appPackage.devDependencies['@fictjs/compiler'],
)
assert.match(
  transformSync({
    protocolVersion: 1,
    code: 'export const n: number = 1',
    filename: '/consumer.ts',
    options: {},
  }).code,
  /n = 1/,
)
