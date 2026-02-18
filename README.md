# @fictjs/shadcn

`@fictjs/shadcn` is the official shadcn-style code distribution system for Fict.

It provides:

- `fictcn` CLI (`init/add/diff/update/doctor/list/search/theme/blocks`)
- Built-in offline registry for UI components, blocks, and themes
- Deterministic lock file (`fictcn.lock.json`) with file hashes
- Tailwind + CSS variable baseline setup for Fict projects

## Install

```bash
pnpm add -D @fictjs/shadcn
```

## Quick Start

```bash
# initialize current Fict project
pnpm fictcn init

# add components
pnpm fictcn add button dialog tabs table

# add blocks
pnpm fictcn blocks add auth/login-form tables/users-table

# apply themes
pnpm fictcn theme apply theme-default theme-slate
```

## CLI Commands

```bash
fictcn init [--skip-install]
fictcn add <components...> [--overwrite] [--skip-install]
fictcn diff [components...]
fictcn update [components...] [--force] [--skip-install]
fictcn doctor
fictcn list [--type components|blocks|themes|all] [--json]
fictcn search <query>
fictcn blocks add <blocks...> [--overwrite] [--skip-install]
fictcn blocks list
fictcn theme apply <themes...> [--overwrite]
fictcn theme list
```

## Storybook (Fict + shadcn)

This repo now includes a Fict-native Storybook setup with shadcn-style component stories.

```bash
# start local storybook
pnpm storybook

# smoke test startup in CI mode
pnpm storybook:smoke

# build static storybook
pnpm storybook:build
```

Story files are under `stories/`, and Storybook config is under `.storybook/`.

## Built-in Component Coverage

- Base: `button`, `badge`, `card`, `separator`, `avatar`, `aspect-ratio`, `skeleton`
- Forms: `label`, `input`, `textarea`, `checkbox`, `radio-group`, `switch`, `select`, `combobox`, `slider`, `toggle`, `toggle-group`, `form`
- Overlay: `dialog`, `alert-dialog`, `popover`, `tooltip`, `hover-card`, `sheet`
- Navigation/Menu: `dropdown-menu`, `context-menu`, `menubar`, `tabs`, `accordion`, `collapsible`, `navigation-menu`
- Feedback/Data: `toast`, `progress`, `table`

## Built-in Blocks

- `auth/login-form`
- `auth/signup-form`
- `settings/profile`
- `dashboard/layout`
- `dashboard/sidebar`
- `tables/users-table`
- `dialogs/confirm-delete`
- `forms/validated-form`

## Built-in Themes

- `theme-default`
- `theme-slate`
- `theme-zinc`
- `theme-stone`
- `theme-brand-ocean`

## Schemas

- `schemas/fictcn.schema.json`
- `schemas/fictcn-lock.schema.json`

`fictcn init` writes config using the schema URL:

- `https://fictjs.dev/schemas/fictcn.schema.json`
- `https://fictjs.dev/schemas/fictcn-lock.schema.json`

## Development

```bash
pnpm install --ignore-workspace
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
