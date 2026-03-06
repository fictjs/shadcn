import { $state, untrack } from "fict"

import { colors as tailwindColors } from "../registry/_legacy-colors"
import type {
  BlockEntry,
  DocContentBlock,
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

const chartDisplayOrder: Record<string, string[]> = {
  area: [
    "chart-area-interactive",
    "chart-area-default",
    "chart-area-linear",
    "chart-area-step",
    "chart-area-legend",
    "chart-area-stacked",
    "chart-area-stacked-expand",
    "chart-area-icons",
    "chart-area-gradient",
    "chart-area-axes",
  ],
  bar: [
    "chart-bar-interactive",
    "chart-bar-default",
    "chart-bar-horizontal",
    "chart-bar-multiple",
    "chart-bar-stacked",
    "chart-bar-label",
    "chart-bar-label-custom",
    "chart-bar-mixed",
    "chart-bar-active",
    "chart-bar-negative",
  ],
  line: [
    "chart-line-interactive",
    "chart-line-default",
    "chart-line-linear",
    "chart-line-step",
    "chart-line-multiple",
    "chart-line-dots",
    "chart-line-dots-custom",
    "chart-line-dots-colors",
    "chart-line-label",
    "chart-line-label-custom",
  ],
  pie: [
    "chart-pie-simple",
    "chart-pie-separator-none",
    "chart-pie-label",
    "chart-pie-label-custom",
    "chart-pie-label-list",
    "chart-pie-legend",
    "chart-pie-donut",
    "chart-pie-donut-active",
    "chart-pie-donut-text",
    "chart-pie-stacked",
    "chart-pie-interactive",
  ],
  radar: [
    "chart-radar-default",
    "chart-radar-dots",
    "chart-radar-lines-only",
    "chart-radar-label-custom",
    "chart-radar-grid-custom",
    "chart-radar-grid-none",
    "chart-radar-grid-circle",
    "chart-radar-grid-circle-no-lines",
    "chart-radar-grid-circle-fill",
    "chart-radar-grid-fill",
    "chart-radar-multiple",
    "chart-radar-legend",
    "chart-radar-icons",
    "chart-radar-radius",
  ],
  radial: [
    "chart-radial-simple",
    "chart-radial-label",
    "chart-radial-grid",
    "chart-radial-text",
    "chart-radial-shape",
    "chart-radial-stacked",
  ],
  tooltip: [
    "chart-tooltip-default",
    "chart-tooltip-indicator-line",
    "chart-tooltip-indicator-none",
    "chart-tooltip-label-custom",
    "chart-tooltip-label-formatter",
    "chart-tooltip-label-none",
    "chart-tooltip-formatter",
    "chart-tooltip-icons",
    "chart-tooltip-advanced",
  ],
}

const fullWidthChartIds = new Set([
  "chart-area-interactive",
  "chart-bar-interactive",
  "chart-line-interactive",
])

function formatDisplayLabel(value: string): string {
  const normalized = value.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()
  return normalized
}

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
    <section class="docs-layout" data-slot="docs">
      <aside class="docs-sidebar">
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

      <article class="doc-main">
        <div class="doc-main-shell">
          <header class="doc-header">
            <div class="doc-header-main">
              <p class="eyebrow">{doc.section || "overview"}</p>
              <h1>{doc.title}</h1>
              <p class="lead">{doc.description || "No description provided."}</p>
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
            <DocBlockList blocks={doc.blocks} />
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
        </div>
      </article>

      <aside class="docs-toc">
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

function DocBlockList(props: { blocks: DocContentBlock[]; keyPrefix?: string }) {
  const keyPrefix = props.keyPrefix || "doc-block"

  return props.blocks.map((block, index) => renderDocBlock(block, `${keyPrefix}-${index}`))
}

function renderDocBlock(block: DocContentBlock, key: string) {
  return block.kind === "heading" ? (
    block.level === 1 ? (
      <h1 id={block.id} key={key}>
        {block.text}
      </h1>
    ) : block.level === 2 ? (
      <h2 id={block.id} key={key}>
        {block.text}
      </h2>
    ) : (
      <h3 id={block.id} key={key}>
        {block.text}
      </h3>
    )
  ) : block.kind === "code" ? (
    <pre class="doc-code" key={key}>
      <code>{block.text}</code>
    </pre>
  ) : block.kind === "list" ? (
    block.ordered ? (
      <ol key={key}>
        {(block.items || []).map((item, itemIndex) => (
          <li key={`${key}-item-${itemIndex}`}>{item}</li>
        ))}
      </ol>
    ) : (
      <ul key={key}>
        {(block.items || []).map((item, itemIndex) => (
          <li key={`${key}-item-${itemIndex}`}>{item}</li>
        ))}
      </ul>
    )
  ) : block.kind === "blockquote" ? (
    <blockquote key={key}>{block.text}</blockquote>
  ) : block.kind === "image" ? (
    <figure class="doc-image" key={key}>
      <img src={block.src || ""} alt={block.alt || block.text || "Documentation image"} loading="lazy" />
    </figure>
  ) : block.kind === "hr" ? (
    <hr key={key} />
  ) : block.kind === "callout" ? (
    <section class="doc-callout" key={key}>
      {block.title ? <p class="doc-callout-title">{block.title}</p> : null}
      <div class="doc-callout-body">
        <DocBlockList blocks={untrack(() => block.children || [])} keyPrefix={`${key}-callout`} />
      </div>
    </section>
  ) : block.kind === "tabs" ? (
    <DocTabsBlock panels={untrack(() => block.panels || [])} blockKey={key} />
  ) : block.kind === "component-preview" || block.kind === "component-source" ? (
    <DocComponentBlock block={untrack(() => block)} />
  ) : (
    <p key={key}>{block.text}</p>
  )
}

function DocTabsBlock(props: { panels: Array<{ value: string; label: string; blocks: DocContentBlock[] }>; blockKey: string }) {
  const panels = untrack(() => props.panels)
  let activeValue = $state("")

  const currentValue = activeValue || panels[0]?.value || ""
  const activePanel = panels.find((panel) => panel.value === currentValue) || panels[0] || null

  return (
    <section class="doc-tabs">
      <div class="doc-tabs-list" role="tablist" aria-label="Documentation tabs">
        {panels.map((panel) => (
          <button
            type="button"
            key={`${props.blockKey}-${panel.value}`}
            data-value={panel.value}
            class={panel.value === currentValue ? "doc-tab-button doc-tab-button-active" : "doc-tab-button"}
            onClick$={(event: MouseEvent) => {
              const target = event.currentTarget
              if (!(target instanceof HTMLButtonElement)) {
                return
              }

              const nextValue = target.dataset.value || ""
              if (!nextValue) {
                return
              }

              activeValue = nextValue
            }}
          >
            {panel.label}
          </button>
        ))}
      </div>

      <div class="doc-tabs-panel">
        {activePanel ? <DocBlockList blocks={activePanel.blocks} keyPrefix={`${props.blockKey}-${activePanel.value}`} /> : null}
      </div>
    </section>
  )
}

function DocComponentBlock(props: { block: DocContentBlock }) {
  const data = untrack(() => {
    const block = props.block

    return {
      kind: block.kind,
      direction: block.direction || "ltr",
      filePath: block.filePath || "",
      code: block.code || "",
      headingText: block.title || block.filePath || block.text,
      family: getDocPreviewFamily(block.name || block.text),
      previewCode: block.code ? truncateDocCode(block.code, 12) : "",
    }
  })

  return (
    <section class={data.kind === "component-preview" ? "doc-component-card" : "doc-component-card doc-component-card-source"}>
      <div class="doc-component-head">
        <div class="doc-component-copy">
          <p class="eyebrow">{data.kind === "component-preview" ? "Preview" : "Source"}</p>
          <h3>{data.headingText}</h3>
        </div>
        {data.filePath ? <p class="slug">{data.filePath}</p> : null}
      </div>

      {data.kind === "component-preview" ? (
        <>
          <div class="doc-component-preview-stage" dir={data.direction}>
            <DocComponentPreviewSurface family={data.family} />
          </div>
          {data.previewCode ? (
            <pre class="doc-code doc-component-snippet">
              <code>{data.previewCode}</code>
            </pre>
          ) : null}
        </>
      ) : data.code ? (
        <pre class="doc-code doc-component-source-code">
          <code>{data.code}</code>
        </pre>
      ) : (
        <p>Source is not available for this registry entry yet.</p>
      )}
    </section>
  )
}

function DocComponentPreviewSurface(props: { family: string }) {
  const family = untrack(() => props.family)

  return family === "avatar" ? (
    <div class="doc-preview-avatar-row">
      <span>CN</span>
      <span>ER</span>
      <span>LR</span>
    </div>
  ) : family === "button" || family === "button-group" || family === "toggle" || family === "toggle-group" || family === "badge" ? (
    <div class="doc-preview-chip-row">
      <span class="is-primary">Primary</span>
      <span>Outline</span>
      <span>Ghost</span>
    </div>
  ) : family === "input" || family === "input-group" || family === "select" || family === "native-select" || family === "combobox" || family === "textarea" || family === "field" || family === "input-otp" ? (
    <div class="doc-preview-form-stack">
      <div class="doc-preview-input-row">
        <span>Email</span>
        <strong>name@example.com</strong>
      </div>
      <div class="doc-preview-input-row">
        <span>Status</span>
        <strong>Ready</strong>
      </div>
      <div class="doc-preview-meter">
        <span></span>
      </div>
    </div>
  ) : family === "card" || family === "alert" || family === "alert-dialog" || family === "dialog" || family === "drawer" || family === "sheet" || family === "popover" || family === "hover-card" ? (
    <div class="doc-preview-card-shell">
      <h4>Ready to ship</h4>
      <p>Compose accessible surfaces with clear hierarchy and actions.</p>
      <div class="doc-preview-chip-row">
        <span class="is-primary">Continue</span>
        <span>Cancel</span>
      </div>
    </div>
  ) : family === "table" || family === "data-table" ? (
    <div class="doc-preview-table-shell">
      <div class="doc-preview-table-row doc-preview-table-row-head">
        <span>Status</span>
        <span>Team</span>
        <span>Owner</span>
      </div>
      <div class="doc-preview-table-row">
        <span>Done</span>
        <span>Design</span>
        <span>CN</span>
      </div>
      <div class="doc-preview-table-row">
        <span>Review</span>
        <span>Growth</span>
        <span>MK</span>
      </div>
    </div>
  ) : family === "chart" ? (
    <svg class="doc-preview-chart" viewBox="0 0 320 140" role="img" aria-label="Component chart preview">
      <path d="M20 106 L72 78 L124 90 L176 54 L228 64 L280 34 L280 124 L20 124 Z" class="doc-preview-chart-fill" />
      <path d="M20 106 L72 78 L124 90 L176 54 L228 64 L280 34" class="doc-preview-chart-line" />
    </svg>
  ) : family === "tabs" || family === "accordion" || family === "collapsible" || family === "navigation-menu" || family === "menubar" || family === "context-menu" || family === "dropdown-menu" || family === "breadcrumb" || family === "pagination" || family === "sidebar" ? (
    <div class="doc-preview-nav-shell">
      <div class="doc-preview-chip-row">
        <span class="is-primary">Overview</span>
        <span>Usage</span>
        <span>API</span>
      </div>
      <div class="doc-preview-card-shell doc-preview-card-shell-compact">
        <p>Structured navigation and progressive disclosure.</p>
      </div>
    </div>
  ) : family === "typography" || family === "kbd" ? (
    <div class="doc-preview-type-stack">
      <strong>The quick brown fox jumps over the lazy dog.</strong>
      <p>Purposeful type, rhythm, and hierarchy.</p>
      <div class="doc-preview-chip-row">
        <span>⌘</span>
        <span>K</span>
      </div>
    </div>
  ) : family === "empty" || family === "skeleton" || family === "spinner" || family === "progress" || family === "separator" ? (
    <div class="doc-preview-feedback-shell">
      <div class="doc-preview-spinner"></div>
      <div class="doc-preview-meter">
        <span class="is-wide"></span>
      </div>
    </div>
  ) : (
    <div class="doc-preview-card-shell">
      <h4>{formatDisplayLabel(family || "component preview")}</h4>
      <p>Registry preview surface for this documentation example.</p>
    </div>
  )
}

function getDocPreviewFamily(name: string): string {
  const normalized = name.replace(/-(rtl|ltr)$/g, "")
  const families = [
    "dropdown-menu",
    "navigation-menu",
    "context-menu",
    "button-group",
    "data-table",
    "input-group",
    "native-select",
    "input-otp",
    "hover-card",
    "alert-dialog",
    "scroll-area",
    "radio-group",
    "date-picker",
    "aspect-ratio",
    "toggle-group",
    "collapsible",
    "combobox",
    "menubar",
    "carousel",
    "accordion",
    "separator",
    "typography",
    "breadcrumb",
    "checkbox",
    "pagination",
    "skeleton",
    "popover",
    "progress",
    "resizable",
    "textarea",
    "calendar",
    "sidebar",
    "tooltip",
    "avatar",
    "button",
    "switch",
    "select",
    "dialog",
    "drawer",
    "sheet",
    "table",
    "empty",
    "badge",
    "field",
    "input",
    "label",
    "alert",
    "toggle",
    "tabs",
    "item",
    "chart",
    "card",
    "mode-toggle",
    "kbd",
  ]

  for (const family of families) {
    if (normalized === family || normalized.startsWith(`${family}-`)) {
      return family
    }
  }

  return normalized
}

function truncateDocCode(value: string, lineLimit: number): string {
  const lines = value.split("\n")
  return lines.length <= lineLimit ? value : `${lines.slice(0, lineLimit).join("\n")}\n...`
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
          <div class="example-showcase-surface">
            <div class="example-mobile-gallery">
              <img
                class="example-mobile-image"
                src={activeShowcase.imageLight}
                alt={`${activeShowcase.title} preview`}
                loading="lazy"
              />
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
        </>
      )}
    </section>
  )
}

