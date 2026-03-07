import { installResumableLoader } from "@fictjs/runtime/loader"

import "./App"
import "./styles.css"

async function loadManifest(): Promise<void> {
  if (!import.meta.env.PROD) {
    return
  }

  try {
    const response = await fetch("/fict.manifest.json")
    if (!response.ok) {
      return
    }
    const manifest = await response.json()
    ;(globalThis as Record<string, unknown>).__FICT_MANIFEST__ = manifest
  } catch {
    return
  }
}

async function initResumableClient(): Promise<void> {
  wireColorModeManager()
  wireLayoutManager()
  wireSiteChrome()
  wireDocTabsFallback()

  await loadManifest()
  installResumableLoader({
    document,
    events: ["click", "input", "change", "submit"],
    prefetch: {
      visibility: true,
      visibilityMargin: "200px",
      hover: true,
      hoverDelay: 50,
    },
  })

  wireThemeExperience()
  wireCreateRoute()
  wireClientFilters()
  document.documentElement.dataset.clientReady = "true"
}

function wireDocTabsFallback(): void {
  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const button = target.closest(".doc-tab-button")
    if (!(button instanceof HTMLButtonElement)) {
      return
    }

    const tabsRoot = button.closest(".doc-tabs")
    if (!(tabsRoot instanceof HTMLElement)) {
      return
    }

    const nextPanelValue = button.dataset.panelValue
    if (!nextPanelValue) {
      return
    }

    tabsRoot.querySelectorAll<HTMLButtonElement>(".doc-tab-button").forEach((tabButton) => {
      const isActive = tabButton.dataset.panelValue === nextPanelValue
      tabButton.classList.toggle("doc-tab-button-active", isActive)
      tabButton.setAttribute("aria-selected", isActive ? "true" : "false")
    })

    tabsRoot.querySelectorAll<HTMLElement>(".doc-tab-panel-section").forEach((panelSection) => {
      panelSection.hidden = panelSection.dataset.panelValue !== nextPanelValue
    })
  })
}

function wireClientFilters(): void {
  const filterPairs: Array<{ inputId: string; listSelector: string }> = [
    { inputId: "docs-filter", listSelector: "ul.list-grid" },
    { inputId: "component-filter", listSelector: "ul.pill-grid" },
    { inputId: "example-filter", listSelector: "ul.pill-grid" },
    { inputId: "chart-filter", listSelector: "ul.pill-grid" },
    { inputId: "theme-filter", listSelector: "ul.list-grid" },
  ]

  for (const pair of filterPairs) {
    const input = document.getElementById(pair.inputId)
    if (!(input instanceof HTMLInputElement)) {
      continue
    }

    const list = input.closest("section")?.querySelector(pair.listSelector)
    if (!(list instanceof HTMLElement)) {
      continue
    }

    const applyFilter = () => {
      const normalizedQuery = input.value.trim().toLowerCase()
      const items = list.querySelectorAll(":scope > li")
      for (const item of items) {
        if (!(item instanceof HTMLElement)) {
          continue
        }
        const text = item.textContent?.toLowerCase() ?? ""
        const visible = normalizedQuery.length === 0 || text.includes(normalizedQuery)
        item.style.display = visible ? "" : "none"
      }
    }

    input.addEventListener("input", applyFilter)
  }
}

const colorModeStorageKey = "shadcn-v4-color-mode"
const routeThemeStorageKey = "shadcn-v4-active-theme"
const layoutStorageKey = "layout"

type CreateCatalogKind = "component" | "example" | "block" | "chart"

interface CreateCatalogItem {
  id: string
  title: string
  description: string
  kind: CreateCatalogKind
}

