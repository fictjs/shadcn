import { $state } from "fict"

import { colors as tailwindColors } from "../registry/_legacy-colors"
import type {
  BlockEntry,
  DocPage,
  DocSummary,
  ResolvedRoute,
  ThemeEntry,
} from "./types"

interface AppProps {
  route: ResolvedRoute
}

interface ColorScaleEntry {
  scale: number
  hex: string
  rgb: string
  hsl: string
  oklch: string
}

interface ColorPalette {
  name: string
  scales: ColorScaleEntry[]
}

const colorPalettes = buildColorPalettes()

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
            <a
              class={route.pathname === "/docs" || route.pathname.startsWith("/docs/") ? "active-nav-link" : ""}
              href="/docs"
            >
              Docs
            </a>
            <a
              class={route.pathname === "/components" ? "active-nav-link" : ""}
              href="/components"
            >
              Components
            </a>
            <a class={route.pathname === "/examples" || route.pathname.startsWith("/examples/") ? "active-nav-link" : ""} href="/examples">
              Examples
            </a>
            <a class={route.pathname === "/charts" || route.pathname.startsWith("/charts/") ? "active-nav-link" : ""} href="/charts">
              Charts
            </a>
            <a class={route.pathname === "/blocks" || route.pathname.startsWith("/blocks/") ? "active-nav-link" : ""} href="/blocks">
              Blocks
            </a>
            <a class={route.pathname === "/themes" ? "active-nav-link" : ""} href="/themes">
              Themes
            </a>
            <a class={route.pathname === "/colors" ? "active-nav-link" : ""} href="/colors">
              Colors
            </a>
          </nav>
        </div>
      </header>

      <main class="container main-content">
        {route.kind === "home" ? <HomePage route={route} /> : null}
        {route.kind === "docs-index" ? <DocsIndexPage docs={route.docs} /> : null}
        {route.kind === "docs-detail" && route.doc ? <DocDetailPage route={route} /> : null}
        {route.kind === "components" ? <ComponentsPage components={route.components} /> : null}
        {route.kind === "examples" ? <ExamplesPage route={route} /> : null}
        {route.kind === "charts" ? <ChartsPage route={route} /> : null}
        {route.kind === "blocks" ? <BlocksPage route={route} /> : null}
        {route.kind === "themes" ? <ThemesPage themes={route.themes} /> : null}
        {route.kind === "colors" ? <ColorsPage /> : null}
        {route.kind === "not-found" ? <NotFoundPage pathname={route.pathname} /> : null}
      </main>

      <footer class="site-footer">
        <div class="container footer-row">
          <p>
            Built by <a href="https://x.com/shadcn">shadcn</a> at{" "}
            <a href="https://vercel.com/new?utm_source=shadcn_site&utm_medium=web&utm_campaign=docs_cta_deploy_now_callout">
              Vercel
            </a>
            . The source code is available on{" "}
            <a href="https://github.com/unovue/shadcn-vue">GitHub</a>.
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
    <section class="stack-gap">
      <div class="hero card home-hero-card">
        <p class="eyebrow">Open Source. Open Code.</p>
        <h1>The Foundation for your Design System</h1>
        <p class="lead">
          A set of beautifully designed components that you can customize, extend, and build on.
          Start here then make it your own. Open Source. Open Code.
        </p>
        <div class="cta-row">
          <a class="button" href="/docs/installation">
            Get Started
          </a>
          <a class="button button-ghost" href="/components">
            View Components
          </a>
        </div>
      </div>

      <nav class="section-nav" aria-label="Home examples navigation">
        <a class="section-nav-link-active" href="/">
          Examples
        </a>
        {props.route.examplePages.map((showcase) => (
          <a key={showcase.slug} href={`/examples/${showcase.slug}`}>
            {showcase.title}
          </a>
        ))}
      </nav>

      <section class="card home-preview-card">
        <div class="home-preview-images">
          <figure class="example-preview-card">
            <img src="/examples/dashboard-light.png" alt="Dashboard light preview" loading="lazy" />
            <figcaption class="slug">Dashboard light</figcaption>
          </figure>
          <figure class="example-preview-card">
            <img src="/examples/dashboard-dark.png" alt="Dashboard dark preview" loading="lazy" />
            <figcaption class="slug">Dashboard dark</figcaption>
          </figure>
        </div>
      </section>

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
      if (
        doc.title.toLowerCase().includes(normalizedQuery) ||
        doc.slug.toLowerCase().includes(normalizedQuery) ||
        (doc.section || "").toLowerCase().includes(normalizedQuery)
      ) {
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
        <p class="lead">Browse all documentation pages from the v4 docs tree.</p>
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
          <li class="card list-item" key={doc.slug || "index"}>
            <p class="eyebrow">{doc.section || "overview"}</p>
            <h3>
              <a href={doc.slug ? `/docs/${doc.slug}` : "/docs"}>{doc.title}</a>
            </h3>
            <p>{doc.description || "No description."}</p>
            <p class="slug">{doc.slug ? `/docs/${doc.slug}` : "/docs"}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DocDetailPage(props: { route: ResolvedRoute }) {
  const doc = props.route.doc as DocPage

  return (
    <section class="docs-layout">
      <aside class="docs-sidebar card">
        <p class="eyebrow">Documentation</p>
        {props.route.docNavigation.map((section) => (
          <div class="docs-sidebar-section" key={section.title}>
            <h3>{section.title}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item.slug || "index"}>
                  <a
                    href={item.href}
                    class={item.slug === doc.slug ? "docs-link-active" : ""}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <article class="doc-main card">
        <header class="doc-header">
          <p class="eyebrow">{doc.section || "overview"}</p>
          <h1>{doc.title}</h1>
          <p class="lead">{doc.description || "No description provided."}</p>
          <p class="slug">source: content/docs/{doc.sourcePath}</p>
        </header>

        <div class="doc-body">
          {doc.blocks.map((block, index) => (
            block.kind === "heading" ? (
              block.level === 1 ? (
                <h1 id={block.id} key={`${block.id || "h1"}-${index}`}>
                  {block.text}
                </h1>
              ) : block.level === 2 ? (
                <h2 id={block.id} key={`${block.id || "h2"}-${index}`}>
                  {block.text}
                </h2>
              ) : (
                <h3 id={block.id} key={`${block.id || "h3"}-${index}`}>
                  {block.text}
                </h3>
              )
            ) : block.kind === "code" ? (
              <pre class="doc-code" key={`code-${index}`}>
                <code>{block.text}</code>
              </pre>
            ) : (
              <p key={`p-${index}`}>{block.text}</p>
            )
          ))}
        </div>

        <div class="doc-nav">
          {props.route.docPrev ? (
            <a
              class="button button-ghost"
              href={props.route.docPrev.slug ? `/docs/${props.route.docPrev.slug}` : "/docs"}
            >
              &lt;- {props.route.docPrev.title}
            </a>
          ) : (
            <span />
          )}
          {props.route.docNext ? (
            <a
              class="button button-ghost"
              href={props.route.docNext.slug ? `/docs/${props.route.docNext.slug}` : "/docs"}
            >
              {props.route.docNext.title} -&gt;
            </a>
          ) : null}
        </div>
      </article>

      <aside class="docs-toc card">
        <p class="eyebrow">On this page</p>
        {doc.headings.length > 0 ? (
          <ul>
            {doc.headings.map((heading) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`} class={heading.level === 3 ? "toc-level-3" : ""}>
                  {heading.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p class="slug">No headings</p>
        )}
      </aside>
    </section>
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
    for (const component of props.components) {
      if (component.toLowerCase().includes(normalizedQuery)) {
        nextComponents.push(component)
      }
    }

    filtered = nextComponents
  }

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Components</p>
        <h1>Browse Components</h1>
        <p class="lead">
          A set of beautifully designed components that you can copy and paste into your apps.
        </p>
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

function ExamplesPage(props: { route: ResolvedRoute }) {
  const activeShowcase = props.route.activeExample
  let query = $state("")
  let filtered: string[] = $state(props.route.examples)

  const updateFilter = (event: Event) => {
    const target = event.target as HTMLInputElement | null
    const nextQuery = target?.value ?? ""
    const normalizedQuery = nextQuery.trim().toLowerCase()

    query = nextQuery

    if (!normalizedQuery) {
      filtered = props.route.examples
      return
    }

    const nextExamples: string[] = []
    for (const example of props.route.examples) {
      if (example.toLowerCase().includes(normalizedQuery)) {
        nextExamples.push(example)
      }
    }

    filtered = nextExamples
  }

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Examples</p>
        <h1>The Foundation for your Design System</h1>
        <p class="lead">
          A set of beautifully designed components that you can customize, extend, and build on.
          Start here then make it your own. Open Source. Open Code.
        </p>
        <div class="cta-row">
          <a class="button" href="/docs/installation">
            Get Started
          </a>
          <a class="button button-ghost" href="/components">
            View Components
          </a>
        </div>
      </div>

      <nav class="section-nav" aria-label="Examples navigation">
        <a class={props.route.exampleSlug === null ? "section-nav-link-active" : ""} href="/examples">
          Examples
        </a>
        {props.route.examplePages.map((showcase) => (
          <a
            key={showcase.slug}
            class={props.route.exampleSlug === showcase.slug ? "section-nav-link-active" : ""}
            href={`/examples/${showcase.slug}`}
          >
            {showcase.title}
          </a>
        ))}
      </nav>

      {activeShowcase ? (
        <article class="card example-detail-card">
          <div class="example-detail-head">
            <h2>{activeShowcase.title}</h2>
            <p class="lead">{activeShowcase.description}</p>
            <p class="slug">route: /examples/{activeShowcase.slug}</p>
          </div>
          <div class="example-preview-grid">
            <figure class="example-preview-card">
              <img
                src={activeShowcase.imageLight}
                alt={`${activeShowcase.title} light preview`}
                loading="lazy"
              />
              <figcaption class="slug">Light preview</figcaption>
            </figure>
            <figure class="example-preview-card">
              <img
                src={activeShowcase.imageDark}
                alt={`${activeShowcase.title} dark preview`}
                loading="lazy"
              />
              <figcaption class="slug">Dark preview</figcaption>
            </figure>
          </div>
        </article>
      ) : (
        <ul class="list-grid">
          {props.route.examplePages.map((showcase) => (
            <li class="card list-item" key={showcase.slug}>
              <h3>
                <a href={`/examples/${showcase.slug}`}>{showcase.title}</a>
              </h3>
              <p>{showcase.description}</p>
              <p class="slug">/examples/{showcase.slug}</p>
            </li>
          ))}
        </ul>
      )}

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

function ChartsPage(props: { route: ResolvedRoute }) {
  const chartTypes = props.route.chartTypes
  const activeType = props.route.activeChartType
  const activeCharts = props.route.chartItems

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Charts</p>
        <h1>Beautiful Charts &amp; Graphs</h1>
        <p class="lead">
          A collection of ready-to-use chart components. From basic charts to rich data displays,
          copy and paste into your apps.
        </p>
        <div class="cta-row">
          <a class="button" href="#charts">
            Browse Charts
          </a>
          <a class="button button-ghost" href="/docs/components/chart">
            Documentation
          </a>
        </div>
      </div>

      <nav class="section-nav" aria-label="Charts navigation">
        {chartTypes.map((type) => (
          <a
            key={type}
            class={activeType === type ? "section-nav-link-active" : ""}
            href={`/charts/${type}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </a>
        ))}
      </nav>

      {activeType ? (
        <div class="card chart-summary-card">
          <p class="eyebrow">{activeType.charAt(0).toUpperCase() + activeType.slice(1)} charts</p>
          <h2>{activeCharts.length} chart recipes</h2>
          <p class="slug">route: /charts/{activeType}</p>
        </div>
      ) : null}

      <ul class="pill-grid">
        {activeCharts.map((chart) => (
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

function BlocksPage(props: { route: ResolvedRoute }) {
  const categories = props.route.blockCategories
  const filteredBlocks = props.route.blocks

  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Blocks</p>
        <h1>Building Blocks for the Web</h1>
        <p class="lead">
          Clean, modern building blocks. Copy and paste into your apps. Open Source. Free forever.
        </p>
        <div class="cta-row">
          <a class="button" href="#blocks">
            Browse Blocks
          </a>
          <a class="button button-ghost" href="/docs/blocks">
            Add a block
          </a>
        </div>
      </div>

      <nav class="section-nav" aria-label="Blocks navigation">
        <a class={props.route.blockCategory === null ? "section-nav-link-active" : ""} href="/blocks">
          Featured
        </a>
        {categories.map((category) => (
          <a
            key={category}
            class={props.route.blockCategory === category ? "section-nav-link-active" : ""}
            href={`/blocks/${category}`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </a>
        ))}
      </nav>

      <ul class="list-grid">
        {filteredBlocks.map((block) => (
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
        <h1>Pick a Color. Make it yours.</h1>
        <p class="lead">
          Try our hand-picked themes. Copy and paste them into your project. New theme editor coming
          soon.
        </p>
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
  return (
    <section class="stack-gap">
      <div>
        <p class="eyebrow">Colors</p>
        <h1>Tailwind Colors in Every Format</h1>
        <p class="lead">
          The complete Tailwind color palette in HEX, RGB, HSL, CSS variables, and classes. Ready to
          copy and paste into your project.
        </p>
      </div>

      <div class="colors-grid" id="colors">
        {colorPalettes.map((palette) => (
          <section class="card color-palette" key={palette.name} id={palette.name}>
            <h2>{palette.name}</h2>
            <div class="color-scales">
              {palette.scales.map((entry) => (
                <article class="color-scale" key={`${palette.name}-${entry.scale}`}>
                  <div class="color-swatch" style={`background:${entry.hex}`}></div>
                  <div class="color-meta">
                    <p class="pill-name">{entry.scale}</p>
                    <p class="slug">{entry.hex}</p>
                    <p class="slug">{entry.rgb}</p>
                    <p class="slug">{entry.hsl}</p>
                    <p class="slug">{entry.oklch}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
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

function buildColorPalettes(): ColorPalette[] {
  const palettes: ColorPalette[] = []

  for (const [name, value] of Object.entries(tailwindColors)) {
    if (!Array.isArray(value)) {
      continue
    }

    if (!isColorScaleArray(value)) {
      continue
    }

    palettes.push({
      name,
      scales: [...value].sort((a, b) => a.scale - b.scale),
    })
  }

  return palettes.sort((a, b) => a.name.localeCompare(b.name))
}

function isColorScaleArray(value: unknown[]): value is ColorScaleEntry[] {
  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      return false
    }

    const maybe = entry as Record<string, unknown>
    if (
      typeof maybe.scale !== "number" ||
      typeof maybe.hex !== "string" ||
      typeof maybe.rgb !== "string" ||
      typeof maybe.hsl !== "string" ||
      typeof maybe.oklch !== "string"
    ) {
      return false
    }
  }

  return true
}