function getChartFamilyLabel(chartId: string): string {
  if (chartId.includes("chart-area")) {
    return "Area Chart"
  }
  if (chartId.includes("chart-bar")) {
    return "Bar Chart"
  }
  if (chartId.includes("chart-line")) {
    return "Line Chart"
  }
  if (chartId.includes("chart-pie")) {
    return "Pie Chart"
  }
  if (chartId.includes("chart-radar")) {
    return "Radar Chart"
  }
  if (chartId.includes("chart-radial")) {
    return "Radial Chart"
  }
  if (chartId.includes("chart-tooltip")) {
    return "Tooltip"
  }
  return formatDisplayLabel(chartId)
}

function ChartPreviewSurface(props: { chartId: string }) {
  return props.chartId.includes("chart-bar") ? (
    <BarChartPreviewSurface chartId={props.chartId} />
  ) : props.chartId.includes("chart-pie") ? (
    <PieChartPreviewSurface chartId={props.chartId} />
  ) : props.chartId.includes("chart-radar") ? (
    <RadarChartPreviewSurface chartId={props.chartId} />
  ) : props.chartId.includes("chart-radial") ? (
    <RadialChartPreviewSurface chartId={props.chartId} />
  ) : props.chartId.includes("chart-tooltip") ? (
    <TooltipChartPreviewSurface chartId={props.chartId} />
  ) : props.chartId.includes("chart-line") ? (
    <LineChartPreviewSurface chartId={props.chartId} />
  ) : (
    <AreaChartPreviewSurface chartId={props.chartId} />
  )
}