const siteSearchEntries = [
  { href: "/", title: "Home", kind: "Page", description: "Landing page with featured examples." },
  { href: "/docs", title: "Docs", kind: "Page", description: "Browse the documentation tree." },
  { href: "/docs/components", title: "Components", kind: "Page", description: "Browse component documentation." },
  { href: "/examples", title: "Examples", kind: "Page", description: "Explore live examples and application shells." },
  { href: "/examples/dashboard", title: "Dashboard", kind: "Example", description: "Admin dashboard example." },
  { href: "/examples/tasks", title: "Tasks", kind: "Example", description: "Task tracker example." },
  { href: "/examples/playground", title: "Playground", kind: "Example", description: "Prompt playground example." },
  { href: "/examples/authentication", title: "Authentication", kind: "Example", description: "Authentication example." },
  { href: "/examples/rtl", title: "RTL", kind: "Example", description: "Right-to-left example." },
  { href: "/charts/area", title: "Charts", kind: "Page", description: "Chart preview gallery." },
  { href: "/blocks", title: "Blocks", kind: "Page", description: "Higher-level UI blocks." },
  { href: "/themes", title: "Themes", kind: "Page", description: "Theme customizer and previews." },
  { href: "/colors", title: "Colors", kind: "Page", description: "Tailwind color scales." },
  { href: "/create", title: "New Project", kind: "Page", description: "Build a starter workspace." },
]

const mobileMenuLinks = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/components", label: "Components" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/blocks", label: "Blocks" },
  { href: "/charts/area", label: "Charts" },
  { href: "/themes", label: "Themes" },
  { href: "/colors", label: "Colors" },
  { href: "/create", label: "New Project" },
]

const createCatalogItems: Record<CreateCatalogKind, CreateCatalogItem[]> = {
  component: [
    { id: "button", title: "Button", description: "registry/new-york-v4/ui/button.tsx", kind: "component" },
    { id: "input", title: "Input", description: "registry/new-york-v4/ui/input.tsx", kind: "component" },
    { id: "dialog", title: "Dialog", description: "registry/new-york-v4/ui/dialog.tsx", kind: "component" },
  ],
  example: [
    { id: "dashboard", title: "Dashboard Example", description: "Admin dashboard example using cards, charts, tables, and sidebar layouts.", kind: "example" },
    { id: "tasks", title: "Tasks Example", description: "A task and issue tracker build using Tanstack Table.", kind: "example" },
    { id: "playground", title: "Playground Example", description: "The OpenAI Playground built using the components.", kind: "example" },
  ],
  block: [
    { id: "dashboard-01", title: "Dashboard 01", description: "Dense dashboard block with sidebar chrome and analytics surfaces.", kind: "block" },
    { id: "sidebar-07", title: "Sidebar 07", description: "A navigational shell with projects, teams, and user rails.", kind: "block" },
    { id: "login-03", title: "Login 03", description: "Authentication block with split-brand layout and simple form framing.", kind: "block" },
  ],
  chart: [
    { id: "chart-area-interactive", title: "Area Chart", description: "Interactive area chart with compact dashboard framing.", kind: "chart" },
    { id: "chart-bar-interactive", title: "Bar Chart", description: "Interactive bar chart with grouped metrics and hover states.", kind: "chart" },
    { id: "chart-line-interactive", title: "Line Chart", description: "Interactive line chart for compact trend inspection.", kind: "chart" },
  ],
}

const createKindLabels: Record<CreateCatalogKind, string> = {
  component: "Components",
  example: "Examples",
  block: "Blocks",
  chart: "Charts",
}

const createDefaultItemIds: Record<CreateCatalogKind, string> = {
  component: "button",
  example: "dashboard",
  block: "dashboard-01",
  chart: "chart-area-interactive",
}

void initResumableClient()

function wireColorModeManager(): void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  const syncMode = () => {
    applyDocumentColorMode(resolvePreferredColorMode())
  }

  syncMode()
  mediaQuery.addEventListener("change", () => {
    if (resolveStoredColorMode()) {
      return
    }

    syncMode()
  })

  document.addEventListener("keydown", (event) => {
    const isToggleShortcut = (event.key === "d" || event.key === "D") && !event.metaKey && !event.ctrlKey && !event.altKey
    if (!isToggleShortcut || isEditableTarget(event.target)) {
      return
    }

    event.preventDefault()
    toggleDocumentColorMode()
  })
}

