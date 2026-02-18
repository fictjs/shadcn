#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { main } from '../cli/main'

export function handleCliError(error: unknown): void {
  const message = error instanceof Error && error.message.length > 0 ? error.message : String(error)
  console.error(`Error: ${message}`)
  process.exitCode = 1
}

export async function runCli(argv: string[]): Promise<void> {
  await main(argv)
}

if (isDirectExecution()) {
  void runCli(process.argv).catch(handleCliError)
}

function isDirectExecution(): boolean {
  if (!process.argv[1]) return false
  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
}