function AreaChartPreviewSurface(props: { chartId: string }) {
  const interactive = props.chartId.endsWith("interactive")

  return (
    <div class={`chart-preview-stage chart-preview-area${interactive ? " is-interactive" : ""}`}>
      <div class="chart-preview-header">
        <div>
          <p class="chart-preview-heading">Revenue</p>
          <span>April - June</span>
        </div>
        {interactive ? <span class="chart-preview-chip">90 days</span> : null}
      </div>
      <svg viewBox="0 0 360 180" class="chart-preview-svg" aria-hidden="true">
        <path class="chart-grid-line" d="M24 30H336" />
        <path class="chart-grid-line" d="M24 78H336" />
        <path class="chart-grid-line" d="M24 126H336" />
        <path class="chart-area-fill" d="M24 132C64 110 88 60 124 72C158 84 188 146 226 112C262 80 300 36 336 54V160H24Z" />
        <path class="chart-line-secondary" d="M24 118C58 106 88 92 124 100C160 108 192 132 226 116C262 98 298 88 336 94" />
        <path class="chart-line-primary" d="M24 132C64 110 88 60 124 72C158 84 188 146 226 112C262 80 300 36 336 54" />
      </svg>
      <div class="chart-preview-legend">
        <span><i class="chart-accent-dot"></i> Desktop</span>
        <span><i class="chart-muted-dot"></i> Mobile</span>
      </div>
    </div>
  )
}