function wireSiteChrome(): void {
  document.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    if (target.closest(".header-search-button")) {
      event.preventDefault()
      openSearchOverlay()
      return
    }

    if (target.closest(".mobile-nav-trigger")) {
      event.preventDefault()
      openMobileMenuOverlay()
      return
    }

    if (target.closest(".header-layout-toggle")) {
      event.preventDefault()
      toggleDocumentLayout()
      syncLayoutToggleButtons()
      return
    }

    if (target.closest(".site-search-close")) {
      event.preventDefault()
      closeSearchOverlay()
      return
    }

    if (target.closest(".mobile-nav-close")) {
      event.preventDefault()
      closeMobileMenuOverlay()
      return
    }

    const searchOverlay = target.closest(".site-search-overlay")
    if (searchOverlay instanceof HTMLElement && target === searchOverlay) {
      closeSearchOverlay()
      return
    }

    const mobileOverlay = target.closest(".mobile-nav-overlay")
    if (mobileOverlay instanceof HTMLElement && target === mobileOverlay) {
      closeMobileMenuOverlay()
      return
    }

    if (target.closest(".site-search-result")) {
      closeSearchOverlay()
      return
    }

    const themePill = target.closest(".theme-customizer-pill")
    if (themePill instanceof HTMLButtonElement) {
      event.preventDefault()
      const themeName = themePill.dataset.themeName
      if (themeName) {
        applyActiveTheme(themeName, true)
      }
    }
  })

  document.addEventListener("keydown", (event) => {
    const isSearchShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
    if (isSearchShortcut) {
      event.preventDefault()
      openSearchOverlay()
      return
    }

    if (event.key !== "Escape") {
      return
    }

    if (document.querySelector(".site-search-overlay")) {
      closeSearchOverlay()
      return
    }

    if (document.querySelector(".mobile-nav-overlay")) {
      closeMobileMenuOverlay()
    }
  })
}

function wireThemeExperience(): void {
  const themeName = resolveInitialThemeName()
  applyActiveTheme(themeName, false)

  document.addEventListener("change", (event) => {
    const target = event.target
    if (!(target instanceof HTMLSelectElement)) {
      return
    }

    if (target.id !== "theme-selector" && target.id !== "themes-route-selector") {
      return
    }

    applyActiveTheme(target.value, true)
  })
}

