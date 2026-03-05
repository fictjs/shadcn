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

  wireClientFilters()
}

void initResumableClient()

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