function LineChartPreviewSurface(props: { chartId: string }) {
  const interactive = props.chartId.endsWith("interactive")

  return (
    <div class={`chart-preview-stage chart-preview-line${interactive ? " is-interactive" : ""}`}>
      <div class="chart-preview-header">
        <div>
          <p class="chart-preview-heading">Visitors</p>
          <span>Performance trend</span>
        </div>
        {interactive ? <span class="chart-preview-chip">Live</span> : null}
      </div>
      <svg viewBox="0 0 360 180" class="chart-preview-svg" aria-hidden="true">
        <path class="chart-grid-line" d="M24 36H336" />
        <path class="chart-grid-line" d="M24 84H336" />
        <path class="chart-grid-line" d="M24 132H336" />
        <path class="chart-line-secondary" d="M24 122L70 104L116 112L162 86L208 102L254 72L300 80L336 64" />
        <path class="chart-line-primary" d="M24 138L70 88L116 96L162 62L208 118L254 94L300 42L336 58" />
      </svg>
      <div class="chart-preview-legend">
        <span><i class="chart-accent-dot"></i> Desktop</span>
        <span><i class="chart-muted-dot"></i> Mobile</span>
      </div>
    </div>
  )
}

function BarChartPreviewSurface(props: { chartId: string }) {
  const interactive = props.chartId.endsWith("interactive")
  const bars = interactive
    ? [84, 56, 73, 92, 61, 78, 48, 67]
    : [58, 42, 76, 51, 69, 63, 55, 81]

  return (
    <div class={`chart-preview-stage chart-preview-bar${interactive ? " is-interactive" : ""}`}>
      <div class="chart-preview-header">
        <div>
          <p class="chart-preview-heading">Conversions</p>
          <span>Weekly totals</span>
        </div>
        {interactive ? <span class="chart-preview-chip">Compare</span> : null}
      </div>
      <div class="chart-bar-grid" aria-hidden="true">
        {bars.map((height, index) => (
          <div class="chart-bar-group" key={`${props.chartId}-${index}`}>
            <span class="chart-bar chart-bar-muted" style={`--bar-height:${Math.max(26, height - 18)}%`}></span>
            <span class="chart-bar chart-bar-accent" style={`--bar-height:${height}%`}></span>
          </div>
        ))}
      </div>
      <div class="chart-preview-legend">
        <span><i class="chart-accent-dot"></i> Desktop</span>
        <span><i class="chart-muted-dot"></i> Mobile</span>
      </div>
    </div>
  )
}