function wireCreateRoute(): void {
  const routeShell = document.querySelector(".create-route-shell")
  if (!(routeShell instanceof HTMLElement)) {
    return
  }

  const filterInput = document.getElementById("create-item-filter")
  const list = routeShell.querySelector(".create-explorer-list")
  const groupTitle = routeShell.querySelector(".create-explorer-group-head h2")
  const groupCount = routeShell.querySelector(".create-explorer-group-head span")
  const previewTitle = routeShell.querySelector(".create-preview-header h2")
  const previewDescription = routeShell.querySelector(".create-preview-copy")
  const commandCode = routeShell.querySelector(".create-command-code code")
  const previewStageShell = routeShell.querySelector(".create-preview-stage-shell")
  const badgeSpans = routeShell.querySelectorAll(".create-preview-badges span")
  if (!(filterInput instanceof HTMLInputElement) || !(list instanceof HTMLElement) || !(groupTitle instanceof HTMLElement) ||
    !(groupCount instanceof HTMLElement) || !(previewTitle instanceof HTMLElement) || !(previewDescription instanceof HTMLElement) ||
    !(commandCode instanceof HTMLElement) || !(previewStageShell instanceof HTMLElement) || badgeSpans.length < 4) {
    return
  }

  const initialStageMarkup = previewStageShell.innerHTML
  const state = {
    kind: "component" as CreateCatalogKind,
    itemId: "button",
    base: "radix",
    theme: "neutral",
    font: "inter",
    template: "next",
  }

  const getActiveItems = (): CreateCatalogItem[] => createCatalogItems[state.kind]
  const getActiveItem = (): CreateCatalogItem => getActiveItems().find((item) => item.id === state.itemId) || getActiveItems()[0]

  const renderList = () => {
    const normalizedQuery = filterInput.value.trim().toLowerCase()
    const activeItems = getActiveItems()
    const visibleItems = activeItems.filter((item) => {
      if (!normalizedQuery) {
        return true
      }

      return `${item.title} ${item.id} ${item.description}`.toLowerCase().includes(normalizedQuery)
    })

    groupTitle.textContent = createKindLabels[state.kind]
    groupCount.textContent = String(activeItems.length)
    list.innerHTML = visibleItems.length
      ? visibleItems.map((item) => {
        const isActive = item.id === state.itemId
        return `<button type="button" class="${isActive ? "create-item-button is-active" : "create-item-button"}" data-item-id="${item.id}"><span class="create-item-title">${escapeHtml(item.title)}</span><span class="create-item-description">${escapeHtml(item.description)}</span></button>`
      }).join("")
      : '<p class="create-empty-state">No matching items.</p>'
  }

  const renderPreview = async () => {
    const activeItem = getActiveItem()
    previewTitle.textContent = activeItem.title
    previewDescription.textContent = activeItem.description
    badgeSpans[0].textContent = state.base
    badgeSpans[1].textContent = state.theme
    badgeSpans[2].textContent = state.font
    badgeSpans[3].textContent = state.template
    commandCode.textContent = buildCreateInstallCommand(state, activeItem)

    if (state.kind === "component" && state.itemId === "button") {
      previewStageShell.innerHTML = initialStageMarkup
      return
    }

    if (state.kind === "example") {
      previewStageShell.innerHTML = '<div class="create-preview-stage create-preview-stage-example"><div class="example-fallback"><h3>Loading preview...</h3></div></div>'
      const previewStage = previewStageShell.querySelector(".create-preview-stage")
      if (!(previewStage instanceof HTMLElement)) {
        return
      }

      try {
        const response = await fetch(`/examples/${state.itemId}`)
        if (!response.ok) {
          throw new Error(`Failed to load example ${state.itemId}`)
        }

        const html = await response.text()
        const parsed = new DOMParser().parseFromString(html, "text/html")
        const preview = parsed.querySelector(".example-live-stage > *") || parsed.querySelector(".tasks-example")
        if (preview instanceof HTMLElement) {
          previewStage.innerHTML = preview.outerHTML
          return
        }
      } catch {
      }
    }

    previewStageShell.innerHTML = `<div class="create-preview-stage"><div class="example-fallback"><h3>${escapeHtml(activeItem.title)}</h3><p>${escapeHtml(activeItem.description)}</p></div></div>`
  }

  const renderControls = () => {
    routeShell.querySelectorAll<HTMLButtonElement>(".create-kind-pills .create-kind-pill").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.kind === state.kind)
    })

    routeShell.querySelectorAll<HTMLButtonElement>(".create-option-group").forEach((group) => {
      const heading = group.querySelector("h3")?.textContent?.trim()
      const activeValue = heading === "Base"
        ? state.base
        : heading === "Theme"
          ? state.theme
          : heading === "Font"
            ? state.font
            : heading === "Template"
              ? state.template
              : ""

      group.querySelectorAll<HTMLButtonElement>(".create-option-card").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.value === activeValue)
      })
    })
  }

  const render = async () => {
    renderControls()
    renderList()
    await renderPreview()
  }

  routeShell.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const kindButton = target.closest(".create-kind-pill")
    if (kindButton instanceof HTMLButtonElement) {
      const nextKind = kindButton.dataset.kind as CreateCatalogKind | undefined
      if (!nextKind) {
        return
      }

      state.kind = nextKind
      state.itemId = createDefaultItemIds[nextKind]
      void render()
      return
    }

    const itemButton = target.closest(".create-item-button")
    if (itemButton instanceof HTMLButtonElement) {
      const nextItemId = itemButton.dataset.itemId
      if (!nextItemId) {
        return
      }

      state.itemId = nextItemId
      void render()
      return
    }

    const optionButton = target.closest(".create-option-card")
    if (optionButton instanceof HTMLButtonElement) {
      const nextValue = optionButton.dataset.value
      if (!nextValue) {
        return
      }

      const groupHeading = optionButton.closest(".create-option-group")?.querySelector("h3")?.textContent?.trim()
      if (groupHeading === "Base") {
        state.base = nextValue
      } else if (groupHeading === "Theme") {
        state.theme = nextValue
      } else if (groupHeading === "Font") {
        state.font = nextValue
      } else if (groupHeading === "Template") {
        state.template = nextValue
      }

      void render()
    }
  })

  filterInput.addEventListener("input", () => {
    renderList()
  })

  void render()
}

