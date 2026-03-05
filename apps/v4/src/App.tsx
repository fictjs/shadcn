import { $state } from "fict"

import type { BlockEntry, DocPage, DocSummary, ResolvedRoute, ThemeEntry } from "./types"

interface AppProps {
  route: ResolvedRoute
}

export function App(props: AppProps) {
  const route = props.route

  return (
    <div class="site-shell">
      <header class="site-header">
        <div class="container header-row">
          <a href="/" class="brand-link">
            shadcn/ui
          </a>
          <nav class="site-nav" aria-label="Primary">
            <a href="/docs">Docs</a>
            <a href="/components">Components</a>
            <a href="/examples">Examples</a>
            <a href="/charts">Charts</a>
            <a href="/blocks">Blocks</a>
            <a href="/themes">Themes</a>
            <a href="/colors">Colors</a>
          </nav>
        </div>
      </header>

      <main class="container main-content">
        {route.kind === "home" ? <HomePage route={route} /> : null}
        {route.kind === "docs-index" ? <DocsIndexPage docs={route.docs} /> : null}
        {route.kind === "docs-detail" && route.doc ? (
          <DocDetailPage doc={route.doc} />
        ) : null}
        {route.kind === "components" ? <ComponentsPage components={route.components} /> : null}
        {route.kind === "examples" ? <ExamplesPage examples={route.examples} /> : null}
        {route.kind === "charts" ? <ChartsPage charts={route.charts} /> : null}
        {route.kind === "blocks" ? <BlocksPage blocks={route.blocks} /> : null}
        {route.kind === "themes" ? <ThemesPage themes={route.themes} /> : null}
        {route.kind === "colors" ? <ColorsPage /> : null}
        {route.kind === "not-found" ? <NotFoundPage pathname={route.pathname} /> : null}
      </main>

      <footer class="site-footer">
        <div class="container footer-row">
          <p>Built by shadcn and ported to Fict SSR.</p>
          <p>
            Source available on <a href="https://github.com/unovue/shadcn-vue">GitHub</a>.
          </p>
        </div>
      </footer>
    </div>
  )
}

function HomePage(props: { route: ResolvedRoute }) {
  const docsCount = props.route.docs.length
  const componentsCount = props.route.components.length
  const examplesCount = props.route.examples.length
  const chartsCount = props.route.charts.length
  const blocksCount = props.route.blocks.length
  const themesCount = props.route.themes.length

  return (
    <section class="home-grid">
      <div class="hero card">
        <p class="eyebrow">Open Source. Open Code.</p>
        <h1>The Foundation for your Design System</h1>
        <p class="lead">
          A set of beautifully designed components that you can customize, extend, and build on.
          Start here then make it your own.
        </p>
        <div class="cta-row">
          <a class="button" href="/docs">
            Get Started
          </a>
          <a class="button button-ghost" href="/components">
            View Components
          </a>
          <a class="button button-ghost" href="/colors">
            Browse Colors
          </a>
        </div>
      </div>

      <div class="stats-grid">
        <div class="card stat-card">
          <p class="stat-label">Docs Pages</p>
          <p class="stat-value">{docsCount}</p>
        </div>
        <div class="card stat-card">
          <p class="stat-label">UI Components</p>
          <p class="stat-value">{componentsCount}</p>
        </div>
        <div class="card stat-card">
          <p class="stat-label">Examples</p>
          <p class="stat-value">{examplesCount}</p>
        </div>
        <div class="card stat-card">
          <p class="stat-label">Charts</p>
          <p class="stat-value">{chartsCount}</p>
        </div>
        <div class="card stat-card">
          <p class="stat-label">Blocks</p>
          <p class="stat-value">{blocksCount}</p>
        </div>
        <div class="card stat-card">
          <p class="stat-label">Themes</p>
          <p class="stat-value">{themesCount}</p>
        </div>
      </div>

      <div class="card command-card">
        <p class="eyebrow">CLI</p>
        <h2>Start a shadcn project</h2>
        <pre class="inline-code">npx shadcn@latest init</pre>
        <pre class="inline-code">npx shadcn@latest add button</pre>
      </div>
    </section>
  )
}

