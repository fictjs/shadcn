import { $state, untrack } from "fict"

import { colors as tailwindColors } from "../registry/_legacy-colors"
import type {
  DocPage,
  DocSummary,
  ResolvedRoute,
  ThemeEntry,
} from "./types"
import { LiveExamplePage } from "./example-pages"

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

type ExampleRootCardKind =
  | "field-demo"
  | "avatars"
  | "spinner-badge"
  | "button-group-input"
  | "field-slider"
  | "input-group-demo"
  | "input-group-button"
  | "item-demo"
  | "appearance-separator"
  | "appearance-settings"
  | "notion-prompt"
  | "button-group-demo"
  | "field-checkbox"
  | "nested-buttons"
  | "field-hear"
  | "spinner-empty";


interface ExampleRootColumn {
  entries: ExampleRootCardKind[]
  className?: string
}

const colorPalettes = buildColorPalettes()
const hiddenThemeNames = new Set(["slate", "stone", "gray", "zinc"])
const examplesRootColumns: ExampleRootColumn[] = [
  {
    entries: ["field-demo"],
  },
  {
    entries: ["avatars", "spinner-badge", "button-group-input", "field-slider", "input-group-demo"],
  },
  {
    entries: ["input-group-button", "item-demo", "appearance-separator", "appearance-settings"],
  },
  {
    className: "examples-root-column-last",
    entries: ["notion-prompt", "button-group-demo", "field-checkbox", "nested-buttons", "field-hear", "spinner-empty"],
  },
]

export function App(props: AppProps) {
  const route = props.route

  return (
    <div class="site-shell">
      <header class="site-header">
        <div class="container header-row">
          <div class="header-primary">
            <a href="/" class="brand-link" aria-label="shadcn/ui home">
              <span class="brand-mark" aria-hidden="true">
                S
              </span>
              <span class="brand-copy">shadcn/ui</span>
            </a>
            <nav class="site-nav" aria-label="Primary">
              <a
                class={route.pathname === "/docs" || route.pathname.startsWith("/docs/") ? "active-nav-link" : ""}
                href="/docs"
              >
                Docs
              </a>
              <a
                class={
                  route.pathname === "/components" ||
                  route.pathname === "/docs/components" ||
                  route.pathname.startsWith("/docs/components/")
                    ? "active-nav-link"
                    : ""
                }
                href="/docs/components"
              >
                Components
              </a>
              <a class={route.pathname === "/blocks" || route.pathname.startsWith("/blocks/") ? "active-nav-link" : ""} href="/blocks">
                Blocks
              </a>
              <a class={route.pathname === "/charts" || route.pathname.startsWith("/charts/") ? "active-nav-link" : ""} href="/charts/area">
                Charts
              </a>
              <a class={route.pathname === "/themes" ? "active-nav-link" : ""} href="/themes">
                Themes
              </a>
              <a class={route.pathname === "/colors" ? "active-nav-link" : ""} href="/colors">
                Colors
              </a>
            </nav>
          </div>

          <div class="header-actions">
            <button type="button" class="header-search-button" aria-label="Search documentation">
              <span class="header-search-copy">Search documentation...</span>
              <span class="header-search-short">Search...</span>
              <span class="header-search-kbd" aria-hidden="true">
                <span>⌘</span>
                <span>K</span>
              </span>
            </button>
            <a class="header-icon-link" href="https://github.com/shadcn-ui/ui" aria-label="GitHub repository">
              GitHub
            </a>
            <button type="button" class="header-icon-link" aria-label="Toggle color mode">
              Light
            </button>
          </div>
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
            <a href="https://github.com/shadcn-ui/ui">GitHub</a>.
          </p>
        </div>
      </footer>
    </div>
  )
}