function resolveInitialThemeName(): string {
  const storageTheme = window.localStorage.getItem(routeThemeStorageKey)
  if (storageTheme) {
    return storageTheme
  }

  const themedElement = document.querySelector<HTMLElement>(".theme-preview-stage, .route-theme-container, .home-preview-shell")
  return themedElement?.dataset.themeName || "amber"
}

function applyActiveTheme(themeName: string, persist: boolean): void {
  document.body.dataset.activeTheme = themeName
  if (persist) {
    window.localStorage.setItem(routeThemeStorageKey, themeName)
  }

  document.querySelectorAll<HTMLElement>(".home-preview-shell, .route-theme-container, .theme-preview-stage").forEach((element) => {
    element.dataset.themeName = themeName
  })

  document.querySelectorAll<HTMLSelectElement>("#theme-selector, #themes-route-selector").forEach((select) => {
    select.value = themeName
    select.dataset.activeTheme = themeName
    Array.from(select.options).forEach((option) => {
      option.selected = option.value === themeName
    })
  })

  document.querySelectorAll<HTMLElement>(".theme-selector-copy, .theme-copy-button").forEach((button) => {
    button.dataset.themeName = themeName
  })

  document.querySelectorAll<HTMLElement>(".theme-customizer-pill").forEach((button) => {
    button.dataset.active = button.dataset.themeName === themeName ? "true" : "false"
  })
}

function openSearchOverlay(): void {
  closeMobileMenuOverlay()
  closeSearchOverlay()

  const overlay = document.createElement("div")
  overlay.className = "site-search-overlay"
  overlay.innerHTML = `
    <div class="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
      <div class="site-search-header">
        <div>
          <p class="eyebrow">Search</p>
          <h2 id="site-search-title">Search documentation...</h2>
        </div>
        <button type="button" class="header-icon-link site-search-close" aria-label="Close search">Close</button>
      </div>
      <label class="sr-only" for="site-search-input">Search documentation</label>
      <input id="site-search-input" class="site-search-input" type="text" placeholder="Search documentation..." />
      <div class="site-search-status">
        <p>Jump to docs, examples, charts, and top-level pages.</p>
        <span class="site-search-shortcut" aria-hidden="true">⌘K</span>
      </div>
      <div class="site-search-results" role="list"></div>
      <div class="site-search-empty" hidden>No results found.</div>
    </div>
  `

  document.body.append(overlay)
  document.body.style.overflow = "hidden"
  document.querySelector(".site-shell")?.setAttribute("inert", "")
  document.querySelector(".site-shell")?.setAttribute("aria-hidden", "true")
  document.querySelector(".create-route-shell")?.setAttribute("inert", "")
  document.querySelector(".create-route-shell")?.setAttribute("aria-hidden", "true")

  const input = overlay.querySelector<HTMLInputElement>("#site-search-input")
  const results = overlay.querySelector<HTMLElement>(".site-search-results")
  const empty = overlay.querySelector<HTMLElement>(".site-search-empty")
  if (!(input instanceof HTMLInputElement) || !(results instanceof HTMLElement) || !(empty instanceof HTMLElement)) {
    return
  }

  const renderResults = () => {
    const normalizedQuery = input.value.trim().toLowerCase()
    const visibleEntries = siteSearchEntries.filter((entry) => {
      if (!normalizedQuery) {
        return true
      }

      return `${entry.title} ${entry.kind} ${entry.description} ${entry.href}`.toLowerCase().includes(normalizedQuery)
    })

    results.innerHTML = visibleEntries.map((entry) => `
      <a class="site-search-result" href="${entry.href}" aria-label="${escapeHtml(entry.title)}" data-search-text="${escapeHtml(`${entry.title} ${entry.kind} ${entry.description} ${entry.href}`.toLowerCase())}">
        <div class="site-search-result-copy">
          <div class="site-search-result-topline">
            <span class="site-search-kind">${escapeHtml(entry.kind)}</span>
            <span class="site-search-path">${escapeHtml(entry.href)}</span>
          </div>
          <strong>${escapeHtml(entry.title)}</strong>
          <p>${escapeHtml(entry.description)}</p>
        </div>
      </a>
    `).join("")
    empty.hidden = visibleEntries.length > 0
  }

  input.addEventListener("input", renderResults)
  renderResults()
  input.focus()
  input.select()
}

