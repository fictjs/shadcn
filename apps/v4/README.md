This is the v4 website app for `@fictjs/shadcn`.

It tracks the full shadcn v4 website surface (docs, examples, blocks, charts, and registry pages) and is adapted for the Fict ecosystem.

The app is also the repository's published-package consumer. Install it independently from the repository root so pnpm cannot substitute local Fict workspace packages:

```bash
pnpm --dir apps/v4 install --ignore-workspace --frozen-lockfile
pnpm --dir apps/v4 verify:published
pnpm --dir apps/v4 verify:compiler
pnpm --dir apps/v4 typecheck
pnpm --dir apps/v4 build
pnpm --dir apps/v4 test:e2e
```

`verify:published` requires exact Fict package versions, rejects local dependency protocols in the app lockfile, and confirms every installed Fict package resolves inside `apps/v4/node_modules`.
