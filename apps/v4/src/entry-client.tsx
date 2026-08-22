import { installResumableLoader } from "@fictjs/runtime/experimental/loader"

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
  wireShowcaseSliders()

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

function wireShowcaseSliders(): void {
  const readNumber = (value: string | null | undefined, fallback: number): number => {
    const parsed = Number.parseFloat(value ?? "")
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const syncSlider = (slider: HTMLElement): void => {
    const min = readNumber(slider.dataset.sliderMin, 0)
    const max = readNumber(slider.dataset.sliderMax, 100)
    const span = max - min || 1
    const thumbs = Array.from(slider.querySelectorAll<HTMLElement>("[data-slider-thumb]"))
    const values = thumbs.map((thumb) => readNumber(thumb.dataset.sliderValue, min))
    const scopeName = slider.dataset.slider
    const scope = scopeName
      ? document.querySelector<HTMLElement>(`[data-slider-scope="${scopeName}"]`)
      : slider.parentElement

    thumbs.forEach((thumb, index) => {
      const percent = ((values[index] - min) / span) * 100
      thumb.style.left = `${percent}%`
      thumb.setAttribute("aria-valuenow", String(values[index]))
    })

    const range = slider.querySelector<HTMLElement>("[data-slider-range]")
    if (range) {
      const lowest = Math.min(...values)
      const highest = Math.max(...values)
      range.style.left = `${((lowest - min) / span) * 100}%`
      range.style.right = `${100 - ((highest - min) / span) * 100}%`
    }

    if (scope) {
      scope.querySelectorAll<HTMLElement>("[data-slider-output]").forEach((output) => {
        const index = Number.parseInt(output.dataset.sliderOutput ?? "", 10)
        if (Number.isFinite(index) && values[index] !== undefined) {
          output.textContent = String(values[index])
        }
      })
    }
  }

  const setThumbValue = (slider: HTMLElement, thumb: HTMLElement, rawValue: number): void => {
    const min = readNumber(slider.dataset.sliderMin, 0)
    const max = readNumber(slider.dataset.sliderMax, 100)
    const step = readNumber(slider.dataset.sliderStep, 1) || 1
    const thumbs = Array.from(slider.querySelectorAll<HTMLElement>("[data-slider-thumb]"))
    const index = thumbs.indexOf(thumb)
    const stepped = Math.round((rawValue - min) / step) * step + min
    let lowerBound = min
    let upperBound = max

    if (index > 0) {
      lowerBound = readNumber(thumbs[index - 1].dataset.sliderValue, min)
    }
    if (index < thumbs.length - 1) {
      upperBound = readNumber(thumbs[index + 1].dataset.sliderValue, max)
    }

    thumb.dataset.sliderValue = String(Math.min(upperBound, Math.max(lowerBound, stepped)))
    syncSlider(slider)
  }

  const valueFromPointer = (slider: HTMLElement, clientX: number): number => {
    const min = readNumber(slider.dataset.sliderMin, 0)
    const max = readNumber(slider.dataset.sliderMax, 100)
    const rect = slider.getBoundingClientRect()
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0
    return min + Math.min(1, Math.max(0, ratio)) * (max - min)
  }

  document.addEventListener("pointerdown", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const slider = target.closest<HTMLElement>("[data-slider]")
    if (!slider) {
      return
    }

    const thumbs = Array.from(slider.querySelectorAll<HTMLElement>("[data-slider-thumb]"))
    if (thumbs.length === 0) {
      return
    }

    const pointerValue = valueFromPointer(slider, event.clientX)
    const directThumb = target.closest<HTMLElement>("[data-slider-thumb]")
    const activeThumb =
      directThumb ??
      thumbs.reduce((closest, thumb) => {
        const current = Math.abs(Number.parseFloat(thumb.dataset.sliderValue ?? "0") - pointerValue)
        const best = Math.abs(Number.parseFloat(closest.dataset.sliderValue ?? "0") - pointerValue)
        return current < best ? thumb : closest
      }, thumbs[0])

    event.preventDefault()
    activeThumb.focus()
    setThumbValue(slider, activeThumb, pointerValue)

    const onMove = (moveEvent: PointerEvent): void => {
      setThumbValue(slider, activeThumb, valueFromPointer(slider, moveEvent.clientX))
    }

    const onUp = (): void => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
      document.removeEventListener("pointercancel", onUp)
    }

    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    document.addEventListener("pointercancel", onUp)
  })

  document.addEventListener("keydown", (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    const thumb = target.closest<HTMLElement>("[data-slider-thumb]")
    const slider = thumb?.closest<HTMLElement>("[data-slider]")
    if (!thumb || !slider) {
      return
    }

    const step = readNumber(slider.dataset.sliderStep, 1) || 1
    const current = readNumber(thumb.dataset.sliderValue, 0)
    const deltas: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: step * 10,
      PageDown: step * -10,
    }

    if (event.key === "Home") {
      event.preventDefault()
      setThumbValue(slider, thumb, readNumber(slider.dataset.sliderMin, 0))
      return
    }

    if (event.key === "End") {
      event.preventDefault()
      setThumbValue(slider, thumb, readNumber(slider.dataset.sliderMax, 100))
      return
    }

    const delta = deltas[event.key]
    if (delta === undefined) {
      return
    }

    event.preventDefault()
    setThumbValue(slider, thumb, current + delta)
  })

  document.querySelectorAll<HTMLElement>("[data-slider]").forEach(syncSlider)
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
const siteSearchResultCache = new WeakMap<HTMLElement, HTMLElement[]>()

