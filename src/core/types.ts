export type FictcnStyle = 'tailwind-css-vars'

export interface FictcnConfig {
  $schema?: string
  version: 1
  style: FictcnStyle
  componentsDir: string
  libDir: string
  css: string
  tailwindConfig: string
  registry: 'builtin' | string
  aliases: {
    base: string
  }
}

export interface LockEntry {
  name: string
  version: string
  source: string
  installedAt: string
  files: Record<string, string>
}

export interface FictcnLock {
  $schema?: string
  version: 1
  registry: string
  components: Record<string, LockEntry>
  blocks: Record<string, LockEntry>
  themes: Record<string, LockEntry>
}

export interface InitOptions {
  cwd?: string
  skipInstall?: boolean
  dryRun?: boolean
}

export interface WriteFileResult {
  path: string
  changed: boolean
  created: boolean
}

export interface AddResult {
  added: string[]
  skipped: string[]
  updated: string[]
}