function HomePage(props: { route: ResolvedRoute }) {
  return (
    <section class="stack-gap">
      <div class="home-hero-card route-page-header">
        <AnnouncementBadge />
        <h1>The Foundation for your Design System</h1>
        <p class="lead">
          A set of beautifully designed components that you can customize, extend, and build on.
          Start here then make it your own. Open Source. Open Code.
        </p>
        <div class="cta-row">
          <a class="button" href="/docs/installation">
            Get Started
          </a>
          <a class="button button-ghost" href="/docs/components">
            View Components
          </a>
        </div>
      </div>

      <div class="route-nav-row">
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
        <ThemeSelectorControl themes={props.route.themes} />
      </div>

      <div class="home-preview-shell">
        <section class="home-mobile-preview">
          <figure class="example-preview-card home-mobile-preview-card">
            <img src="/r/styles/new-york-v4/dashboard-01-light.png" alt="Dashboard" loading="lazy" />
          </figure>
        </section>

        <section class="home-examples-root">
          <div class="home-theme-container">
            <ExamplesRootPreview />
          </div>
        </section>
      </div>
    </section>
  )
}

function ExamplesRootPreview() {
  return (
    <div class="examples-root-grid">
      {examplesRootColumns.map((column, columnIndex) => (
        <div class={`examples-root-column${column.className ? ` ${column.className}` : ""}`} key={`column-${columnIndex}`}>
          {column.entries.map((entry) => (
            <div class="example-root-panel" key={`${columnIndex}-${entry}`}>
              {entry === "field-demo" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-field">
                    <span>Name</span>
                    <strong>shadcn/ui</strong>
                  </div>
                  <div class="root-preview-field">
                    <span>Slug</span>
                    <strong>open-code-system</strong>
                  </div>
                  <div class="root-preview-field">
                    <span>Status</span>
                    <strong>Ready to publish</strong>
                  </div>
                </div>
              ) : null}

              {entry === "avatars" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-avatar-row" aria-label="Avatar group preview">
                    <span>AB</span>
                    <span>CN</span>
                    <span>JT</span>
                    <span>+4</span>
                  </div>
                  <p class="root-preview-copy">Invite collaborators and keep empty states polished.</p>
                </div>
              ) : null}

              {entry === "spinner-badge" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-badge-row">
                    <span class="root-preview-badge root-preview-badge-active">Syncing</span>
                    <span class="root-preview-badge">Ready</span>
                  </div>
                  <div class="root-preview-meter">
                    <span></span>
                  </div>
                </div>
              ) : null}

              {entry === "button-group-input" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-inline-input">
                    <span>Search registry...</span>
                    <button type="button">Go</button>
                  </div>
                  <div class="root-preview-segmented-row">
                    <span>npm</span>
                    <span class="is-active">pnpm</span>
                    <span>bun</span>
                  </div>
                </div>
              ) : null}

              {entry === "field-slider" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-slider-row">
                    <span>Density</span>
                    <div class="root-preview-slider-track"><span></span></div>
                  </div>
                  <div class="root-preview-slider-row">
                    <span>Radius</span>
                    <div class="root-preview-slider-track"><span class="is-wide"></span></div>
                  </div>
                </div>
              ) : null}

              {entry === "input-group-demo" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-inline-input root-preview-inline-input-muted">
                    <span>hello@shadcn.io</span>
                    <span class="root-preview-inline-addon">@</span>
                  </div>
                  <p class="root-preview-copy">Compact input groups with helpful secondary context.</p>
                </div>
              ) : null}

              {entry === "input-group-button" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-inline-input">
                    <span>Paste prompt</span>
                    <button type="button">Run</button>
                  </div>
                  <div class="root-preview-badge-row">
                    <span class="root-preview-badge">AI Ready</span>
                  </div>
                </div>
              ) : null}

              {entry === "item-demo" ? (
                <div class="root-preview-shell root-preview-stack">
                  {[
                    ["Overview", "Updated 2m ago"],
                    ["Docs", "12 sections"],
                    ["Registry", "206 entries"],
                  ].map((row) => (
                    <div class="root-preview-item-row" key={row[0]}>
                      <strong>{row[0]}</strong>
                      <span>{row[1]}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {entry === "appearance-separator" ? (
                <div class="root-preview-separator" aria-hidden="true">
                  <span></span>
                  <p>Appearance Settings</p>
                  <span></span>
                </div>
              ) : null}

              {entry === "appearance-settings" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-badge-row">
                    <span class="root-preview-badge is-active">Default</span>
                    <span class="root-preview-badge">Compact</span>
                    <span class="root-preview-badge">Comfortable</span>
                  </div>
                </div>
              ) : null}

              {entry === "notion-prompt" ? (
                <div class="root-preview-shell root-preview-stack">
                  {[
                    ["✦", "Launch checklist"],
                    ["◎", "Team Directory"],
                    ["→", "Release Notes"],
                  ].map((row) => (
                    <div class="root-preview-item-row" key={row[1]}>
                      <strong>{row[0]}</strong>
                      <span>{row[1]}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {entry === "button-group-demo" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-segmented-row">
                    <span class="is-active">Edit</span>
                    <span>Share</span>
                    <span>Export</span>
                  </div>
                </div>
              ) : null}

              {entry === "field-checkbox" ? (
                <div class="root-preview-shell root-preview-stack">
                  {[
                    "Enable release notes",
                    "Include migration guide",
                    "Ship changelog",
                  ].map((label) => (
                    <div class="root-preview-check-row" key={label}>
                      <span class="root-preview-check"></span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {entry === "nested-buttons" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-split-row">
                    <button type="button">Nested</button>
                    <button type="button">Popover</button>
                  </div>
                  <p class="root-preview-copy">Layered button patterns for dense toolbars.</p>
                </div>
              ) : null}

              {entry === "field-hear" ? (
                <div class="root-preview-shell root-preview-stack">
                  <div class="root-preview-badge-row">
                    <span class="root-preview-badge is-active">Twitter</span>
                    <span class="root-preview-badge">GitHub</span>
                    <span class="root-preview-badge">Docs</span>
                  </div>
                </div>
              ) : null}

              {entry === "spinner-empty" ? (
                <div class="root-preview-shell root-preview-stack root-preview-empty">
                  <div class="root-preview-spinner"></div>
                  <p class="root-preview-copy">Create your first project to start building.</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function ThemeSelectorControl(props: { themes: ThemeEntry[] }) {
  const visibleThemes = props.themes.filter((theme) => !hiddenThemeNames.has(theme.name))

  return (
    <div class="theme-selector-stub">
      <label class="sr-only" for="theme-selector">
        Theme
      </label>
      <span class="theme-selector-prefix">Theme:</span>
      <select
        id="theme-selector"
        aria-label="Theme selector"
      >
        {visibleThemes.map((theme) => (
          <option key={theme.name} value={theme.name}>
            {theme.title === "Neutral" ? "Default" : theme.title}
          </option>
        ))}
      </select>
      <button
        type="button"
        class="button button-ghost theme-selector-copy"
        onClick$={(event: MouseEvent) => {
          if (typeof navigator === "undefined" || !navigator.clipboard) {
            return
          }

          const target = event.currentTarget
          if (!(target instanceof HTMLButtonElement)) {
            return
          }

          const previous = target.previousElementSibling
          if (!(previous instanceof HTMLSelectElement)) {
            return
          }

          const themeName = previous.value
          void navigator.clipboard.writeText(
            `pnpm dlx @fictjs/shadcn@latest theme apply ${themeName}`,
          )
        }}
      >
        Copy Code
      </button>
    </div>
  )
}

function AnnouncementBadge() {
  return (
    <a class="announcement-chip" href="/docs/changelog/2026-01-rtl">
      <span>RTL Support</span>
      <span class="announcement-chip-arrow" aria-hidden="true">
        -&gt;
      </span>
    </a>
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
          <div class="doc-header-main">
            <p class="eyebrow">{doc.section || "overview"}</p>
            <h1>{doc.title}</h1>
            <p class="lead">{doc.description || "No description provided."}</p>
            <p class="slug">source: content/docs/{doc.sourcePath}</p>
          </div>
          <div class="doc-header-actions">
            <button
              type="button"
              class="button button-ghost"
              onClick$={() => {
                if (typeof navigator === "undefined" || !navigator.clipboard || !props.route.doc) {
                  return
                }

                const bodySnapshot = untrack(() => props.route.doc?.body ?? "")
                void navigator.clipboard.writeText(bodySnapshot)
              }}
            >
              Copy Page
            </button>
            {props.route.docPrev ? (
              <a
                class="button button-ghost doc-icon-button"
                href={props.route.docPrev.slug ? `/docs/${props.route.docPrev.slug}` : "/docs"}
                aria-label="Previous page"
              >
                <span aria-hidden="true">&lt;</span>
              </a>
            ) : null}
            {props.route.docNext ? (
              <a
                class="button button-ghost doc-icon-button"
                href={props.route.docNext.slug ? `/docs/${props.route.docNext.slug}` : "/docs"}
                aria-label="Next page"
              >
                <span aria-hidden="true">&gt;</span>
              </a>
            ) : null}
          </div>
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
            ) : block.kind === "list" ? (
              block.ordered ? (
                <ol key={`ol-${index}`}>
                  {(block.items || []).map((item, itemIndex) => (
                    <li key={`oli-${index}-${itemIndex}`}>{item}</li>
                  ))}
                </ol>
              ) : (
                <ul key={`ul-${index}`}>
                  {(block.items || []).map((item, itemIndex) => (
                    <li key={`uli-${index}-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              )
            ) : block.kind === "blockquote" ? (
              <blockquote key={`quote-${index}`}>{block.text}</blockquote>
            ) : block.kind === "hr" ? (
              <hr key={`hr-${index}`} />
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
        ) : null}
        <section class="docs-cta-card">
          <p class="docs-cta-title">Deploy your shadcn/ui app on Vercel</p>
          <p class="docs-cta-copy">Trusted by OpenAI, Sonos, Adobe, and more.</p>
          <p class="docs-cta-copy">
            Vercel provides tools and infrastructure to deploy apps and features at scale.
          </p>
          <a
            class="button docs-cta-button"
            href="https://vercel.com/new?utm_source=shadcn_site&utm_medium=web&utm_campaign=docs_cta_deploy_now_callout"
          >
            Deploy Now
          </a>
        </section>
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
      <div class="route-page-header">
        <AnnouncementBadge />
        <h1>The Foundation for your Design System</h1>
        <p class="lead">
          A set of beautifully designed components that you can customize, extend, and build on.
          Start here then make it your own. Open Source. Open Code.
        </p>
        <div class="cta-row">
          <a class="button" href="/docs/installation">
            Get Started
          </a>
          <a class="button button-ghost" href="/docs/components">
            View Components
          </a>
        </div>
      </div>

      <div class="route-nav-row">
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
        <ThemeSelectorControl themes={props.route.themes} />
      </div>

      {activeShowcase ? (
        <article class="card example-detail-card">
          <div class="example-detail-head">
            <h2>{activeShowcase.title}</h2>
            <p class="lead">{activeShowcase.description}</p>
            <p class="slug">route: /examples/{activeShowcase.slug}</p>
          </div>
          <div class="example-showcase-surface">
            <div class="example-mobile-gallery">
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

            <div class="example-live-stage">
              <LiveExamplePage slug={activeShowcase.slug} />
            </div>
          </div>
        </article>
      ) : (
        <>
          <section class="card home-examples-root">
            <ExamplesRootPreview />
          </section>

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
        </>
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
  const activeCharts = props.route.chartItems.slice(0, 12)
  const emptySlots = Array.from(
    { length: Math.max(0, 12 - activeCharts.length) },
    (_, index) => index,
  )

  return (
    <section class="stack-gap">
      <div class="route-page-header">
        <AnnouncementBadge />
        <h1>Beautiful Charts &amp; Graphs</h1>
        <p class="lead">
          A collection of ready-to-use chart components built with Recharts. From basic charts to
          rich data displays, copy and paste into your apps.
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

      <div class="route-nav-row">
        <nav class="section-nav" aria-label="Charts navigation">
          {chartTypes.map((type) => (
            <a
              key={type}
              class={activeType === type ? "section-nav-link-active" : ""}
              href={`/charts/${type}#charts`}
            >
              {type === "tooltip"
                ? "Tooltips"
                : `${type.charAt(0).toUpperCase() + type.slice(1)} Charts`}
            </a>
          ))}
        </nav>
        <ThemeSelectorControl themes={props.route.themes} />
      </div>

      {activeType ? (
        <div class="card chart-summary-card">
          <p class="eyebrow">{activeType.charAt(0).toUpperCase() + activeType.slice(1)} charts</p>
          <h2>{activeCharts.length} chart recipes</h2>
          <p class="slug">route: /charts/{activeType}</p>
        </div>
      ) : null}

      <div class="charts-grid" id="charts">
        {activeCharts.map((chart) => (
          <article class="card chart-display-card" key={chart}>
            <p class="pill-name">{chart}</p>
            <div class="chart-frame-placeholder" />
            <p class="slug">registry/new-york-v4/charts/{chart}.tsx</p>
          </article>
        ))}
        {emptySlots.map((slot) => (
          <div class="chart-empty-slot" key={`empty-${slot}`} />
        ))}
      </div>
    </section>
  )
}

function BlocksPage(props: { route: ResolvedRoute }) {
  const categories = props.route.blockCategories
  const filteredBlocks = props.route.blocks

  return (
    <section class="stack-gap">
      <div class="route-page-header">
        <AnnouncementBadge />
        <h1>Building Blocks for the Web</h1>
        <p class="lead">
          Clean, modern building blocks. Copy and paste into your apps. Works with all React
          frameworks. Open Source. Free forever.
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

      <div class="section-nav-row">
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
        <a class="button button-ghost section-nav-action" href="/blocks/sidebar">
          Browse all blocks
        </a>
      </div>

      {props.route.blockCategory === null ? (
        <p class="slug">Showing featured blocks from shadcn v4.</p>
      ) : null}

      <ul class="list-grid" id="blocks">
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
  const visibleThemes = props.themes.filter((theme) => !hiddenThemeNames.has(theme.name))
  const initialThemeName = visibleThemes[0]?.name || props.themes[0]?.name || "neutral"
  let activeThemeName = $state(initialThemeName)
  let activeSwatches = $state(getThemeSwatches(initialThemeName))

  return (
    <section class="stack-gap themes-route">
      <div class="route-page-header">
        <AnnouncementBadge />
        <h1>Pick a Color. Make it yours.</h1>
        <p class="lead">
          Try our hand-picked themes. Copy and paste them into your project. New theme editor coming
          soon.
        </p>
        <div class="cta-row">
          <a class="button" href="#themes">
            Browse Themes
          </a>
          <a class="button button-ghost" href="/docs/theming">
            Documentation
          </a>
        </div>
      </div>

      <div class="route-surface-wrapper" id="themes">
        <div class="theme-customizer-shell">
          <div class="theme-customizer-bar">
            <div class="theme-customizer-scroll" aria-label="Theme customizer">
              <div class="theme-customizer-scroll-inner">
                {visibleThemes.map((theme) => (
                  <button
                    type="button"
                    key={theme.name}
                    data-theme-name={theme.name}
                    data-active={activeThemeName === theme.name}
                    class="theme-customizer-pill"
                    onClick$={(event: MouseEvent) => {
                      const target = event.currentTarget
                      if (!(target instanceof HTMLButtonElement)) {
                        return
                      }

                      const themeName = target.dataset.themeName
                      if (!themeName) {
                        return
                      }

                      const nextTheme = props.themes.find((entry) => entry.name === themeName)
                      if (!nextTheme) {
                        return
                      }

                      activeThemeName = nextTheme.name
                      activeSwatches = getThemeSwatches(nextTheme.name)
                    }}
                  >
                    {theme.name === "neutral" ? "Default" : theme.name}
                  </button>
                ))}
              </div>
            </div>

            <div class="theme-customizer-mobile">
              <label class="sr-only" for="themes-route-selector">
                Theme
              </label>
              <span class="theme-selector-prefix">Theme:</span>
              <select
                id="themes-route-selector"
                aria-label="Theme selector"
                onChange$={(event: Event) => {
                  const target = event.currentTarget
                  if (!(target instanceof HTMLSelectElement)) {
                    return
                  }

                  const nextTheme = props.themes.find((entry) => entry.name === target.value)
                  if (!nextTheme) {
                    return
                  }

                  activeThemeName = nextTheme.name
                  activeSwatches = getThemeSwatches(nextTheme.name)
                }}
              >
                {visibleThemes.map((theme) => (
                  <option key={theme.name} value={theme.name}>
                    {theme.name === "neutral" ? "Default" : theme.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              class="button button-ghost theme-copy-button"
              data-theme-name={activeThemeName}
              onClick$={(event: MouseEvent) => {
                if (typeof navigator === "undefined" || !navigator.clipboard) {
                  return
                }

                const target = event.currentTarget
                if (!(target instanceof HTMLButtonElement)) {
                  return
                }

                const themeName = target.dataset.themeName
                if (!themeName) {
                  return
                }

                void navigator.clipboard.writeText(
                  `pnpm dlx @fictjs/shadcn@latest theme apply ${themeName}`,
                )
              }}
            >
              Copy Code
            </button>
          </div>
        </div>
      </div>

      <div class="route-surface-wrapper route-surface-soft">
        <div class="theme-preview-shell">
          <div
            class="theme-preview-stage"
            style={`--theme-accent:${activeSwatches[1] || activeSwatches[0] || "#0f172a"}; --theme-muted:${activeSwatches[4] || activeSwatches[0] || "#e2e8f0"}`}
          >
            <div class="theme-preview-gallery">
              <figure class="example-preview-card">
                <img src="/examples/cards-light.png" alt="Theme cards light preview" loading="lazy" />
                <figcaption class="slug">Cards preview (light)</figcaption>
              </figure>
              <figure class="example-preview-card">
                <img src="/examples/cards-dark.png" alt="Theme cards dark preview" loading="lazy" />
                <figcaption class="slug">Cards preview (dark)</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ColorsPage() {
  return (
    <section class="stack-gap colors-route">
      <div class="route-page-header">
        <AnnouncementBadge />
        <h1>Tailwind Colors in Every Format</h1>
        <p class="lead">
          The complete Tailwind color palette in HEX, RGB, HSL, CSS variables, and classes. Ready to
          copy and paste into your project.
        </p>
        <div class="cta-row">
          <a class="button" href="#colors">
            Browse Colors
          </a>
          <a class="button button-ghost" href="/docs/theming">
            Documentation
          </a>
        </div>
      </div>

      <div class="colors-nav-shell" aria-hidden="true"></div>

      <div class="route-surface-wrapper colors-route-shell">
        <div class="colors-route-grid" id="colors">
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

function getThemeSwatches(themeName: string): string[] {
  const palette = colorPalettes.find((entry) => entry.name === themeName) || colorPalettes[0]
  if (!palette) {
    return ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1"]
  }

  const preferredScales = [950, 700, 500, 300, 100]
  const swatches: string[] = []
  for (const scale of preferredScales) {
    const match = palette.scales.find((entry) => entry.scale === scale)
    if (match) {
      swatches.push(match.hex)
    }
  }

  if (swatches.length > 0) {
    return swatches
  }

  return palette.scales.slice(0, 5).map((entry) => entry.hex)
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