type CreateCatalogKind = "component" | "example" | "block" | "chart"

interface CreateCatalogItem {
  id: string
  title: string
  description: string
  kind: CreateCatalogKind
}

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

    if (target.closest(".header-layout-toggle")) {
      event.preventDefault()
      toggleDocumentLayout()
      syncLayoutToggleButtons()
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

  document.addEventListener("input", (event) => {
    const input = event.target
    if (!(input instanceof HTMLInputElement) || input.id !== "site-search-input") {
      return
    }

    const dialog = input.closest(".site-search-dialog")
    if (!(dialog instanceof HTMLElement)) {
      return
    }

    const resultsRoot = dialog.querySelector(".site-search-results")
    if (!(resultsRoot instanceof HTMLElement)) {
      return
    }

    let allResults = siteSearchResultCache.get(dialog)
    if (!allResults) {
      allResults = Array.from(resultsRoot.querySelectorAll<HTMLElement>(".site-search-result"))
      siteSearchResultCache.set(dialog, allResults)
    }

    const normalizedQuery = input.value.trim().toLowerCase()
    const exactMatches = normalizedQuery.length === 0
      ? []
      : allResults.filter((result) => result.dataset.searchTitle === normalizedQuery)
    const visibleResults = (normalizedQuery.length === 0
      ? allResults
      : exactMatches.length > 0
        ? exactMatches
        : allResults.filter((result) => (result.dataset.searchText || "").includes(normalizedQuery))
    ).slice(0, normalizedQuery.length === 0 ? 10 : 12)
    visibleResults.forEach((result) => {
      result.hidden = false
    })
    resultsRoot.replaceChildren(...visibleResults)

    const emptyState = dialog.querySelector(".site-search-empty")
    if (emptyState instanceof HTMLElement) {
      emptyState.hidden = visibleResults.length > 0
    }
  })

  document.addEventListener("keydown", (event) => {
    const isSearchShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
    if (isSearchShortcut) {
      event.preventDefault()
      document.querySelector<HTMLButtonElement>(".header-search-button")?.click()
      return
    }

    if (event.key !== "Escape") {
      return
    }

    const searchClose = document.querySelector<HTMLButtonElement>(".site-search-close")
    if (searchClose) {
      searchClose.click()
      return
    }

    document.querySelector<HTMLElement>(".mobile-nav-overlay")?.click()
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
