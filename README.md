# @fictjs/shadcn

[![CI](https://github.com/fictjs/shadcn/actions/workflows/ci.yml/badge.svg)](https://github.com/fictjs/shadcn/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@fictjs/shadcn.svg)](https://www.npmjs.com/package/@fictjs/shadcn)
![license](https://img.shields.io/npm/l/@fictjs/shadcn)

The official [shadcn/ui](https://ui.shadcn.com)-style code distribution system for [Fict](https://github.com/fictjs/fict) — a reactive UI library with compiler-driven fine-grained reactivity.

Instead of installing a component library as a dependency, `@fictjs/shadcn` copies beautifully-designed, accessible component source code directly into your project. You own the code, you customize it, and the CLI helps you keep it up to date.

## Features

- **`fictcn` CLI** — scaffold, add, remove, diff, update, and validate UI components from the terminal
- **206 built-in registry entries** — core Fict-native set plus expanded compatibility catalog
- **Core Fict-native set** — 35 UI components + 8 blocks + 5 themes
- **Flexible registry source** — use the bundled offline registry or a remote JSON registry
- **Deterministic lock file** — `fictcn.lock.json` tracks installed versions and SHA-256 file hashes for drift detection
- **Automatic dependency resolution** — registry dependencies are resolved with circular dependency detection
- **Tailwind CSS + CSS variables** — baseline configuration generated for you, including PostCSS and `tailwindcss-animate`
- **Package manager agnostic** — auto-detects pnpm, npm, yarn, or bun

## Install

```bash
pnpm add -D @fictjs/shadcn
# or
npm install -D @fictjs/shadcn
# or
yarn add -D @fictjs/shadcn
# or
bun add -D @fictjs/shadcn
```

> **Prerequisites**: Node.js 18+ and a Fict project. Tailwind baseline can be bootstrapped by `fictcn init`.

> If `@fictjs/shadcn` is installed locally, run the CLI via your package manager:
> `pnpm exec fictcn`, `npm exec fictcn`, `yarn fictcn`, or `bunx fictcn`.

## Quick Start

```bash
# 1. Initialize your project (generates config, globals.css, tailwind config, utilities)
pnpm fictcn init

# 2. Add components — dependencies are resolved automatically
pnpm fictcn add button dialog tabs table

# 3. Import and use in your Fict components
```

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function App() {
  let count = $state(0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Counter</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => count++}>Clicked {count} times</Button>
      </CardContent>
    </Card>
  )
}
```

## CLI Reference

### `fictcn init`

Scaffolds the project baseline: `fictcn.json` config, `globals.css` with design tokens, Tailwind config (e.g. `tailwind.config.ts` / `tailwind.config.js` / `tailwind.config.mjs` / `tailwind.config.cjs`), PostCSS config, and utility files (`cn.ts`, `variants.ts`). Existing scaffold files are preserved by default; pass `--force` to overwrite. Installs required dependencies unless `--skip-install` is passed.

```bash
fictcn init [--force] [--skip-install] [--dry-run]
```

### `fictcn add`

Adds one or more components to your project from the configured registry (`builtin` or remote URL). Registry dependencies (e.g., `dialog` depends on `button`) are resolved and installed automatically.

```bash
fictcn add <components...> [--overwrite] [--skip-install] [--dry-run]

# Examples
fictcn add button
fictcn add dialog tabs accordion tooltip
fictcn add select --overwrite  # replace existing files
```

### `fictcn blocks`

Install pre-built UI blocks — higher-level compositions of multiple components.

```bash
fictcn blocks add <blocks...> [--overwrite] [--skip-install] [--dry-run]
fictcn blocks list

# Examples
fictcn blocks add auth/login-form dashboard/layout
```

### `fictcn theme`

Apply color themes that override CSS custom properties with light/dark variants.

```bash
fictcn theme apply <themes...> [--overwrite] [--dry-run]
fictcn theme list

# Examples
fictcn theme apply theme-slate
```

### `fictcn diff`

Show a unified diff of local modifications against the configured registry source. Useful for reviewing what you've customized before updating.

```bash
fictcn diff [entries...]

# Examples
fictcn diff              # diff all installed entries
fictcn diff button card  # diff specific components
```

### `fictcn update`

Update installed registry entries from the configured registry source. Without `--force`, entries with local modifications are skipped.

```bash
fictcn update [entries...] [--force] [--skip-install] [--dry-run]

# Examples
fictcn update              # update all
fictcn update button card  # update specific entries
fictcn update --force      # overwrite local changes
```

### `fictcn remove` / `fictcn uninstall`

Remove installed entries and tracked files from your project and lock file. By default, edited files are protected; pass `--force` to remove anyway.

```bash
fictcn remove <entries...> [--force] [--dry-run]

# Examples
fictcn remove button
fictcn remove auth/login-form theme-slate
fictcn remove button --force
```

### `fictcn doctor`

Validate that your project is correctly configured: checks for `fictcn.json`, `tsconfig.json` alias paths, `globals.css`, your configured Tailwind file (`tailwindConfig`), and required npm dependencies.

```bash
fictcn doctor
```

### `fictcn list`

List all available registry entries.

```bash
fictcn list [--type components|blocks|themes|all] [--json] [--registry builtin|<url>]
```

When `--registry` is omitted, the CLI uses `fictcn.json` (`registry` field) if available.

### `fictcn search`

Search registry entries by keyword.

```bash
fictcn search <query> [--registry builtin|<url>]

# Examples
fictcn search dialog
fictcn search form
```

## Configuration

Running `fictcn init` creates a `fictcn.json` at your project root:

```jsonc
{
  "$schema": "https://fict.js.org/schemas/fictcn.schema.json",
  "version": 1,
  "style": "tailwind-css-vars",
  "componentsDir": "src/components/ui",
  "libDir": "src/lib",
  "css": "src/styles/globals.css",
  "tailwindConfig": "tailwind.config.ts",
  "registry": "builtin",
  "aliases": {
    "base": "@",
  },
}
```

| Field            | Description                                              | Default                  |
| ---------------- | -------------------------------------------------------- | ------------------------ |
| `componentsDir`  | Where UI component files are written                     | `src/components/ui`      |
| `libDir`         | Where utility files (`cn.ts`, `variants.ts`) are placed  | `src/lib`                |
| `css`            | Path to the global CSS file with design tokens           | `src/styles/globals.css` |
| `tailwindConfig` | Path to the Tailwind CSS configuration file              | `tailwind.config.ts`     |
| `registry`       | Registry source (`builtin`, `http(s)://...`, or `file://...`) | `builtin`                |
| `aliases.base`   | TypeScript path alias prefix for imports                 | `@`                      |

For remote registries, each entry in `index.json` (or `registry.json`) should include:
`name`, `type`, `version`, `dependencies`, `registryDependencies`, and `files`.

`files` supports two formats:
- Inline content: `[{ path, content }]`
- File reference: `[{ path }]` (the CLI fetches file contents relative to the registry JSON URL)

Remote registry safety rules:
- `http(s)` registries can only reference `http(s)` template file URLs.
- `file://` registries can only reference `file://` template files within the same registry root directory.
- Generated template output paths must stay project-relative and cannot traverse parent directories.

`@fictjs/shadcn` is compatible with shadcn-style registry type tags:
- `registry:ui`, `registry:block`, `registry:style`
- `registry:hook`, `registry:lib` (treated as installable component entries)

Remote registry requests include:
- retry on transient failures (default `2` retries)
- request timeout (default `10000ms`)
- short-lived in-process cache (default `10000ms`)
- concurrent file fetches for file-reference registries (default `16`)

Optional environment variables:
- `FICTCN_REGISTRY_RETRIES`
- `FICTCN_REGISTRY_TIMEOUT_MS`
- `FICTCN_REGISTRY_RETRY_DELAY_MS`
- `FICTCN_REGISTRY_CACHE_TTL_MS`
- `FICTCN_REGISTRY_FETCH_CONCURRENCY`

## Lock File

`fictcn.lock.json` is generated automatically and tracks every installed entry with:

- **Version** — the registry version at install time
- **Timestamp** — when the entry was installed
- **File hashes** — SHA-256 hashes of every generated file, enabling drift detection via `fictcn diff`

Commit this file to version control so your team stays in sync.

## Built-in Registry

The bundled registry now includes **206** entries in total:
- Core Fict-native entries: 35 components + 8 blocks + 5 themes
- Expanded Fict-native entries: 25 compatibility components + 132 blocks + 1 theme bootstrap template

Expanded entries are now generated as usable Fict templates (with meaningful imports, dependencies, and starter UI), rather than empty placeholder shells.

### Core Components (35)

| Category   | Components                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| Base       | `button`, `badge`, `card`, `separator`, `avatar`, `aspect-ratio`, `skeleton`, `label`, `input`, `textarea` |
| Forms      | `checkbox`, `radio-group`, `switch`, `select`, `combobox`, `slider`, `toggle`, `toggle-group`, `form`      |
| Overlay    | `dialog`, `alert-dialog`, `popover`, `tooltip`, `hover-card`, `sheet`                                      |
| Navigation | `dropdown-menu`, `context-menu`, `menubar`, `tabs`, `accordion`, `collapsible`, `navigation-menu`          |
| Feedback   | `toast`, `progress`                                                                                        |
| Data       | `table`                                                                                                    |

### Core Blocks (8)

| Block                    | Description                           |
| ------------------------ | ------------------------------------- |
| `auth/login-form`        | Email/password login card             |
| `auth/signup-form`       | Account creation form                 |
| `settings/profile`       | User profile settings page            |
| `dashboard/layout`       | Dashboard shell with header           |
| `dashboard/sidebar`      | Collapsible sidebar navigation        |
| `tables/users-table`     | Data table with user records          |
| `dialogs/confirm-delete` | Destructive action confirmation modal |
| `forms/validated-form`   | Form with field-level validation      |

### Core Themes (5)

| Theme               | Description              |
| ------------------- | ------------------------ |
| `theme-default`     | Neutral gray palette     |
| `theme-slate`       | Cool slate tones         |
| `theme-zinc`        | Zinc/charcoal palette    |
| `theme-stone`       | Warm stone tones         |
| `theme-brand-ocean` | Blue ocean brand palette |

All themes provide light and dark mode variants via CSS custom properties and can be applied with a class name (e.g., `class="theme-slate dark"`).

## Project Structure After Init

```
your-project/
├── fictcn.json               # CLI configuration
├── fictcn.lock.json          # Deterministic lock file
├── tailwind.config.ts        # Auto-configured with design tokens
├── postcss.config.mjs        # PostCSS with Tailwind + Autoprefixer
└── src/
    ├── components/
    │   └── ui/
    │       ├── button.tsx     # ← added by `fictcn add button`
    │       ├── card.tsx
    │       └── ...
    ├── lib/
    │   ├── cn.ts              # clsx + tailwind-merge utility
    │   └── variants.ts        # class-variance-authority re-export
    └── styles/
        └── globals.css        # Tailwind directives + design tokens
```

## How It Works

1. **`fictcn init`** detects your project root, package manager, and TypeScript config. It generates baseline files and installs core dependencies (`@fictjs/ui-primitives`, `class-variance-authority`, `clsx`, `tailwind-merge`).

2. **`fictcn add button`** looks up `button` in your configured registry, resolves any registry dependencies (e.g., adding `dialog` also pulls in `button`), renders template files with your configured paths and aliases, writes them to `componentsDir`, and records everything in the lock file with SHA-256 hashes.

3. **You own the code.** Modify the generated components however you like. When the registry updates, use `fictcn diff` to see what changed, and `fictcn update` to pull in upstream improvements — your local changes are preserved unless you pass `--force`.

4. **`fictcn doctor`** validates the full setup: config file, TypeScript aliases, CSS tokens, Tailwind config, and npm dependencies — catching misconfigurations early.

## Programmatic API

All CLI commands are also available as TypeScript functions:

```ts
import { runInit, runAdd, runRemove, runDiff, runDoctor, runList } from '@fictjs/shadcn'

// Initialize programmatically
await runInit({ skipInstall: true })

// Add components
await runAdd({ components: ['button', 'dialog'], overwrite: false })

// Remove entries
await runRemove({ entries: ['dialog'] })

// Check for drift
const { patches } = await runDiff()

// Validate project health
const { ok, issues } = await runDoctor()

// List registry entries
const output = runList({ type: 'components', json: true })
```

## Storybook

This repo includes a Fict-native Storybook setup for developing and previewing components:

```bash
pnpm storybook          # start dev server on port 6006
pnpm storybook:build    # build static site
pnpm storybook:smoke    # CI smoke test
```

## Development

```bash
# Install dependencies
pnpm install --ignore-workspace

# Development
pnpm dev           # watch mode
pnpm build         # production build

# Quality
pnpm lint          # ESLint
pnpm typecheck     # TypeScript validation
pnpm test          # run all tests
pnpm test:watch    # watch mode
```

## JSON Schemas

Schemas for editor autocompletion and validation:

- **Config**: `https://fict.js.org/schemas/fictcn.schema.json`
- **Lock file**: `https://fict.js.org/schemas/fictcn-lock.schema.json`

Local copies are in the `schemas/` directory.

## License

[MIT](LICENSE) &copy; Fict