function DocsIndexPage(props: { docs: DocSummary[] }) {
  let query = $state("")
  let filteredDocs: DocSummary[] = $state(props.docs)

  const updateFilter = (event: Event) => {
    const target = event.target as HTMLInputElement | null
    const nextQuery = target?.value ?? ""
    const normalizedQuery = nextQuery.trim().toLowerCase()

    query = nextQuery

    if (!normalizedQuery) {
      filteredDocs = props.docs
      return
    }

    const nextDocs: DocSummary[] = []
    for (const doc of props.docs) {
      const matches =
        doc.title.toLowerCase().includes(normalizedQuery) ||
        doc.slug.toLowerCase().includes(normalizedQuery) ||
        doc.section.toLowerCase().includes(normalizedQuery)
      if (matches) {
        nextDocs.push(doc)
      }
    }

    filteredDocs = nextDocs
  }

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Documentation</p>
        <h1>Docs</h1>
        <p class="lead">Search and open documentation content sourced from the v4 docs tree.</p>
      </div>

      <div class="card control-card">
        <label for="docs-filter">Filter docs</label>
        <input
          id="docs-filter"
          type="text"
          value={query}
          placeholder="search title, slug, or section"
          onInput={(event) => updateFilter(event)}
        />
      </div>

      <ul class="list-grid">
        {filteredDocs.map((doc) => (
          <li class="card list-item" key={doc.slug}>
            <p class="eyebrow">{doc.section}</p>
            <h3>
              <a href={`/docs/${doc.slug}`}>{doc.title}</a>
            </h3>
            <p>{doc.description || "No description."}</p>
            <p class="slug">/docs/{doc.slug}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DocDetailPage(props: { doc: DocPage }) {
  return (
    <article class="stack-gap doc-layout">
      <div>
        <p class="eyebrow">{props.doc.section}</p>
        <h1>{props.doc.title}</h1>
        <p class="lead">{props.doc.description || "No description."}</p>
        <p class="slug">source: content/docs/{props.doc.sourcePath}</p>
      </div>

      <div class="card doc-body">
        <pre>{props.doc.body}</pre>
      </div>

      <div class="doc-nav">
        <a class="button button-ghost" href="/docs">
          &lt;- Docs Index
        </a>
        <a class="button button-ghost" href="/components">
          Browse Components -&gt;
        </a>
      </div>
    </article>
  )
}

function ComponentsPage(props: { components: string[] }) {
  let query = $state("")
  let filtered: string[] = $state(props.components)

  const updateFilter = (event: Event) => {
    const target = event.target as HTMLInputElement | null
    const nextQuery = target?.value ?? ""
    const normalizedQuery = nextQuery.trim().toLowerCase()

    query = nextQuery

    if (!normalizedQuery) {
      filtered = props.components
      return
    }

    const nextComponents: string[] = []
    for (const name of props.components) {
      if (name.toLowerCase().includes(normalizedQuery)) {
        nextComponents.push(name)
      }
    }

    filtered = nextComponents
  }

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Registry</p>
        <h1>Fict shadcn Components</h1>
        <p class="lead">Component list from `registry/new-york-v4/ui`.</p>
      </div>

      <div class="card control-card">
        <label for="component-filter">Filter components</label>
        <input
          id="component-filter"
          type="text"
          value={query}
          placeholder="search component name"
          onInput={(event) => updateFilter(event)}
        />
      </div>

      <ul class="pill-grid">
        {filtered.map((component) => (
          <li key={component}>
            <div class="card pill-item">
              <p class="pill-name">{component}</p>
              <pre class="inline-code">npx @fictjs/shadcn@latest add {component}</pre>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ExamplesPage(props: { examples: string[] }) {
  let query = $state("")
  let filtered: string[] = $state(props.examples)

  const updateFilter = (event: Event) => {
    const target = event.target as HTMLInputElement | null
    const nextQuery = target?.value ?? ""
    const normalizedQuery = nextQuery.trim().toLowerCase()

    query = nextQuery

    if (!normalizedQuery) {
      filtered = props.examples
      return
    }

    const nextExamples: string[] = []
    for (const name of props.examples) {
      if (name.toLowerCase().includes(normalizedQuery)) {
        nextExamples.push(name)
      }
    }

    filtered = nextExamples
  }

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Examples</p>
        <h1>Fict shadcn Examples</h1>
        <p class="lead">Examples sourced from `registry/new-york-v4/examples`.</p>
      </div>

      <div class="card control-card">
        <label for="example-filter">Filter examples</label>
        <input
          id="example-filter"
          type="text"
          value={query}
          placeholder="search example name"
          onInput={(event) => updateFilter(event)}
        />
      </div>

      <ul class="pill-grid">
        {filtered.map((example) => (
          <li key={example}>
            <div class="card pill-item">
              <p class="pill-name">{example}</p>
              <p class="slug">registry/new-york-v4/examples/{example}.tsx</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ChartsPage(props: { charts: string[] }) {
  let query = $state("")
  let filtered: string[] = $state(props.charts)

  const updateFilter = (event: Event) => {
    const target = event.target as HTMLInputElement | null
    const nextQuery = target?.value ?? ""
    const normalizedQuery = nextQuery.trim().toLowerCase()

    query = nextQuery

    if (!normalizedQuery) {
      filtered = props.charts
      return
    }

    const nextCharts: string[] = []
    for (const name of props.charts) {
      if (name.toLowerCase().includes(normalizedQuery)) {
        nextCharts.push(name)
      }
    }

    filtered = nextCharts
  }

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Charts</p>
        <h1>Fict shadcn Chart Recipes</h1>
        <p class="lead">Chart examples sourced from `registry/new-york-v4/charts`.</p>
      </div>

      <div class="card control-card">
        <label for="chart-filter">Filter charts</label>
        <input
          id="chart-filter"
          type="text"
          value={query}
          placeholder="search chart name"
          onInput={(event) => updateFilter(event)}
        />
      </div>

      <ul class="pill-grid">
        {filtered.map((chart) => (
          <li key={chart}>
            <div class="card pill-item">
              <p class="pill-name">{chart}</p>
              <p class="slug">registry/new-york-v4/charts/{chart}.tsx</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function BlocksPage(props: { blocks: BlockEntry[] }) {
  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Blocks</p>
        <h1>Fict shadcn Blocks</h1>
        <p class="lead">Block metadata from `registry/__blocks__.json`.</p>
      </div>

      <ul class="list-grid">
        {props.blocks.map((block) => (
          <li class="card list-item" key={block.name}>
            <h3>{block.name}</h3>
            <p>{block.description}</p>
            <p class="slug">categories: {block.categories.join(", ") || "uncategorized"}</p>
            <pre class="inline-code">npx @fictjs/shadcn@latest add {block.name}</pre>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ThemesPage(props: { themes: ThemeEntry[] }) {
  let query = $state("")
  let filtered: ThemeEntry[] = $state(props.themes)

  const updateFilter = (event: Event) => {
    const target = event.target as HTMLInputElement | null
    const nextQuery = target?.value ?? ""
    const normalizedQuery = nextQuery.trim().toLowerCase()

    query = nextQuery

    if (!normalizedQuery) {
      filtered = props.themes
      return
    }

    const nextThemes: ThemeEntry[] = []
    for (const theme of props.themes) {
      if (
        theme.name.toLowerCase().includes(normalizedQuery) ||
        theme.title.toLowerCase().includes(normalizedQuery)
      ) {
        nextThemes.push(theme)
      }
    }

    filtered = nextThemes
  }

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Themes</p>
        <h1>Fict shadcn Themes</h1>
        <p class="lead">Theme metadata sourced from `registry/themes.ts`.</p>
      </div>

      <div class="card control-card">
        <label for="theme-filter">Filter themes</label>
        <input
          id="theme-filter"
          type="text"
          value={query}
          placeholder="search theme name"
          onInput={(event) => updateFilter(event)}
        />
      </div>

      <ul class="list-grid">
        {filtered.map((theme) => (
          <li class="card list-item" key={theme.name}>
            <h3>{theme.title}</h3>
            <p class="slug">name: {theme.name}</p>
            <pre class="inline-code">npx @fictjs/shadcn@latest theme apply {theme.name}</pre>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ColorsPage() {
  const palettes = [
    "zinc",
    "slate",
    "stone",
    "gray",
    "neutral",
    "red",
    "rose",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
  ]

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Colors</p>
        <h1>Tailwind Colors in Every Format</h1>
        <p class="lead">
          The complete Tailwind color palette in HEX, RGB, HSL, CSS variables, and classes.
        </p>
      </div>

      <ul class="pill-grid">
        {palettes.map((palette) => (
          <li key={palette}>
            <div class="card pill-item">
              <p class="pill-name">{palette}</p>
              <p class="slug">/colors#{palette}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function NotFoundPage(props: { pathname: string }) {
  return (
    <section class="stack-gap not-found">
      <p class="eyebrow">404</p>
      <h1>Page not found</h1>
      <p class="lead">No route matched: {props.pathname}</p>
      <div class="cta-row">
        <a class="button" href="/">
          Go Home
        </a>
        <a class="button button-ghost" href="/docs">
          Open Docs
        </a>
      </div>
    </section>
  )
}
