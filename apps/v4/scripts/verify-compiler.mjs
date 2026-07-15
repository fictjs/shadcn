import assert from "node:assert/strict"

import { nativeCompilerInfo, transformSync } from "@fictjs/compiler"

assert.equal(nativeCompilerInfo().backend, "rust")
assert.match(
  transformSync({
    protocolVersion: 1,
    code: "export const n: number = 1",
    filename: "/consumer.ts",
    options: {},
  }).code,
  /n = 1/,
)