function PieChartPreviewSurface(props: { chartId: string }) {
  const interactive = props.chartId.endsWith("interactive")

  return (
    <div class={`chart-preview-stage chart-preview-pie${interactive ? " is-interactive" : ""}`}>
      <div class="chart-preview-header">
        <div>
          <p class="chart-preview-heading">Traffic sources</p>
          <span>Channel mix</span>
        </div>
        {interactive ? <span class="chart-preview-chip">Hover</span> : null}
      </div>
      <div class="chart-pie-layout" aria-hidden="true">
        <div class="chart-pie-ring"></div>
        <div class="chart-pie-metrics">
          <strong>64%</strong>
          <span>Organic</span>
          <span>22% Referral</span>
          <span>14% Paid</span>
        </div>
      </div>
    </div>
  )
}

function RadarChartPreviewSurface(props: { chartId: string }) {
  const label = props.chartId.replace(/^chart-radar-/, "").split("-").join(" ")

  return (
    <div class="chart-preview-stage chart-preview-radar">
      <div class="chart-preview-header">
        <div>
          <p class="chart-preview-heading">Capability score</p>
          <span>{label}</span>
        </div>
      </div>
      <svg viewBox="0 0 240 180" class="chart-preview-svg chart-preview-radar-svg" aria-hidden="true">
        <polygon class="chart-radar-grid-shape" points="120,22 196,66 168,150 72,150 44,66" />
        <polygon class="chart-radar-grid-shape" points="120,48 172,76 154,132 86,132 68,76" />
        <polygon class="chart-radar-grid-shape" points="120,70 152,86 142,116 98,116 88,86" />
        <polygon class="chart-radar-fill" points="120,32 180,78 150,138 82,126 58,74" />
        <polygon class="chart-radar-line" points="120,32 180,78 150,138 82,126 58,74" />
      </svg>
    </div>
  )
}