function closeSearchOverlay(): void {
  document.querySelector(".site-search-overlay")?.remove()
  document.querySelector(".site-shell")?.removeAttribute("inert")
  document.querySelector(".site-shell")?.removeAttribute("aria-hidden")
  document.querySelector(".create-route-shell")?.removeAttribute("inert")
  document.querySelector(".create-route-shell")?.removeAttribute("aria-hidden")
  if (!document.querySelector(".mobile-nav-overlay")) {
    document.body.style.overflow = ""
  }
}

function openMobileMenuOverlay(): void {
  closeSearchOverlay()
  closeMobileMenuOverlay()

  const overlay = document.createElement("div")
  overlay.className = "mobile-nav-overlay"
  overlay.innerHTML = `
    <div class="mobile-nav-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-nav-title">
      <div class="mobile-nav-section">
        <div class="site-search-header">
          <p id="mobile-nav-title" class="eyebrow">Menu</p>
          <button type="button" class="header-icon-link mobile-nav-close" aria-label="Close menu">Close</button>
        </div>
        <div class="mobile-nav-links">
          ${mobileMenuLinks.map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`).join("")}
        </div>
      </div>
    </div>
  `

  document.body.append(overlay)
  document.body.style.overflow = "hidden"
}

function closeMobileMenuOverlay(): void {
  document.querySelector(".mobile-nav-overlay")?.remove()
  if (!document.querySelector(".site-search-overlay")) {
    document.body.style.overflow = ""
  }
}

function buildCreateInstallCommand(
  state: { kind: CreateCatalogKind; itemId: string; base: string; theme: string; font: string; template: string },
  activeItem: CreateCatalogItem,
): string {
  const target = activeItem.kind === "example" ? `registry/new-york-v4/examples/${activeItem.id}` : activeItem.id
  return `pnpm dlx @fictjs/shadcn@latest init --template ${state.template} --base ${state.base}\npnpm dlx @fictjs/shadcn@latest theme apply ${state.theme}\npnpm dlx @fictjs/shadcn@latest add ${target} --font ${state.font}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
}

function resolveStoredColorMode(): "light" | "dark" | null {
  const storedMode = window.localStorage.getItem(colorModeStorageKey)
  return storedMode === "light" || storedMode === "dark" ? storedMode : null
}

function resolveStoredLayout(): "fixed" | "full" | null {
  if (!window.localStorage) {
    return null
  }

  const storedLayout = window.localStorage.getItem(layoutStorageKey)
  return storedLayout === "fixed" || storedLayout === "full" ? storedLayout : null
}

function resolvePreferredColorMode(): "light" | "dark" {
  const storedMode = resolveStoredColorMode()
  if (storedMode) {
    return storedMode
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyDocumentColorMode(mode: "light" | "dark"): void {
  document.documentElement.classList.toggle("dark", mode === "dark")
  document.documentElement.dataset.colorMode = mode
  document.documentElement.style.colorScheme = mode
}

function applyDocumentLayout(layout: "fixed" | "full"): void {
  document.documentElement.classList.toggle("layout-fixed", layout === "fixed")
  document.documentElement.classList.toggle("layout-full", layout === "full")
  document.documentElement.dataset.layout = layout
}

function toggleDocumentColorMode(): void {
  const nextMode = document.documentElement.classList.contains("dark") ? "light" : "dark"
  applyDocumentColorMode(nextMode)
  window.localStorage.setItem(colorModeStorageKey, nextMode)
}

function wireLayoutManager(): void {
  applyDocumentLayout(resolveStoredLayout() || "full")
  syncLayoutToggleButtons()
}

function syncLayoutToggleButtons(): void {
  const layout = document.documentElement.classList.contains("layout-fixed") ? "fixed" : "full"
  document.querySelectorAll<HTMLElement>(".header-layout-toggle").forEach((button) => {
    button.dataset.layoutMode = layout
  })
}

function toggleDocumentLayout(): void {
  const nextLayout = document.documentElement.classList.contains("layout-fixed") ? "full" : "fixed"
  applyDocumentLayout(nextLayout)
  window.localStorage.setItem(layoutStorageKey, nextLayout)
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    (target instanceof HTMLElement && target.isContentEditable) ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}