function RadialChartPreviewSurface(props: { chartId: string }) {
  const label = props.chartId.replace(/^chart-radial-/, "").split("-").join(" ")

  return (
    <div class="chart-preview-stage chart-preview-radial">
      <div class="chart-preview-header">
        <div>
          <p class="chart-preview-heading">Completion</p>
          <span>{label}</span>
        </div>
      </div>
      <div class="chart-radial-layout" aria-hidden="true">
        <div class="chart-radial-ring">
          <div class="chart-radial-center">
            <strong>78%</strong>
            <span>Target</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TooltipChartPreviewSurface(props: { chartId: string }) {
  const label = props.chartId.replace(/^chart-tooltip-/, "").split("-").join(" ")

  return (
    <div class="chart-preview-stage chart-preview-tooltip">
      <div class="chart-preview-header">
        <div>
          <p class="chart-preview-heading">Tooltip pattern</p>
          <span>{label}</span>
        </div>
      </div>
      <div class="chart-tooltip-layout">
        <svg viewBox="0 0 360 160" class="chart-preview-svg" aria-hidden="true">
          <path class="chart-grid-line" d="M24 36H336" />
          <path class="chart-grid-line" d="M24 82H336" />
          <path class="chart-grid-line" d="M24 128H336" />
          <path class="chart-line-primary" d="M24 128L82 104L134 116L188 70L244 82L296 46L336 58" />
        </svg>
        <div class="chart-tooltip-card">
          <strong>Tue, Apr 9</strong>
          <span>Desktop: 409</span>
          <span>Mobile: 320</span>
        </div>
      </div>
    </div>
  )
}

function ChartsPage(props: { route: ResolvedRoute }) {
  const chartTypes = props.route.chartTypes
  const activeType = props.route.activeChartType
  const visibleCharts = untrack(() => {
    const orderedCharts: Array<{ id: string; fullWidth: boolean }> = []
    const seenChartIds = new Set<string>()
    const preferredCharts = activeType ? chartDisplayOrder[activeType] || [] : []

    for (const chartId of preferredCharts) {
      if (props.route.chartItems.includes(chartId)) {
        orderedCharts.push({
          id: chartId,
          fullWidth: fullWidthChartIds.has(chartId),
        })
        seenChartIds.add(chartId)
      }
    }

    for (const chartId of props.route.chartItems) {
      if (!seenChartIds.has(chartId)) {
        orderedCharts.push({
          id: chartId,
          fullWidth: fullWidthChartIds.has(chartId),
        })
        seenChartIds.add(chartId)
      }
    }

    return orderedCharts.slice(0, 12)
  })
  const emptySlots = Array.from(
    { length: Math.max(0, 12 - visibleCharts.length) },
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
          <h2>{visibleCharts.length} chart recipes</h2>
          <p class="lead">Curated previews from the v4 registry, ordered like the upstream chart gallery.</p>
        </div>
      ) : null}

      <div class="charts-grid" id="charts">
        {visibleCharts.map((chart) => (
          <article class="card chart-display-card" data-full-width={chart.fullWidth ? "true" : "false"} key={chart.id}>
            <div class="chart-display-toolbar">
              <div class="chart-display-title">
                <p class="pill-name">{getChartFamilyLabel(chart.id)}</p>
                <p class="slug">{chart.id}</p>
              </div>
              <div class="chart-display-actions">
                <button
                  type="button"
                  class="button button-ghost chart-display-button"
                  data-chart-id={chart.id}
                  onClick$={(event: MouseEvent) => {
                    if (typeof navigator === "undefined" || !navigator.clipboard) {
                      return
                    }

                    const target = event.currentTarget
                    if (!(target instanceof HTMLButtonElement)) {
                      return
                    }

                    const chartId = target.dataset.chartId
                    if (!chartId) {
                      return
                    }

                    void navigator.clipboard.writeText(`registry/new-york-v4/charts/${chartId}.tsx`)
                  }}
                >
                  Copy Path
                </button>
                <a class="button button-ghost chart-display-button" href="/docs/components/chart">
                  Docs
                </a>
              </div>
            </div>
            <ChartPreviewSurface chartId={chart.id} />
            <p class="slug">registry/new-york-v4/charts/{chart.id}.tsx</p>
          </article>
        ))}
        {emptySlots.map((slot) => (
          <div class="chart-empty-slot" key={`empty-${slot}`} />
        ))}
      </div>
    </section>
  )
}

function BlockPreviewSurface(props: { block: BlockEntry }) {
  const blockName = props.block.name
  const hasImagePreview =
    blockName.startsWith("dashboard-") || blockName.startsWith("login-") || blockName.startsWith("sidebar-")

  return hasImagePreview ? (
    <div class="block-preview-stage">
      <img
        class="block-preview-image"
        src={`/r/styles/new-york-v4/${blockName}-light.png`}
        alt={formatDisplayLabel(blockName)}
        loading="lazy"
      />
    </div>
  ) : blockName.startsWith("signup-") ? (
    <div class="block-preview-stage block-preview-fallback block-preview-auth">
      <div class="block-auth-shell">
        <div class="block-auth-card">
          <p class="block-auth-eyebrow">Create account</p>
          <div class="block-auth-input"></div>
          <div class="block-auth-input"></div>
          <div class="block-auth-input"></div>
          <div class="block-auth-button"></div>
        </div>
      </div>
    </div>
  ) : (
    <div class="block-preview-stage block-preview-fallback">
      <div class="block-generic-shell">
        <div class="block-generic-rail"></div>
        <div class="block-generic-body">
          <div class="block-generic-row"></div>
          <div class="block-generic-row is-wide"></div>
          <div class="block-generic-grid">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlocksPage(props: { route: ResolvedRoute }) {
  const categories = props.route.blockCategories
  const filteredBlocks = props.route.blocks
  const isFeaturedRoute = props.route.blockCategory === null

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

      <div class="blocks-stack" id="blocks">
        {filteredBlocks.map((block) => (
          <article class="card block-display-card" key={block.name}>
            <div class="block-display-toolbar">
              <div class="block-display-title">
                <p class="pill-name">{formatDisplayLabel(block.name)}</p>
                <h3>{block.description}</h3>
                <p class="slug">categories: {block.categories.join(", ") || "uncategorized"}</p>
              </div>
              <div class="block-display-actions">
                <button
                  type="button"
                  class="button button-ghost block-display-button"
                  data-block-name={block.name}
                  onClick$={(event: MouseEvent) => {
                    if (typeof navigator === "undefined" || !navigator.clipboard) {
                      return
                    }

                    const target = event.currentTarget
                    if (!(target instanceof HTMLButtonElement)) {
                      return
                    }

                    const blockName = target.dataset.blockName
                    if (!blockName) {
                      return
                    }

                    void navigator.clipboard.writeText(`npx @fictjs/shadcn@latest add ${blockName}`)
                  }}
                >
                  Copy Command
                </button>
                <a class="button button-ghost block-display-button" href="/docs/blocks">
                  Docs
                </a>
              </div>
            </div>
            <BlockPreviewSurface block={block} />
          </article>
        ))}
      </div>

      {isFeaturedRoute ? (
        <div class="blocks-browse-more">
          <a class="button button-ghost" href="/blocks/sidebar">
            Browse more blocks
          </a>
        </div>
      ) : null}
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
