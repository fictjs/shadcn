import { $effect, $state, untrack } from "fict"

import { baseColors, baseColorsOKLCH } from "../registry/_legacy-base-colors"
import { colors as tailwindColors } from "../registry/_legacy-colors"
import type {
  BlockEntry,
  DocContentBlock,
  DocInlineNode,
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

type ThemeCodeFormat = "v4-oklch" | "v4-hsl" | "v3"

interface ThemeCodePalette {
  light: Record<string, string>
  dark: Record<string, string>
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
const defaultThemeSwatches = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1"]
const themeSwatchLookup = buildThemeSwatchLookup()
const routeThemeStyleLookup = buildRouteThemeStyleLookup()
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

type CreateCatalogKind = "component" | "example" | "block" | "chart"

interface CreateCatalogItem {
  key: string
  id: string
  title: string
  description: string
  kind: CreateCatalogKind
}

interface CreateOption {
  name: string
  title: string
  description: string
}

const createBaseOptions: CreateOption[] = [
  {
    name: "radix",
    title: "Radix UI",
    description: "Optimized for fast development, easy maintenance, and accessibility.",
  },
  {
    name: "base",
    title: "Base UI",
    description: "Components for building accessible web apps and design systems.",
  },
]

const createStyleOptions: CreateOption[] = [
  { name: "vega", title: "Vega", description: "Classic shadcn/ui spacing and balance." },
  { name: "nova", title: "Nova", description: "Compact spacing for denser workspaces." },
  { name: "maia", title: "Maia", description: "Soft corners and generous breathing room." },
  { name: "lyra", title: "Lyra", description: "Sharper framing paired with mono-forward rhythm." },
  { name: "mira", title: "Mira", description: "Purpose-built for compact control-heavy screens." },
]

const createBaseColorOptions: CreateOption[] = [
  { name: "neutral", title: "Neutral", description: "Balanced grays that match the default registry." },
  { name: "stone", title: "Stone", description: "Warmer neutrals with softer contrast." },
  { name: "zinc", title: "Zinc", description: "Crisp cool grays for UI-heavy layouts." },
  { name: "gray", title: "Gray", description: "Classic gray tokens for a familiar system feel." },
]

const createIconOptions: CreateOption[] = [
  { name: "lucide", title: "Lucide", description: "The default shadcn/ui icon library." },
  { name: "hugeicons", title: "Hugeicons", description: "Rounded and expressive UI iconography." },
  { name: "tabler", title: "Tabler", description: "Technical outlines with steady stroke weight." },
  { name: "phosphor", title: "Phosphor", description: "Friendly shapes with broader personality." },
]

const createFontOptions: CreateOption[] = [
  { name: "inter", title: "Inter", description: "Neutral, readable, and close to upstream defaults." },
  { name: "geist", title: "Geist", description: "Tighter modern spacing with product-grade polish." },
  { name: "figtree", title: "Figtree", description: "Soft, open letterforms for lighter interfaces." },
  { name: "jetbrains-mono", title: "JetBrains Mono", description: "Monospaced rhythm for technical surfaces." },
]

const createRadiusOptions: CreateOption[] = [
  { name: "default", title: "Default", description: "Matches the standard registry radius." },
  { name: "none", title: "None", description: "Straight edges for harder layout language." },
  { name: "small", title: "Small", description: "Tight rounding with restrained softness." },
  { name: "medium", title: "Medium", description: "Balanced radius for mixed content density." },
  { name: "large", title: "Large", description: "Softer corners for more atmospheric shells." },
]

const createTemplateOptions: CreateOption[] = [
  { name: "next", title: "Next.js", description: "SSR-friendly starter matching the upstream default." },
  { name: "vite", title: "Vite", description: "Fast client-first setup for focused Fict experiments." },
  { name: "start", title: "Starter", description: "Minimal baseline with fewer assumptions up front." },
]

const createVisibleThemes: ThemeEntry[] = [
  { name: "amber", title: "Amber" },
  { name: "blue", title: "Blue" },
  { name: "cyan", title: "Cyan" },
  { name: "emerald", title: "Emerald" },
  { name: "fuchsia", title: "Fuchsia" },
  { name: "green", title: "Green" },
  { name: "indigo", title: "Indigo" },
  { name: "lime", title: "Lime" },
  { name: "neutral", title: "Neutral" },
  { name: "orange", title: "Orange" },
  { name: "pink", title: "Pink" },
  { name: "purple", title: "Purple" },
  { name: "red", title: "Red" },
  { name: "rose", title: "Rose" },
  { name: "sky", title: "Sky" },
  { name: "teal", title: "Teal" },
  { name: "violet", title: "Violet" },
  { name: "yellow", title: "Yellow" },
]

const createKindOrder: CreateCatalogKind[] = ["component", "example", "block", "chart"]

const createKindLabels: Record<CreateCatalogKind, string> = {
  component: "Components",
  example: "Examples",
  block: "Blocks",
  chart: "Charts",
}

const createComponentItems: CreateCatalogItem[] = [
  {
    key: "component:button",
    id: "button",
    title: "Button",
    description: "Fict shadcn button component",
    kind: "component",
  },
  {
    key: "component:input",
    id: "input",
    title: "Input",
    description: "Fict shadcn input component",
    kind: "component",
  },
  {
    key: "component:dialog",
    id: "dialog",
    title: "Dialog",
    description: "Fict shadcn dialog component",
    kind: "component",
  },
]

const createExampleItems: CreateCatalogItem[] = [
  {
    key: "example:dashboard",
    id: "dashboard",
    title: "Dashboard",
    description: "Admin dashboard example using cards, charts, tables, and sidebar layouts.",
    kind: "example",
  },
  {
    key: "example:tasks",
    id: "tasks",
    title: "Tasks Example",
    description: "A task and issue tracker build using Tanstack Table.",
    kind: "example",
  },
  {
    key: "example:playground",
    id: "playground",
    title: "Playground",
    description: "The OpenAI Playground built using the components.",
    kind: "example",
  },
]

const createBlockItems: CreateCatalogItem[] = [
  {
    key: "block:dashboard-01",
    id: "dashboard-01",
    title: "Dashboard 01",
    description: "Dense dashboard block with sidebar chrome and analytics surfaces.",
    kind: "block",
  },
  {
    key: "block:sidebar-03",
    id: "sidebar-03",
    title: "Sidebar 03",
    description: "A navigational shell with projects, teams, and user rails.",
    kind: "block",
  },
  {
    key: "block:login-03",
    id: "login-03",
    title: "Login 03",
    description: "Authentication block with split-brand layout and simple form framing.",
    kind: "block",
  },
]

const createChartItems: CreateCatalogItem[] = [
  {
    key: "chart:chart-area-interactive",
    id: "chart-area-interactive",
    title: "Area Chart",
    description: "Interactive area chart with compact dashboard framing.",
    kind: "chart",
  },
  {
    key: "chart:chart-bar-interactive",
    id: "chart-bar-interactive",
    title: "Bar Chart",
    description: "Interactive bar chart with grouped metrics and hover states.",
    kind: "chart",
  },
  {
    key: "chart:chart-line-interactive",
    id: "chart-line-interactive",
    title: "Line Chart",
    description: "Interactive line chart for compact trend inspection.",
    kind: "chart",
  },
]

const createCatalogItems: CreateCatalogItem[] = [
  ...createComponentItems,
  ...createExampleItems,
  ...createBlockItems,
  ...createChartItems,
]

const createItemLookup: Record<string, CreateCatalogItem> = {
  "component:button": createComponentItems[0],
  "component:input": createComponentItems[1],
  "component:dialog": createComponentItems[2],
  "example:dashboard": createExampleItems[0],
  "example:tasks": createExampleItems[1],
  "example:playground": createExampleItems[2],
  "block:dashboard-01": createBlockItems[0],
  "block:sidebar-03": createBlockItems[1],
  "block:login-03": createBlockItems[2],
  "chart:chart-area-interactive": createChartItems[0],
  "chart:chart-bar-interactive": createChartItems[1],
  "chart:chart-line-interactive": createChartItems[2],
}

const colorModeStorageKey = "shadcn-v4-color-mode"
const colorModeEventName = "shadcn-v4-color-mode-change"
const routeThemeStorageKey = "shadcn-v4-active-theme"
const layoutStorageKey = "layout"

type SiteLayoutMode = "fixed" | "full"

function formatDisplayLabel(value: string): string {
  const normalized = value.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()
  return normalized
}

function resolveStoredColorMode(): "light" | "dark" | null {
  if (typeof window === "undefined") {
    return null
  }

  const storedMode = window.localStorage.getItem(colorModeStorageKey)
  return storedMode === "light" || storedMode === "dark" ? storedMode : null
}

function resolvePreferredColorMode(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light"
  }

  const storedMode = resolveStoredColorMode()
  if (storedMode) {
    return storedMode
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyDocumentColorMode(mode: "light" | "dark") {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.classList.toggle("dark", mode === "dark")
  document.documentElement.dataset.colorMode = mode
  document.documentElement.style.colorScheme = mode
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    (target instanceof HTMLElement && target.isContentEditable) ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

function dispatchColorModeChange(mode: "light" | "dark") {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new CustomEvent(colorModeEventName, { detail: mode }))
}

function setDocumentColorMode(mode: "light" | "dark", persist: boolean) {
  applyDocumentColorMode(mode)
  if (typeof window !== "undefined" && persist) {
    window.localStorage.setItem(colorModeStorageKey, mode)
  }

  dispatchColorModeChange(mode)
}

function toggleDocumentColorMode(): "light" | "dark" {
  if (typeof document === "undefined") {
    return "light"
  }

  const nextMode = document.documentElement.classList.contains("dark") ? "light" : "dark"
  setDocumentColorMode(nextMode, true)
  return nextMode
}

function getVisibleThemes(themes: ThemeEntry[]): ThemeEntry[] {
  return themes.filter((theme) => !hiddenThemeNames.has(theme.name))
}

function resolveStoredRouteTheme(themes: ThemeEntry[]): string | null {
  if (typeof window === "undefined") {
    return null
  }

  const storedTheme = window.localStorage[routeThemeStorageKey]
  if (!storedTheme) {
    return null
  }

  return getVisibleThemes(themes).some((theme) => theme.name === storedTheme) ? storedTheme : null
}

function buildRouteThemeStyleValue(swatches: string[]): string {
  const accentStrong = swatches[0] || defaultThemeSwatches[0]
  const accent = swatches[1] || accentStrong
  const accentSoft = swatches[2] || accent
  const accentMuted = swatches[3] || accentSoft
  const muted = swatches[4] || defaultThemeSwatches[4]

  return [
    `--route-theme-accent-strong:${accentStrong}`,
    `--route-theme-accent:${accent}`,
    `--route-theme-accent-soft:${accentSoft}`,
    `--route-theme-accent-muted:${accentMuted}`,
    `--route-theme-muted:${muted}`,
    `--theme-accent-strong:${accentStrong}`,
    `--theme-accent:${accent}`,
    `--theme-accent-soft:${accentSoft}`,
    `--theme-accent-muted:${accentMuted}`,
    `--theme-muted:${muted}`,
    `--primary:${accent}`,
    `--primary-foreground:#ffffff`,
    `--ring:${accent}`,
    `--accent:${accentSoft}`,
    `--accent-foreground:${accentStrong}`,
  ].join("; ")
}

function resolveStoredLayout(): SiteLayoutMode | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null
  }

  const storedLayout = window.localStorage.getItem(layoutStorageKey)
  return storedLayout === "fixed" || storedLayout === "full" ? storedLayout : null
}

function applyDocumentLayout(layout: SiteLayoutMode) {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.classList.toggle("layout-fixed", layout === "fixed")
  document.documentElement.classList.toggle("layout-full", layout === "full")
  document.documentElement.dataset.layout = layout
}

function setDocumentLayout(layout: SiteLayoutMode, persist: boolean) {
  applyDocumentLayout(layout)
  if (typeof window !== "undefined" && persist) {
    window.localStorage.setItem(layoutStorageKey, layout)
  }
}

function toggleDocumentLayout(): SiteLayoutMode {
  if (typeof document === "undefined") {
    return "full"
  }

  const nextLayout = document.documentElement.classList.contains("layout-fixed") ? "full" : "fixed"
  setDocumentLayout(nextLayout, true)
  return nextLayout
}

function resolveInitialActiveTheme(themes: ThemeEntry[], storedTheme: string | null | undefined): string {
  const visibleThemeNames = themes
    .filter((theme) => !hiddenThemeNames.has(theme.name))
    .map((theme) => theme.name)

  if (storedTheme && visibleThemeNames.includes(storedTheme)) {
    return storedTheme
  }

  if (visibleThemeNames.includes("neutral")) {
    return "neutral"
  }

  return visibleThemeNames[0] || themes[0]?.name || "neutral"
}

function DarkModeManager() {
  return null
}

function ModeToggleControl() {
  return (
    <button
      type="button"
      class="header-icon-link header-mode-toggle"
      aria-label="Toggle theme"
      data-tooltip="Toggle Mode"
      onClick$={() => {
        toggleDocumentColorMode()
      }}
    >
      <svg
        class="header-mode-toggle-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 3l0 18" />
        <path d="M12 9l4.65 -4.65" />
        <path d="M12 14.3l7.37 -7.37" />
        <path d="M12 19.6l8.85 -8.85" />
      </svg>
    </button>
  )
}

function SiteLogoIcon() {
  return (
    <svg class="site-logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" aria-hidden="true">
      <rect width="256" height="256" fill="none" />
      <line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />
      <line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg class="header-github-icon" viewBox="0 0 438.549 438.549" aria-hidden="true">
      <path
        fill="currentColor"
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
      />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12l14 0" />
      <path d="M5 12l6 6" />
      <path d="M5 12l6 -6" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12l14 0" />
      <path d="M13 18l6 -6" />
      <path d="M13 6l6 6" />
    </svg>
  )
}

function CopyIcon(props: { class?: string }) {
  return (
    <svg class={props.class ? `button-icon ${props.class}` : "button-icon"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
      <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
    </svg>
  )
}

function setBlockViewport(event: MouseEvent, width: string) {
  const target = event.currentTarget
  if (!(target instanceof HTMLButtonElement)) {
    return
  }

  const group = target.parentElement
  const card = target.closest(".block-display-card")
  if (!group || !card) {
    return
  }

  for (const button of Array.from(group.children)) {
    button.classList.toggle("is-active", button === target)
  }

  const stage = card.querySelector(".block-preview-stage")
  if (stage instanceof HTMLElement) {
    stage.style.width = `${width}%`
  }
}

function MonitorIcon() {
  return (
    <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  )
}

function TabletIcon() {
  return (
    <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
    </svg>
  )
}

function SmartphoneIcon() {
  return (
    <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="14" height="20" x="5" y="2" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}

function ChartFamilyIcon(props: { chartId: string }) {
  const id = props.chartId

  return id.includes("chart-bar") ? (
    <svg class="chart-display-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 11h2v6H7z" />
      <path d="M13 7h2v10h-2z" />
      <path d="M19 13h2v4h-2z" />
    </svg>
  ) : id.includes("chart-pie") ? (
    <svg class="chart-display-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ) : id.includes("chart-radar") ? (
    <svg class="chart-display-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 16.5V7.5L12 2.5L3 7.5v9l9 5z" />
    </svg>
  ) : id.includes("chart-radial") ? (
    <svg class="chart-display-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ) : id.includes("chart-tooltip") ? (
    <svg class="chart-display-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
    </svg>
  ) : id.includes("chart-line") ? (
    <svg class="chart-display-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ) : (
    <svg class="chart-display-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 15.5 11 11l3 3 4.5-6" />
    </svg>
  )
}

function TerminalIcon(props: { class?: string }) {
  return (
    <svg class={props.class ? `button-icon ${props.class}` : "button-icon"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      class="button-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4V20M20 12H4" />
    </svg>
  )
}

function ColorModeImage(props: { lightSrc: string; darkSrc: string; alt: string; className?: string; loading?: "lazy" | "eager" }) {
  const lightClassName = props.className
    ? `${props.className} color-mode-image color-mode-image-light`
    : "color-mode-image color-mode-image-light"
  const darkClassName = props.className
    ? `${props.className} color-mode-image color-mode-image-dark`
    : "color-mode-image color-mode-image-dark"

  return (
    <>
      <img src={props.lightSrc} alt={props.alt} loading={props.loading || "lazy"} class={lightClassName} />
      <img src={props.darkSrc} alt={props.alt} loading={props.loading || "lazy"} class={darkClassName} />
    </>
  )
}

interface SiteSearchEntry {
  href: string
  title: string
  kind: string
  description: string
  keywords: string
}

interface SiteNavLink {
  href: string
  label: string
}

function isPrimaryNavActive(pathname: string, href: string): boolean {
  if (href === "/docs/installation") {
    return pathname === "/docs" || pathname.startsWith("/docs/")
  }

  if (href === "/docs/components") {
    return pathname === "/components" || pathname === "/docs/components" || pathname.startsWith("/docs/components/")
  }

  if (href === "/blocks") {
    return pathname === "/blocks" || pathname.startsWith("/blocks/")
  }

  if (href === "/charts/area") {
    return pathname === "/charts" || pathname.startsWith("/charts/")
  }

  if (href === "/docs/directory") {
    return pathname === "/docs/directory" || pathname.startsWith("/docs/directory/")
  }

  return pathname === href
}

const mobileDocLinks: SiteNavLink[] = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/components", label: "Components" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/directory", label: "Directory" },
  { href: "/docs/rtl", label: "RTL" },
  { href: "/docs/mcp", label: "MCP Server" },
  { href: "/docs/registry", label: "Registry" },
  { href: "/docs/forms", label: "Forms" },
  { href: "/docs/changelog", label: "Changelog" },
]

function buildSiteSearchEntries(route: ResolvedRoute): SiteSearchEntry[] {
  const entries: SiteSearchEntry[] = []
  const seen = new Set<string>()

  const pushEntry = (entry: SiteSearchEntry) => {
    const key = `${entry.href}::${entry.title}`
    if (seen.has(key)) {
      return
    }

    seen.add(key)
    entries.push(entry)
  }

  pushEntry({
    href: "/",
    title: "Home",
    kind: "Page",
    description: "Landing page with the design-system overview and featured examples.",
    keywords: "home root landing page overview",
  })
  pushEntry({
    href: "/docs",
    title: "Docs",
    kind: "Page",
    description: "Browse the full documentation tree.",
    keywords: "docs documentation getting started installation",
  })
  pushEntry({
    href: "/docs/components",
    title: "Components",
    kind: "Page",
    description: "Browse component documentation.",
    keywords: "components ui docs registry",
  })
  pushEntry({
    href: "/examples",
    title: "Examples",
    kind: "Page",
    description: "Explore live examples and application shells.",
    keywords: "examples live dashboard tasks playground authentication rtl",
  })
  pushEntry({
    href: "/charts/area",
    title: "Charts",
    kind: "Page",
    description: "Preview chart blocks and graph styles.",
    keywords: "charts area bar line pie radar radial tooltip",
  })
  pushEntry({
    href: "/blocks",
    title: "Blocks",
    kind: "Page",
    description: "Browse higher-level UI blocks.",
    keywords: "blocks layouts auth dashboard sidebar login",
  })
  pushEntry({
    href: "/themes",
    title: "Themes",
    kind: "Page",
    description: "Customize accent colors and preview tokens.",
    keywords: "themes colors accents customizer",
  })
  pushEntry({
    href: "/colors",
    title: "Colors",
    kind: "Page",
    description: "Inspect the Tailwind color scales.",
    keywords: "colors palette tailwind oklch hsl rgb hex",
  })
  pushEntry({
    href: "/create",
    title: "New Project",
    kind: "Page",
    description: "Generate a starter project and preview the design system.",
    keywords: "create new project starter template theme font",
  })

  for (const doc of route.docs) {
    const href = doc.slug ? `/docs/${doc.slug}` : "/docs"
    const isComponentDoc = doc.slug.startsWith("components/")
    pushEntry({
      href,
      title: doc.title,
      kind: isComponentDoc ? "Component" : "Docs",
      description: doc.description || doc.section || "Documentation page",
      keywords: `${doc.title} ${doc.slug} ${doc.section} ${doc.description}`.trim(),
    })
  }

  for (const example of route.examplePages) {
    pushEntry({
      href: `/examples/${example.slug}`,
      title: example.title,
      kind: "Example",
      description: example.description,
      keywords: `${example.slug} example live demo`,
    })
  }

  for (const example of route.examples) {
    pushEntry({
      href: `/examples/${example}`,
      title: formatDisplayLabel(example),
      kind: "Example",
      description: `Open the ${formatDisplayLabel(example)} example page.`,
      keywords: `${example} example live demo`,
    })
  }

  for (const chartType of route.chartTypes) {
    pushEntry({
      href: `/charts/${chartType}`,
      title: `${formatDisplayLabel(chartType)} charts`,
      kind: "Chart",
      description: `Browse ${formatDisplayLabel(chartType)} chart previews.`,
      keywords: `${chartType} charts graph data visualization`,
    })
  }

  return entries
}

function filterSiteSearchEntries(entries: SiteSearchEntry[], query: string): SiteSearchEntry[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return entries.slice(0, 10)
  }

  const filtered = entries.filter((entry) =>
    `${entry.title} ${entry.kind} ${entry.description} ${entry.keywords}`.toLowerCase().includes(normalizedQuery)
  )

  return filtered.slice(0, 12)
}

export function App(props: AppProps) {
  const route = props.route
  const routeSnapshot = untrack(() => props.route)
  const primaryNavLinks: SiteNavLink[] = [
    { href: "/docs/installation", label: "Docs" },
    { href: "/docs/components", label: "Components" },
    { href: "/blocks", label: "Blocks" },
    { href: "/charts/area", label: "Charts" },
    { href: "/docs/directory", label: "Directory" },
    { href: "/create", label: "Create" },
  ]
  let isMobileNavOpen = $state(false)
  let isSearchOpen = $state(false)
  let activeLayout = $state<SiteLayoutMode>(untrack(() => resolveStoredLayout() || "full"))
  let activeThemeName = $state(
    untrack(() => {
      const themes = props.route.themes
      const storage = typeof window !== "undefined" ? window.localStorage : null
      const storedTheme = storage?.getItem(routeThemeStorageKey)
      return resolveInitialActiveTheme(themes, storedTheme)
    })
  )
  const handleThemeChange = (themeName: string) => {
    activeThemeName = themeName
    if (typeof window !== "undefined") {
      window.localStorage[routeThemeStorageKey] = themeName
    }
  }
  $effect(() => {
    if (typeof document === "undefined") {
      return
    }

    if (activeLayout === "fixed") {
      document.documentElement.classList.add("layout-fixed")
      document.documentElement.classList.remove("layout-full")
      document.documentElement.dataset.layout = "fixed"
      return
    }

    document.documentElement.classList.add("layout-full")
    document.documentElement.classList.remove("layout-fixed")
    document.documentElement.dataset.layout = "full"
  })
  const searchEntries = buildSiteSearchEntries(routeSnapshot)

  return (
    <>
      <DarkModeManager />
      {route.kind === "create" ? <CreatePage /> : (
        <div class="site-shell">
        <header
          class="site-header"
          inert={isSearchOpen || isMobileNavOpen}
          aria-hidden={isSearchOpen || isMobileNavOpen ? "true" : undefined}
        >
          <div class="container header-row">
            <div class="header-primary">
              <button
                type="button"
                class="mobile-nav-trigger"
                aria-label="Toggle menu"
                aria-expanded={isMobileNavOpen}
                onClick$={() => {
                  isSearchOpen = false
                  isMobileNavOpen = !isMobileNavOpen
                }}
              >
                <span class="mobile-nav-trigger-icon" aria-hidden="true">
                  <span class={isMobileNavOpen ? "mobile-nav-line mobile-nav-line-top is-open" : "mobile-nav-line mobile-nav-line-top"}></span>
                  <span class={isMobileNavOpen ? "mobile-nav-line mobile-nav-line-bottom is-open" : "mobile-nav-line mobile-nav-line-bottom"}></span>
                </span>
                <span>Menu</span>
              </button>
              <a href="/" class="brand-link desktop-brand-link" aria-label="shadcn/ui home">
                <SiteLogoIcon />
                <span class="sr-only">shadcn/ui</span>
              </a>
              <nav class="site-nav" aria-label="Primary">
                {primaryNavLinks.map((link) => (
                  <a
                    key={link.href}
                    class={isPrimaryNavActive(route.pathname, link.href) ? "active-nav-link" : ""}
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div class="header-actions">
              <button
                type="button"
                class="header-search-button"
                aria-label="Search documentation..."
                aria-haspopup="dialog"
                aria-expanded={isSearchOpen}
                onClick$={() => {
                  isMobileNavOpen = false
                  isSearchOpen = true
                }}
              >
                <span class="header-search-copy">Search documentation...</span>
                <span class="header-search-short">Search...</span>
              </button>
              <span class="header-divider header-divider-search" aria-hidden="true"></span>
              <a class="header-icon-link header-github-link" href="https://github.com/shadcn-ui/ui" target="_blank" rel="noreferrer">
                <GitHubIcon />
                <span class="header-github-count">108k</span>
              </a>
              <span class="header-divider header-divider-wide" aria-hidden="true"></span>
              <button
                type="button"
                class="header-icon-link header-layout-toggle"
                aria-label="Toggle layout"
                title="Toggle layout"
                data-layout-mode={activeLayout}
              >
                <span class="header-layout-toggle-icon" aria-hidden="true">
                  <span></span>
                  <span></span>
                </span>
              </button>
              <span class="header-divider header-divider-layout" aria-hidden="true"></span>
              <ModeToggleControl />
              <span class="header-divider header-divider-create" aria-hidden="true"></span>
              <a class="header-create-link header-create-link-desktop" href="/create">
                <PlusIcon />
                New Project
              </a>
              <a class="header-create-link header-create-link-mobile" href="/create">
                <PlusIcon />
                New
              </a>
            </div>
          </div>
        </header>

        <main
          class="main-content"
          inert={isSearchOpen || isMobileNavOpen}
          aria-hidden={isSearchOpen || isMobileNavOpen ? "true" : undefined}
        >
          {route.kind === "home" ? <HomePage route={route} activeThemeName={activeThemeName} onThemeChange={handleThemeChange} /> : null}
          {route.kind === "docs-index" ? <DocsIndexPage docs={route.docs} /> : null}
          {route.kind === "docs-detail" && route.doc ? <DocDetailPage route={route} /> : null}
          {route.kind === "components" ? <ComponentsPage components={route.components} /> : null}
          {route.kind === "examples" ? <ExamplesPage route={route} activeThemeName={activeThemeName} onThemeChange={handleThemeChange} /> : null}
          {route.kind === "charts" ? <ChartsPage route={route} activeThemeName={activeThemeName} onThemeChange={handleThemeChange} /> : null}
          {route.kind === "blocks" ? <BlocksPage route={route} /> : null}
          {route.kind === "themes" ? <ThemesPage themes={route.themes} activeThemeName={activeThemeName} onThemeChange={handleThemeChange} /> : null}
          {route.kind === "colors" ? <ColorsPage /> : null}
          {route.kind === "not-found" ? <NotFoundPage pathname={route.pathname} /> : null}
        </main>

        {isMobileNavOpen ? (
          <div
            class="mobile-nav-overlay"
            role="presentation"
            onClick$={(event: MouseEvent) => {
              if (event.target !== event.currentTarget) {
                return
              }

              isMobileNavOpen = false
            }}
          >
            <div class="mobile-nav-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-nav-title">
              <div class="mobile-nav-section">
                <p id="mobile-nav-title" class="eyebrow">Menu</p>
                <div class="mobile-nav-links">
                  <a href="/" onClick$={() => { isMobileNavOpen = false }}>Home</a>
                  {primaryNavLinks.map((link) => (
                    <a key={`mobile-${link.href}`} href={link.href} onClick={() => { isMobileNavOpen = false }}>
                      {link.label}
                    </a>
                  ))}
                  <a href="/create" onClick$={() => { isMobileNavOpen = false }}>New Project</a>
                </div>
              </div>

              <div class="mobile-nav-section">
                <p class="eyebrow">Sections</p>
                <div class="mobile-nav-links">
                  {mobileDocLinks.map((link) => (
                    <a key={`doc-${link.href}`} href={link.href} onClick={() => { isMobileNavOpen = false }}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isSearchOpen ? (
          <div
            class="site-search-overlay"
            role="presentation"
            onClick$={(event: MouseEvent) => {
              if (event.target !== event.currentTarget) {
                return
              }

              isSearchOpen = false
            }}
          >
            <div class="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
              <div class="site-search-header">
                <div>
                  <p class="eyebrow">Search</p>
                  <h2 id="site-search-title">Search documentation...</h2>
                </div>
                <button
                  type="button"
                  class="header-icon-link site-search-close"
                  aria-label="Close search"
                  onClick$={() => {
                    isSearchOpen = false
                  }}
                >
                  Close
                </button>
              </div>

              <label class="sr-only" for="site-search-input">
                Search documentation
              </label>
              <input
                id="site-search-input"
                class="site-search-input"
                type="text"
                placeholder="Search documentation..."
              />

              <div class="site-search-status">
                <p>Jump to docs, examples, charts, and top-level pages.</p>
                <span class="site-search-shortcut" aria-hidden="true">
                  ⌘K
                </span>
              </div>

              <div class="site-search-results" role="list">
                  {searchEntries.map((entry, index) => (
                    <a
                      key={`${entry.href}:${entry.title}`}
                      class="site-search-result"
                      hidden={index >= 10}
                      data-search-title={entry.title.toLowerCase()}
                      data-search-text={`${entry.title} ${entry.kind} ${entry.description} ${entry.keywords}`.toLowerCase()}
                      href={entry.href}
                    >
                      <div class="site-search-result-copy">
                        <div class="site-search-result-topline">
                          <span class="site-search-kind">{entry.kind}</span>
                          <span class="site-search-path">{entry.href}</span>
                        </div>
                        <strong>{entry.title}</strong>
                        <p>{entry.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              <div class="site-search-empty" hidden>No results found.</div>
            </div>
          </div>
        ) : null}

        <footer
          class="site-footer"
          inert={isSearchOpen || isMobileNavOpen}
          aria-hidden={isSearchOpen || isMobileNavOpen ? "true" : undefined}
        >
          <div class="container footer-row">
            <p>
      Built by <a href="https://twitter.com/shadcn">shadcn</a> at{" "}
              <a href="https://vercel.com/new?utm_source=shadcn_site&utm_medium=web&utm_campaign=docs_cta_deploy_now_callout">
                Vercel
              </a>
              . The source code is available on{" "}
              <a href="https://github.com/shadcn-ui/ui">GitHub</a>.
            </p>
          </div>
        </footer>
        </div>
      )}
    </>
  )
}

function CreatePage() {
  let activeKind = $state<CreateCatalogKind>("component")
  let activeId = $state("button")
  let base = $state("radix")
  let theme = $state("neutral")
  let font = $state("inter")
  let starterTemplate = $state("next")
  let copiedLabel = $state("Share")
  let copiedCommandLabel = $state("Copy Command")

  const activeItems =
    activeKind === "component"
      ? createComponentItems
      : activeKind === "example"
        ? createExampleItems
      : activeKind === "block"
          ? createBlockItems
          : createChartItems
  const activeItem = createItemLookup[`${activeKind}:${activeId}`] || activeItems[0] || createComponentItems[0]
  const activeInstallId =
    activeItem.kind !== "example"
      ? activeItem.id
      : activeItem.id === "dashboard"
        ? "dashboard-01"
        : activeItem.id === "tasks"
          ? "tables/users-table"
          : "new-components-01"
  const activeInstallArgs = activeItem.kind === "component" ? `add ${activeInstallId}` : `blocks add ${activeInstallId}`

  const createInstallCommand =
    `pnpm dlx @fictjs/shadcn@latest init --template ${starterTemplate} --base ${base}` +
    `\npnpm dlx @fictjs/shadcn@latest theme apply ${theme}` +
    `\npnpm dlx @fictjs/shadcn@latest ${activeInstallArgs} --font ${font}`

  const resetCreatePage = () => {
    activeKind = "component"
    activeId = "button"
    base = "radix"
    theme = "neutral"
    font = "inter"
    starterTemplate = "next"
    copiedLabel = "Share"
    copiedCommandLabel = "Copy Command"
  }

  const copyShareUrl = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.clipboard || !activeItem) {
      return
    }

    writeClipboardText(window.location.href)
    copiedLabel = "Copied"
  }

  const copyInstallCommand = (event: MouseEvent) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return
    }

    const target = event.currentTarget
    if (!(target instanceof HTMLButtonElement)) {
      return
    }

    const card = target.closest(".create-command-card")
    const code = card?.querySelector("code")
    const command = code?.textContent?.trim()
    if (!command) {
      return
    }

    writeClipboardText(command)
    copiedCommandLabel = "Copied"
  }

  return (
    <div class="create-route-shell">
      <header class="create-header">
        <div class="create-header-bar">
          <div class="create-header-main">
            <a href="/" class="brand-link" aria-label="shadcn/ui home">
              <SiteLogoIcon />
              <span class="sr-only">shadcn/ui</span>
            </a>
            <nav class="site-nav create-nav" aria-label="Create navigation">
              <a href="/docs">Docs</a>
              <a href="/docs/components">Components</a>
              <a href="/blocks">Blocks</a>
              <a href="/charts/area">Charts</a>
              <a href="/themes">Themes</a>
              <a href="/colors">Colors</a>
            </nav>
          </div>

          <div class="create-header-actions">
            <ModeToggleControl />
            <button
              type="button"
              class="button button-ghost"
              onClick$={() => {
                activeKind = "component"
                activeId = "button"
                base = "radix"
                theme = "neutral"
                font = "inter"
                starterTemplate = "next"
                copiedLabel = "Share"
                copiedCommandLabel = "Copy Command"
              }}
            >
              Reset
            </button>
            <button
              type="button"
              class="button button-ghost"
              onClick$={() => {
                if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.clipboard) {
                  return
                }

                writeClipboardText(window.location.href)
                copiedLabel = "Copied"
              }}
            >
              {copiedLabel}
            </button>
            <a class="button" href="/docs/installation">
              Install
            </a>
          </div>
        </div>
      </header>
      <main class="create-main-shell">
        <section class="create-workspace">
          <aside class="create-explorer-panel">
            <div class="create-panel-head">
              <p class="eyebrow">New Project</p>
              <h1>Customize everything.</h1>
              <p class="lead create-lead">
                Pick your component library, base color, theme, fonts, icons, and starter item to shape your own
                version of shadcn/ui.
              </p>
            </div>

            <div class="card control-card create-search-card">
              <label for="create-item-filter">Search items</label>
              <input
                id="create-item-filter"
                type="text"
                placeholder="Search by title, id, or description"
              />
            </div>

            <div class="create-kind-pills" aria-label="Catalog filters">
              {createKindOrder.map((kind) => (
                <button
                  type="button"
                  key={kind}
                  data-kind={kind}
                  class={activeKind === kind ? "create-kind-pill is-active" : "create-kind-pill"}
                  onClick={(event: MouseEvent) => {
                    const target = event.currentTarget
                    if (!(target instanceof HTMLButtonElement)) {
                      return
                    }

                    const nextKind = target.dataset.kind as CreateCatalogKind | undefined
                    if (!nextKind) {
                      return
                    }

                    activeKind = nextKind
                    activeId =
                      nextKind === "component"
                        ? "button"
                        : nextKind === "example"
                          ? "dashboard"
                          : nextKind === "block"
                            ? "dashboard-01"
                            : "chart-area-interactive"
                    copiedCommandLabel = "Copy Command"
                  }}
                >
                  {createKindLabels[kind]}
                </button>
              ))}
            </div>

            <div class="create-explorer-groups">
              <section class="create-explorer-group">
                <div class="create-explorer-group-head">
                  <h2>{createKindLabels[activeKind]}</h2>
                  <span>{activeItems.length}</span>
                </div>
                <div class="create-explorer-list">
                  {createCatalogItems.map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      data-item-id={item.id}
                      hidden={item.kind !== activeKind}
                      class={activeItem.key === item.key ? "create-item-button is-active" : "create-item-button"}
                      onClick={(event: MouseEvent) => {
                        const target = event.currentTarget
                        if (!(target instanceof HTMLButtonElement)) {
                          return
                        }

                        const nextItemId = target.dataset.itemId
                        if (!nextItemId) {
                          return
                        }

                        activeId = nextItemId
                        copiedCommandLabel = "Copy Command"
                      }}
                    >
                      <span class="create-item-title">{item.title}</span>
                      <span class="create-item-description">{item.description}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          <section class="create-preview-panel">
            <div class="create-preview-header">
              <div>
                <p class="eyebrow">Preview</p>
                <h2>{activeItem.title}</h2>
                <p class="lead create-preview-copy">{activeItem.description}</p>
              </div>
              <div class="create-preview-badges" aria-label="Active configuration">
                <span>{base}</span>
                <span>{theme}</span>
                <span>{font}</span>
                <span>{starterTemplate}</span>
              </div>
            </div>

            <div class="create-preview-stage-shell">
              <CreatePreviewStage kind={activeKind} itemId={activeId} />
            </div>

            <div class="create-command-card">
              <div class="create-command-copy">
                <p class="eyebrow">CLI</p>
                <h3>Bootstrap this system</h3>
              </div>
              <pre class="doc-code create-command-code">
                <code>{createInstallCommand}</code>
              </pre>
              <div class="create-command-actions">
                <button
                  type="button"
                  class="button button-ghost"
                  onClick$={(event: MouseEvent) => {
                    if (typeof navigator === "undefined" || !navigator.clipboard) {
                      return
                    }

                    const target = event.currentTarget
                    if (!(target instanceof HTMLButtonElement)) {
                      return
                    }

                    const card = target.closest(".create-command-card")
                    const code = card?.querySelector("code")
                    const command = code?.textContent?.trim()
                    if (!command) {
                      return
                    }

                    writeClipboardText(command)
                    copiedCommandLabel = "Copied"
                  }}
                >
                  {copiedCommandLabel}
                </button>
                <a class="button button-ghost" href="/docs/installation">
                  View Docs
                </a>
              </div>
            </div>
          </section>

          <aside class="create-customizer-panel">
            <div class="create-panel-head create-panel-head-compact">
              <p class="eyebrow">Customizer</p>
              <h2>Design system settings</h2>
              <p class="lead create-customizer-copy">
                Tune the same surface areas the upstream create flow highlights, then copy the command when the system
                feels right.
              </p>
            </div>

            <section class="create-option-group">
              <div class="create-option-group-head">
                <h3>Base</h3>
              </div>
              <div class="create-option-grid">
                {createBaseOptions.map((option) => (
                  <button
                    type="button"
                    key={option.name}
                    data-value={option.name}
                    class={base === option.name ? "create-option-card is-active" : "create-option-card"}
                    onClick={(event: MouseEvent) => {
                      const target = event.currentTarget
                      if (!(target instanceof HTMLButtonElement)) {
                        return
                      }

                      const nextValue = target.dataset.value
                      if (!nextValue) {
                        return
                      }

                      base = nextValue
                    }}
                  >
                    <span class="create-option-title">{option.title}</span>
                    <span class="create-option-description">{option.description}</span>
                  </button>
                ))}
              </div>
            </section>

            <section class="create-option-group">
              <div class="create-option-group-head">
                <h3>Theme</h3>
              </div>
              <div class="create-option-grid">
                {createVisibleThemes.map((entry) => (
                  <button
                    type="button"
                    key={entry.name}
                    data-value={entry.name}
                    class={theme === entry.name ? "create-option-card is-active" : "create-option-card"}
                    onClick={(event: MouseEvent) => {
                      const target = event.currentTarget
                      if (!(target instanceof HTMLButtonElement)) {
                        return
                      }

                      const nextValue = target.dataset.value
                      if (!nextValue) {
                        return
                      }

                      theme = nextValue
                    }}
                  >
                    <span class="create-option-title">{entry.title === "Neutral" ? "Default" : entry.title}</span>
                    <span class="create-option-description">{entry.title} token set</span>
                  </button>
                ))}
              </div>
            </section>

            <section class="create-option-group">
              <div class="create-option-group-head">
                <h3>Font</h3>
              </div>
              <div class="create-option-grid">
                {createFontOptions.map((option) => (
                  <button
                    type="button"
                    key={option.name}
                    data-value={option.name}
                    class={font === option.name ? "create-option-card is-active" : "create-option-card"}
                    onClick={(event: MouseEvent) => {
                      const target = event.currentTarget
                      if (!(target instanceof HTMLButtonElement)) {
                        return
                      }

                      const nextValue = target.dataset.value
                      if (!nextValue) {
                        return
                      }

                      font = nextValue
                    }}
                  >
                    <span class="create-option-title">{option.title}</span>
                    <span class="create-option-description">{option.description}</span>
                  </button>
                ))}
              </div>
            </section>

            <section class="create-option-group">
              <div class="create-option-group-head">
                <h3>Template</h3>
              </div>
              <div class="create-option-grid">
                {createTemplateOptions.map((option) => (
                  <button
                    type="button"
                    key={option.name}
                    data-value={option.name}
                    class={starterTemplate === option.name ? "create-option-card is-active" : "create-option-card"}
                    onClick={(event: MouseEvent) => {
                      const target = event.currentTarget
                      if (!(target instanceof HTMLButtonElement)) {
                        return
                      }

                      const nextValue = target.dataset.value
                      if (!nextValue) {
                        return
                      }

                      starterTemplate = nextValue
                    }}
                  >
                    <span class="create-option-title">{option.title}</span>
                    <span class="create-option-description">{option.description}</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  )
}

function CreateHeader(props: { copiedLabel: string; onReset: () => void; onShare: () => void }) {
  return (
    <header class="create-header">
      <div class="create-header-bar">
        <div class="create-header-main">
          <a href="/" class="brand-link" aria-label="shadcn/ui home">
            <SiteLogoIcon />
            <span class="sr-only">shadcn/ui</span>
          </a>
          <nav class="site-nav create-nav" aria-label="Create navigation">
            <a href="/docs">Docs</a>
            <a href="/docs/components">Components</a>
            <a href="/blocks">Blocks</a>
            <a href="/charts/area">Charts</a>
            <a href="/themes">Themes</a>
            <a href="/colors">Colors</a>
          </nav>
        </div>

        <div class="create-header-actions">
          <button type="button" class="button button-ghost" onClick={() => props.onReset()}>
            Reset
          </button>
          <button type="button" class="button button-ghost" onClick={() => props.onShare()}>
            {props.copiedLabel}
          </button>
          <a class="button" href="/docs/installation">
            Install
          </a>
        </div>
      </div>
    </header>
  )
}

function CreateExplorerPanel(props: {
  activeKind: CreateCatalogKind
  activeItems: CreateCatalogItem[]
  activeItemKey: string
  onKindSelect: (kind: CreateCatalogKind) => void
  onItemSelect: (itemId: string) => void
}) {
  const activeItems = untrack(() => props.activeItems)
  const activeItemKey = untrack(() => props.activeItemKey)
  const onItemSelect = untrack(() => props.onItemSelect)

  return (
    <aside class="create-explorer-panel">
      <div class="create-panel-head">
        <p class="eyebrow">New Project</p>
        <h1>Customize everything.</h1>
        <p class="lead create-lead">
          Pick your component library, base color, theme, fonts, icons, and starter item to shape your own
          version of shadcn/ui.
        </p>
      </div>

      <div class="card control-card create-search-card">
        <label for="create-item-filter">Search items</label>
        <input id="create-item-filter" type="text" placeholder="Curated starters below. Search coming next." />
      </div>

      <div class="create-kind-pills" aria-label="Catalog filters">
        {createKindOrder.map((kind) => (
          <button
            type="button"
            key={kind}
            data-kind={kind}
            class={props.activeKind === kind ? "create-kind-pill is-active" : "create-kind-pill"}
            onClick={(event: MouseEvent) => {
              const target = event.currentTarget
              if (!(target instanceof HTMLButtonElement)) {
                return
              }

              const nextKind = target.dataset.kind as CreateCatalogKind | undefined
              if (!nextKind) {
                return
              }

              props.onKindSelect(nextKind)
            }}
          >
            {createKindLabels[kind]}
          </button>
        ))}
      </div>

      <div class="create-explorer-groups">
        <section class="create-explorer-group">
          <div class="create-explorer-group-head">
            <h2>{createKindLabels[props.activeKind]}</h2>
            <span>{props.activeItems.length}</span>
          </div>
          <div class="create-explorer-list">
            {activeItems.map((item) => (
              <button
                type="button"
                key={item.key}
                data-item-id={item.id}
                class={activeItemKey === item.key ? "create-item-button is-active" : "create-item-button"}
                onClick={(event: MouseEvent) => {
                  const target = event.currentTarget
                  if (!(target instanceof HTMLButtonElement)) {
                    return
                  }

                  const nextItemId = target.dataset.itemId
                  if (!nextItemId) {
                    return
                  }

                  onItemSelect(nextItemId)
                }}
              >
                <span class="create-item-title">{item.title}</span>
                <span class="create-item-description">{item.description}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}

function CreatePreviewPanel(props: {
  blocks: BlockEntry[]
  activeKind: CreateCatalogKind
  activeId: string
  activeItem: CreateCatalogItem
  base: string
  theme: string
  font: string
  starterTemplate: string
  createInstallCommand: string
  copiedCommandLabel: string
  onCopyCommand: (event: MouseEvent) => void
}) {
  return (
    <section class="create-preview-panel">
      <div class="create-preview-header">
        <div>
          <p class="eyebrow">Preview</p>
          <h2>{props.activeItem.title}</h2>
          <p class="lead create-preview-copy">{props.activeItem.description}</p>
        </div>
        <div class="create-preview-badges" aria-label="Active configuration">
          <span>{props.base}</span>
          <span>{props.theme}</span>
          <span>{props.font}</span>
          <span>{props.starterTemplate}</span>
        </div>
      </div>

      <div class="create-preview-stage-shell">
        <CreatePreviewStage kind={props.activeKind} itemId={props.activeId} />
      </div>

      <div class="create-command-card">
        <div class="create-command-copy">
          <p class="eyebrow">CLI</p>
          <h3>Bootstrap this system</h3>
        </div>
        <pre class="doc-code create-command-code">
          <code>{props.createInstallCommand}</code>
        </pre>
        <div class="create-command-actions">
          <button type="button" class="button button-ghost" onClick={(event: MouseEvent) => props.onCopyCommand(event)}>
            {props.copiedCommandLabel}
          </button>
          <a class="button button-ghost" href="/docs/installation">
            View Docs
          </a>
        </div>
      </div>
    </section>
  )
}

function CreateCustomizerPanel(props: {
  base: string
  theme: string
  font: string
  starterTemplate: string
  visibleThemes: ThemeEntry[]
  onBaseSelect: (value: string) => void
  onThemeSelect: (value: string) => void
  onFontSelect: (value: string) => void
  onTemplateSelect: (value: string) => void
}) {
  const visibleThemes = untrack(() => props.visibleThemes)
  const theme = untrack(() => props.theme)
  const onThemeSelect = untrack(() => props.onThemeSelect)

  return (
    <aside class="create-customizer-panel">
      <div class="create-panel-head create-panel-head-compact">
        <p class="eyebrow">Customizer</p>
        <h2>Design system settings</h2>
        <p class="lead create-customizer-copy">
          Tune the same surface areas the upstream create flow highlights, then copy the command when the system
          feels right.
        </p>
      </div>

      <section class="create-option-group">
        <div class="create-option-group-head">
          <h3>Base</h3>
        </div>
        <div class="create-option-grid">
          {createBaseOptions.map((option) => (
            <button
              type="button"
              key={option.name}
              data-value={option.name}
              class={props.base === option.name ? "create-option-card is-active" : "create-option-card"}
              onClick={(event: MouseEvent) => {
                const target = event.currentTarget
                if (!(target instanceof HTMLButtonElement)) {
                  return
                }

                const nextValue = target.dataset.value
                if (!nextValue) {
                  return
                }

                props.onBaseSelect(nextValue)
              }}
            >
              <span class="create-option-title">{option.title}</span>
              <span class="create-option-description">{option.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section class="create-option-group">
        <div class="create-option-group-head">
          <h3>Theme</h3>
        </div>
        <div class="create-option-grid">
          {visibleThemes.map((entry) => (
            <button
              type="button"
              key={entry.name}
              data-value={entry.name}
              class={theme === entry.name ? "create-option-card is-active" : "create-option-card"}
              onClick={(event: MouseEvent) => {
                const target = event.currentTarget
                if (!(target instanceof HTMLButtonElement)) {
                  return
                }

                const nextValue = target.dataset.value
                if (!nextValue) {
                  return
                }

                onThemeSelect(nextValue)
              }}
            >
              <span class="create-option-title">{entry.title === "Neutral" ? "Default" : entry.title}</span>
              <span class="create-option-description">{entry.title} token set</span>
            </button>
          ))}
        </div>
      </section>

      <section class="create-option-group">
        <div class="create-option-group-head">
          <h3>Font</h3>
        </div>
        <div class="create-option-grid">
          {createFontOptions.map((option) => (
            <button
              type="button"
              key={option.name}
              data-value={option.name}
              class={props.font === option.name ? "create-option-card is-active" : "create-option-card"}
              onClick={(event: MouseEvent) => {
                const target = event.currentTarget
                if (!(target instanceof HTMLButtonElement)) {
                  return
                }

                const nextValue = target.dataset.value
                if (!nextValue) {
                  return
                }

                props.onFontSelect(nextValue)
              }}
            >
              <span class="create-option-title">{option.title}</span>
              <span class="create-option-description">{option.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section class="create-option-group">
        <div class="create-option-group-head">
          <h3>Template</h3>
        </div>
        <div class="create-option-grid">
          {createTemplateOptions.map((option) => (
            <button
              type="button"
              key={option.name}
              data-value={option.name}
              class={props.starterTemplate === option.name ? "create-option-card is-active" : "create-option-card"}
              onClick={(event: MouseEvent) => {
                const target = event.currentTarget
                if (!(target instanceof HTMLButtonElement)) {
                  return
                }

                const nextValue = target.dataset.value
                if (!nextValue) {
                  return
                }

                props.onTemplateSelect(nextValue)
              }}
            >
              <span class="create-option-title">{option.title}</span>
              <span class="create-option-description">{option.description}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  )
}

function CreatePreviewStage(props: { kind: CreateCatalogKind; itemId: string }) {
  const block =
    props.kind === "block"
      ? {
          name: props.itemId,
          description: "",
          categories: [],
        }
      : null

  return props.kind === "component" ? (
    <div class="create-preview-stage create-preview-stage-component">
      <DocComponentPreviewSurface family={props.itemId} name={props.itemId} />
    </div>
  ) : props.kind === "example" ? (
    <div class="create-preview-stage create-preview-stage-example">
      <LiveExamplePage slug={props.itemId} />
    </div>
  ) : props.kind === "block" && block ? (
    <div class="create-preview-stage create-preview-stage-block">
      <BlockPreviewSurface block={block} />
    </div>
  ) : props.kind === "block" ? (
    <div class="example-fallback">
      <h3>Block preview unavailable</h3>
    </div>
  ) : (
    <div class="create-preview-stage create-preview-stage-chart">
      <ChartPreviewSurface chartId={props.itemId} />
    </div>
  )
}

function HomePage(props: { route: ResolvedRoute; activeThemeName: string; onThemeChange: (themeName: string) => void }) {
  const routeThemeStyle = routeThemeStyleLookup[props.activeThemeName] ?? ""

  return (
    <section class="stack-gap">
      <div class="home-hero-card route-page-header container">
        <AnnouncementBadge />
        <h1>The Foundation for your Design System</h1>
        <p class="lead">
          A set of beautifully designed components that you can customize, extend, and build on.
          Start here then make it your own. Open Source. Open Code.
        </p>
        <div class="cta-row">
          <a class="button button-sm" href="/docs/installation">
            Get Started
          </a>
          <a class="button button-ghost" href="/docs/components">
            View Components
          </a>
        </div>
      </div>

      <div class="route-nav-row container">
        <nav class="section-nav" aria-label="Home examples navigation">
          <a class="section-nav-link-active" href="/">
            Examples
          </a>
          {props.route.examplePages.map((showcase) => (
            <a key={showcase.slug} href={`/examples/${showcase.slug}`}>
              {showcase.title}
              {showcase.slug === "rtl" ? <span class="section-nav-badge" title="New" aria-label="New"></span> : null}
            </a>
          ))}
        </nav>
        <ThemeSelectorControl themes={props.route.themes} activeThemeName={props.activeThemeName} onThemeSelect={props.onThemeChange} />
      </div>

      <div class="home-preview-shell section-soft route-theme-container" data-theme-name={props.activeThemeName} style={routeThemeStyle}>
        <div class="container home-preview-container">
          <section class="home-mobile-preview">
            <figure class="example-preview-card home-mobile-preview-card">
              <ColorModeImage
                lightSrc="/r/styles/new-york-v4/dashboard-01-light.png"
                darkSrc="/r/styles/new-york-v4/dashboard-01-dark.png"
                alt="Dashboard"
              />
            </figure>
          </section>

          <section class="home-examples-root">
            <div class="home-theme-container">
              <ExamplesRootPreview />
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

function RootFieldDemoPreview() {
  return (
    <div class="ui-card root-field-demo">
      <form class="ui-field-group">
        <fieldset class="ui-field-set">
          <legend class="ui-field-legend">Payment Method</legend>
          <p class="ui-field-description">All transactions are secure and encrypted</p>
          <div class="ui-field-group">
            <div class="ui-field">
              <label class="ui-label" for="checkout-card-name">
                Name on Card
              </label>
                <input class="ui-input" id="checkout-card-name" placeholder="John Doe" required />
            </div>
            <div class="ui-field-row ui-field-row-3">
              <div class="ui-field ui-col-span-2">
                <label class="ui-label" for="checkout-card-number">
                  Card Number
                </label>
                <input class="ui-input" id="checkout-card-number" placeholder="1234 5678 9012 3456" required />
                <p class="ui-field-description">Enter your 16-digit number.</p>
              </div>
              <div class="ui-field">
                <label class="ui-label" for="checkout-cvv">
                  CVV
                </label>
                <input class="ui-input" id="checkout-cvv" placeholder="123" required />
              </div>
            </div>
            <div class="ui-field-row ui-field-row-2">
              <div class="ui-field">
                <label class="ui-label" for="checkout-exp-month">
                  Month
                </label>
                <UiSelect id="checkout-exp-month" placeholder="MM" options={["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]} />
              </div>
              <div class="ui-field">
                <label class="ui-label" for="checkout-exp-year">
                  Year
                </label>
                <UiSelect id="checkout-exp-year" placeholder="YYYY" options={["2024", "2025", "2026", "2027", "2028", "2029"]} />
              </div>
            </div>
          </div>
        </fieldset>

        <div class="ui-separator"></div>

        <fieldset class="ui-field-set">
          <legend class="ui-field-legend">Billing Address</legend>
          <p class="ui-field-description">The billing address associated with your payment method</p>
          <div class="ui-field-group">
            <div class="ui-field ui-field-horizontal">
              <UiCheckbox id="checkout-same-as-shipping" checked />
              <label class="ui-label ui-label-normal" for="checkout-same-as-shipping">
                Same as shipping address
              </label>
            </div>
          </div>
        </fieldset>

        <div class="ui-separator"></div>

        <fieldset class="ui-field-set">
          <div class="ui-field-group">
            <div class="ui-field">
              <label class="ui-label" for="checkout-comments">
                Comments
              </label>
              <textarea class="ui-textarea" id="checkout-comments" placeholder="Add any additional comments"></textarea>
            </div>
          </div>
        </fieldset>

        <div class="ui-field ui-field-horizontal">
          <button class="button button-compact" type="submit">
            Submit
          </button>
          <button class="button button-outline button-compact" type="button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

interface UiSelectOption {
  value: string
  label: string
  hint?: string
}

function UiSelectControl(props: {
  id?: string
  triggerId?: string
  ariaLabel: string
  value: string
  placeholder?: string
  groupLabel?: string
  prefix?: string
  shellClass?: string
  triggerClass?: string
  contentClass?: string
  monoValue?: boolean
  contentAlign?: "start" | "end"
  options: UiSelectOption[]
  onSelect?: (value: string) => void
}) {
  const options = untrack(() => props.options)
  const value = untrack(() => props.value)
  const placeholder = untrack(() => props.placeholder ?? "")
  const selected = options.find((option) => option.value === value)

  return (
    <span class={props.shellClass ? `ui-select-shell ${props.shellClass}` : "ui-select-shell"} data-menu data-select>
      <select
        class="ui-select-native"
        data-select-native
        id={props.id}
        aria-label={props.ariaLabel}
        aria-hidden="true"
        tabIndex={-1}
        value={props.value}
        data-active-theme={props.value}
        onChange={(event: Event) => {
          const target = event.currentTarget
          if (!(target instanceof HTMLSelectElement)) {
            return
          }

          props.onSelect?.(target.value)
        }}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        id={props.triggerId}
        type="button"
        class={props.triggerClass ? `ui-select-trigger ${props.triggerClass}` : "ui-select-trigger"}
        role="combobox"
        aria-label={props.ariaLabel}
        aria-haspopup="listbox"
        aria-expanded="false"
        data-menu-trigger
        data-select-trigger
        data-placeholder={selected ? "false" : "true"}
      >
        {props.prefix ? <span class="ui-select-prefix">{props.prefix}</span> : null}
        <span
          class={props.monoValue ? "ui-select-value ui-select-value-mono" : "ui-select-value"}
          data-select-value
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon class="ui-select-chevron" />
      </button>

      <div
        class={props.contentClass ? `ui-select-content ${props.contentClass}` : "ui-select-content"}
        data-menu-panel
        data-menu-side="bottom"
        data-menu-align={props.contentAlign || "start"}
        role="listbox"
        aria-label={props.ariaLabel}
        hidden
      >
        {props.groupLabel ? <p class="ui-select-group-label">{props.groupLabel}</p> : null}
        {options.map((option) => (
          <button
            type="button"
            class="ui-select-item"
            key={option.value}
            role="option"
            aria-selected={option.value === value ? "true" : "false"}
            data-select-option
            data-select-option-value={option.value}
          >
            <span class="ui-select-item-label">{option.label}</span>
            {option.hint ? <span class="ui-select-item-hint">{option.hint}</span> : null}
            <CheckIcon class="ui-select-item-check" />
          </button>
        ))}
      </div>
    </span>
  )
}

function UiSelect(props: { id?: string; placeholder: string; options: string[] }) {
  return (
    <UiSelectControl
      id={props.id ? `${props.id}-native` : undefined}
      triggerId={props.id}
      ariaLabel={props.placeholder}
      value=""
      placeholder={props.placeholder}
      shellClass="ui-select-shell-full"
      options={untrack(() => props.options).map((option) => ({ value: option, label: option }))}
    />
  )
}

function UiCheckbox(props: { id?: string; checked?: boolean }) {
  return (
    <button
      id={props.id}
      type="button"
      class="ui-checkbox"
      role="checkbox"
      aria-checked={props.checked ? "true" : "false"}
      data-checked={props.checked ? "true" : "false"}
      onClick$={(event: MouseEvent) => {
        const target = event.currentTarget
        if (!(target instanceof HTMLButtonElement)) {
          return
        }

        const next = target.dataset.checked !== "true"
        target.dataset.checked = next ? "true" : "false"
        target.setAttribute("aria-checked", next ? "true" : "false")
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </button>
  )
}

function RootAvatarEmptyPreview() {
  return (
    <div class="ui-empty">
      <div class="ui-empty-header">
        <div class="ui-avatar-group">
          <span class="ui-avatar">
            <img src="https://github.com/shadcn.png" alt="@shadcn" />
          </span>
          <span class="ui-avatar">
            <img src="https://github.com/maxleiter.png" alt="@maxleiter" />
          </span>
          <span class="ui-avatar">
            <img src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
          </span>
        </div>
        <p class="ui-empty-title">No Team Members</p>
        <p class="ui-empty-description">Invite your team to collaborate on this project.</p>
      </div>
      <div>
        <button class="button button-xs" type="button">
          <PlusIcon />
          Invite Members
        </button>
      </div>
    </div>
  )
}

function UiSpinner() {
  return (
    <svg class="ui-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function RootSpinnerBadgePreview() {
  return (
    <div class="root-badge-row">
      <span class="ui-badge ui-badge-default">
        <UiSpinner />
        Syncing
      </span>
      <span class="ui-badge ui-badge-secondary">
        <UiSpinner />
        Updating
      </span>
      <span class="ui-badge ui-badge-outline">
        <UiSpinner />
        Loading
      </span>
    </div>
  )
}

function RootButtonGroupInputPreview() {
  return (
    <div class="ui-button-group">
      <button class="ui-icon-button ui-icon-button-round" type="button" aria-label="Add">
        <PlusIcon />
      </button>
      <div class="ui-input-group ui-input-group-round">
        <input class="ui-input-group-input" placeholder="Send a message..." />
        <span class="ui-input-group-addon ui-input-group-addon-end">
          <button
            class="ui-input-group-button ui-input-group-button-icon"
            type="button"
            aria-label="Voice Mode"
            data-tooltip="Voice Mode"
            aria-pressed="false"
            data-toggle="voice"
            data-toggle-active="false"
          >
            <AudioLinesIcon />
          </button>
        </span>
      </div>
    </div>
  )
}

function RootFieldSliderPreview(props: { rtl?: boolean }) {
  return (
    <div class="ui-field root-field-slider" data-slider-scope="price-range">
      <p class="ui-empty-title root-field-title">Price Range</p>
      <p class="ui-field-description">
        Set your budget range ($
        <span class="root-numeric" data-slider-output="0">200</span> -{" "}
        <span class="root-numeric" data-slider-output="1">800</span>).
      </p>
      <div
        class="ui-slider"
        data-slider="price-range"
        data-slider-min="0"
        data-slider-max="1000"
        data-slider-step="10"
        data-slider-direction={props.rtl ? "rtl" : "ltr"}
        role="group"
        aria-label="Price Range"
      >
        <span class="ui-slider-track">
          <span
            class="ui-slider-range"
            data-slider-range
            style={props.rtl
              ? "inset-inline-start:calc(20% + 3.6px);width:calc(60% - 7.2px)"
              : "left:20%;right:20%"}
          ></span>
        </span>
        <span
          class="ui-slider-thumb"
          data-slider-thumb="0"
          data-slider-value="200"
          role="slider"
          tabIndex={0}
          aria-label="Minimum price"
          aria-valuemin={0}
          aria-valuemax={1000}
          aria-valuenow={200}
          style={props.rtl ? "inset-inline-start:calc(20% + 3.6px)" : "left:20%"}
        ></span>
        <span
          class="ui-slider-thumb"
          data-slider-thumb="1"
          data-slider-value="800"
          role="slider"
          tabIndex={0}
          aria-label="Maximum price"
          aria-valuemin={0}
          aria-valuemax={1000}
          aria-valuenow={800}
          style={props.rtl ? "inset-inline-start:calc(80% - 3.6px)" : "left:80%"}
        ></span>
      </div>
    </div>
  )
}

function RootInputGroupDemoPreview(props: { rtl?: boolean }) {
  return (
    <div class="root-input-group-stack">
      <div class="ui-input-group">
        <input class="ui-input-group-input root-input-flush" placeholder="Search..." />
        <span class="ui-input-group-addon">
          <SearchIcon />
        </span>
        <span class="ui-input-group-addon ui-input-group-addon-end">12 results</span>
      </div>
      <div class="ui-input-group">
        <input class="ui-input-group-input root-input-flush" placeholder="example.com" />
        {!props.rtl ? <span class="ui-input-group-addon root-addon-flush">https://</span> : null}
        <span class="ui-input-group-addon ui-input-group-addon-end">
          <button
            class="ui-input-group-button ui-input-group-button-icon"
            type="button"
            aria-label={props.rtl ? "Add" : "Info"}
            data-tooltip="This is content in a tooltip."
          >
            <InfoIcon />
          </button>
        </span>
      </div>
      <div class="ui-input-group ui-input-group-block">
        <textarea class="ui-input-group-textarea" placeholder="Ask, Search or Chat..."></textarea>
        <span class="ui-input-group-addon ui-input-group-addon-block">
          <button class="ui-input-group-button ui-input-group-button-icon ui-input-group-button-outline" type="button" aria-label="Add">
            <PlusIcon />
          </button>
          <span class="ui-menu" data-menu>
            <button
              class="ui-input-group-button ui-input-group-button-icon"
              type="button"
              data-menu-trigger
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="Auto"
            >
              {props.rtl ? <ChevronDownIcon /> : <span data-menu-label-target>Auto</span>}
            </button>
            <div class="ui-menu-panel" data-menu-panel data-menu-side="top" data-menu-align="start" role="menu" hidden>
              <button class="ui-menu-item" type="button" role="menuitem" data-menu-item data-menu-value="Auto" data-selected="true">
                Auto
              </button>
              <button class="ui-menu-item" type="button" role="menuitem" data-menu-item data-menu-value="Agent">
                Agent
              </button>
              <button class="ui-menu-item" type="button" role="menuitem" data-menu-item data-menu-value="Manual">
                Manual
              </button>
            </div>
          </span>
          <span class="root-input-group-usage">52% used</span>
          <span class="root-inline-divider" aria-hidden="true"></span>
          <button class="ui-input-group-button ui-input-group-button-icon ui-input-group-button-primary" type="button" aria-label="Send">
            <ArrowUpIcon />
          </button>
        </span>
      </div>
      <div class="ui-input-group">
        <input class="ui-input-group-input" placeholder={props.rtl ? "shadcn" : "@shadcn"} />
        <span class="ui-input-group-addon ui-input-group-addon-end">
          <span class="root-verified-dot">
            <CheckIcon />
          </span>
        </span>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v4h1" />
    </svg>
  )
}

function RtlInfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  )
}

function CheckIcon(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function AudioLinesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M2 10v3" />
      <path d="M6 6v11" />
      <path d="M10 3v18" />
      <path d="M14 8v7" />
      <path d="M18 5v13" />
      <path d="M22 10v3" />
    </svg>
  )
}

function RootInputGroupButtonPreview(props: { rtl?: boolean }) {
  return (
    <div class="root-input-group-stack">
      <div class="ui-input-group ui-input-group-round">
        <input
          id={props.rtl ? "input-secure-rtl" : "input-secure"}
          class={`ui-input-group-input ${props.rtl ? "root-input-flush-rtl" : "root-input-flush"}`}
          aria-label={props.rtl ? "Price" : "Input Secure"}
        />
        <span class="ui-input-group-addon ui-menu" data-menu>
          <button
            class="ui-input-group-button ui-input-group-button-icon ui-input-group-button-secondary"
            type="button"
            aria-label="Info"
            data-menu-trigger
            aria-haspopup="dialog"
            aria-expanded="false"
          >
            <InfoIcon />
          </button>
          <div
            class="ui-popover-panel root-secure-popover"
            data-menu-panel
            data-menu-side="bottom"
            data-menu-align={props.rtl ? "end" : "start"}
            role="dialog"
            hidden
          >
            <p class="ui-popover-title">
              {props.rtl ? "Enter the price in Saudi riyals." : "Your connection is not secure."}
            </p>
            <p class="ui-popover-text">
              {props.rtl
                ? "The price will be converted automatically."
                : "You should not enter any sensitive information on this site."}
            </p>
          </div>
        </span>
        <span class="ui-input-group-addon root-addon-flush">{props.rtl ? "SAR" : "https://"}</span>
        <span class="ui-input-group-addon ui-input-group-addon-end">
          <button
            class="ui-input-group-button ui-input-group-button-icon"
            type="button"
            aria-label="Favorite"
            aria-pressed="false"
            data-toggle="favorite"
            data-toggle-active="false"
          >
            <StarIcon />
          </button>
        </span>
      </div>
    </div>
  )
}

function RootItemDemoPreview() {
  return (
    <div class="root-item-stack">
      <div class="ui-item">
        <div class="ui-item-content">
          <p class="ui-item-title">Two-factor authentication</p>
          <p class="ui-item-description root-item-description-xl">Verify via email or phone number.</p>
        </div>
        <div class="ui-item-actions">
          <button class="button button-xs" type="button">
            Enable
          </button>
        </div>
      </div>
      <div class="ui-item">
        <span class="ui-item-media">
          <BadgeCheckIcon />
        </span>
        <div class="ui-item-content">
          <p class="ui-item-title">Your profile has been verified.</p>
        </div>
        <span class="ui-item-actions">
          <ChevronRightIcon class="root-rtl-directional-icon" />
        </span>
      </div>
    </div>
  )
}

function RootAppearanceSettingsPreview() {
  return (
    <fieldset class="ui-field-set root-appearance-settings">
      <div class="ui-field-group">
        <fieldset class="ui-field-set root-compute-fieldset">
          <legend class="ui-field-legend">Compute Environment</legend>
          <p class="ui-field-description">Select the compute environment for your cluster.</p>
          <div class="root-radio-group" data-radio-group role="radiogroup" aria-label="Compute Environment">
            <label class="ui-radio-card" data-radio-item data-checked="true">
              <span class="ui-item-content">
                <span class="root-field-title">Kubernetes</span>
                <span class="ui-field-description">
                  Run GPU workloads on a K8s configured cluster. This is the default.
                </span>
              </span>
              <span class="ui-radio" data-checked="true" role="radio" aria-checked="true" aria-label="Kubernetes" tabIndex={0}>
                <span></span>
              </span>
            </label>
            <label class="ui-radio-card" data-radio-item data-checked="false">
              <span class="ui-item-content">
                <span class="root-field-title">Virtual Machine</span>
                <span class="ui-field-description">
                  Access a VM configured cluster to run workloads. (Coming soon)
                </span>
              </span>
              <span class="ui-radio" data-checked="false" role="radio" aria-checked="false" aria-label="Virtual Machine" tabIndex={-1}>
                <span></span>
              </span>
            </label>
          </div>
        </fieldset>

        <div class="ui-field-separator" aria-hidden="true"></div>

        <div class="ui-field ui-field-horizontal">
          <span class="ui-item-content">
            <label class="root-field-title" for="rtl-gpu-count">Number of GPUs</label>
            <span class="ui-field-description">You can add more later.</span>
          </span>
          <span class="ui-button-group root-counter-group" data-counter data-counter-min="1" data-counter-max="99">
            <input
              class="ui-counter-input"
              id="rtl-gpu-count"
              value="8"
              inputMode="numeric"
              maxLength={3}
              data-counter-input
              aria-label="Number of GPUs"
            />
            <button
              class="ui-icon-button ui-icon-button-sm"
              type="button"
              aria-label="Decrement"
              data-counter-step="-1"
            >
              <MinusIcon />
            </button>
            <button
              class="ui-icon-button ui-icon-button-sm"
              type="button"
              aria-label="Increment"
              data-counter-step="1"
            >
              <PlusIcon />
            </button>
          </span>
        </div>

        <div class="ui-field-separator" aria-hidden="true"></div>

        <div class="ui-field ui-field-horizontal">
          <span class="ui-item-content">
            <label class="root-field-title" for="rtl-tinting">Wallpaper Tinting</label>
            <span class="ui-field-description">Allow the wallpaper to be tinted.</span>
          </span>
          <UiSwitch id="rtl-tinting" checked />
        </div>
      </div>
    </fieldset>
  )
}

function UiSwitch(props: { id?: string; checked?: boolean; disabled?: boolean; invalid?: boolean; size?: "sm" | "default"; ariaLabel?: string }) {
  return (
    <button
      id={props.id}
      type="button"
      class={`ui-switch${props.size === "sm" ? " is-sm" : ""}`}
      role="switch"
      aria-label={props.ariaLabel}
      aria-checked={props.checked ? "true" : "false"}
      aria-invalid={props.invalid ? "true" : undefined}
      data-checked={props.checked ? "true" : "false"}
      disabled={props.disabled}
      onClick$={(event: MouseEvent) => {
        const target = event.currentTarget
        if (!(target instanceof HTMLButtonElement)) {
          return
        }

        const next = target.dataset.checked !== "true"
        target.dataset.checked = next ? "true" : "false"
        target.setAttribute("aria-checked", next ? "true" : "false")
      }}
    >
      <span></span>
    </button>
  )
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2l3.086 6.253 6.9 1.002-4.993 4.867 1.179 6.873z" />
    </svg>
  )
}

function BadgeCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function ChevronRightIcon(props: { class?: string }) {
  return (
    <svg class={props.class} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function AppsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}

function CircleDashedPlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke-dasharray="3 3" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  )
}

const mentionPages = [
  { title: "Meeting Notes", image: "📝" },
  { title: "Project Dashboard", image: "📊" },
  { title: "Ideas & Brainstorming", image: "💡" },
  { title: "Calendar & Events", image: "📅" },
  { title: "Documentation", image: "📚" },
  { title: "Goals & Objectives", image: "🎯" },
  { title: "Budget Planning", image: "💰" },
  { title: "Team Directory", image: "👥" },
  { title: "Technical Specs", image: "🔧" },
  { title: "Analytics Report", image: "📈" },
]

const mentionUsers = [
  { title: "shadcn", image: "/avatars/01.png" },
  { title: "maxleiter", image: "/avatars/02.png" },
  { title: "evilrabbit", image: "/avatars/03.png" },
]

function RootPromptPreview(props: { rtl?: boolean }) {
  return (
    <form class="ui-field">
      <label class="sr-only" for="notion-prompt">
        Prompt
      </label>
      <div class="ui-input-group ui-input-group-block root-prompt-group">
        <span
          class="ui-input-group-addon ui-input-group-addon-block root-prompt-top"
          data-mention-root
          data-command-scope
        >
          <span class="ui-menu" data-menu>
            <button
              class="ui-input-group-button ui-input-group-button-outline root-prompt-context"
              type="button"
              data-menu-trigger
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-label="Add context"
              data-tooltip="Mention a person, page, or date"
            >
              <AtIcon />
              <span class="root-prompt-context-label">Add context</span>
            </button>
            <div
              class="ui-popover-panel root-mention-popover"
              data-menu-panel
              data-menu-side="bottom"
              data-menu-align="start"
              role="dialog"
              aria-label="Add context"
              hidden
            >
              <div class="root-command">
                <div class="root-command-input">
                  <SearchIcon />
                  <input
                    class="root-command-field"
                    type="text"
                    placeholder="Search pages..."
                    aria-label="Search pages"
                    data-mention-search
                  />
                </div>
                <div class="root-command-list" data-mention-list role="listbox">
                  <p class="root-command-empty" data-mention-empty hidden>
                    No pages found
                  </p>
                  <div class="root-command-group" data-mention-group="page">
                    <p class="root-command-heading">Pages</p>
                    {mentionPages.map((item) => (
                      <button
                        class="root-command-item"
                        type="button"
                        role="option"
                        aria-selected="false"
                        key={item.title}
                        data-mention-item
                        data-mention-title={item.title}
                        data-mention-icon={item.image}
                      >
                        <span class="root-command-emoji">{item.image}</span>
                        {item.title}
                      </button>
                    ))}
                  </div>
                  <div class="root-command-group" data-mention-group="user">
                    <p class="root-command-heading">Users</p>
                    {mentionUsers.map((item) => (
                      <button
                        class="root-command-item"
                        type="button"
                        role="option"
                        aria-selected="false"
                        key={item.title}
                        data-mention-item
                        data-mention-title={item.title}
                        data-mention-avatar={item.image}
                      >
                        <span class="ui-avatar root-command-avatar">
                          <img src={item.image} alt="" />
                        </span>
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </span>
          <span class="root-mention-chips" data-mention-chips></span>
        </span>
        <textarea class="ui-input-group-textarea" id="notion-prompt" placeholder="Ask, search, or make anything..."></textarea>
        <span class="ui-input-group-addon ui-input-group-addon-block root-prompt-bottom">
          <button
            class="ui-input-group-button ui-input-group-button-icon"
            type="button"
            aria-label="Attach file"
            data-tooltip="Attach file"
          >
            <PaperclipIcon />
          </button>
          <span class="ui-menu" data-menu>
            <button
              class="ui-input-group-button root-pill-button"
              type="button"
              data-menu-trigger
              data-tooltip="Select AI model"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <span data-menu-label-target>Auto</span>
            </button>
            <div
              class="ui-menu-panel root-model-menu"
              data-menu-panel
              data-menu-side="top"
              data-menu-align="start"
              role="menu"
              hidden
            >
              <span class="ui-menu-label">Select Agent Mode</span>
              <button class="ui-menu-item" type="button" role="menuitemradio" data-menu-item data-menu-value="Auto" data-selected="true">
                Auto
                <CheckIcon class="ui-menu-item-check" />
              </button>
              <button class="ui-menu-item" type="button" role="menuitemradio" data-menu-item data-menu-value="Agent Mode">
                Agent Mode
                <span class="ui-badge ui-badge-secondary root-beta-badge">Beta</span>
                <CheckIcon class="ui-menu-item-check" />
              </button>
              <button class="ui-menu-item" type="button" role="menuitemradio" data-menu-item data-menu-value="Plan Mode">
                Plan Mode
                <CheckIcon class="ui-menu-item-check" />
              </button>
            </div>
          </span>
          <span class="ui-menu" data-menu>
            <button
              class="ui-input-group-button root-pill-button"
              type="button"
              data-menu-trigger
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <GlobeIcon />
              All Sources
            </button>
            <div
              class="ui-menu-panel root-sources-menu"
              data-menu-panel
              data-menu-side="top"
              data-menu-align="end"
              role="menu"
              hidden
            >
              <label class="ui-menu-item" data-menu-item data-menu-keep-open>
                <GlobeIcon />
                Web Search
                <span class="root-menu-trailing">
                  <UiSwitch checked />
                </span>
              </label>
              <span class="ui-menu-separator" aria-hidden="true"></span>
              <label class="ui-menu-item" data-menu-item data-menu-keep-open>
                <AppsIcon />
                Apps and Integrations
                <span class="root-menu-trailing">
                  <UiSwitch checked />
                </span>
              </label>
              <button class="ui-menu-item" type="button" role="menuitem" data-menu-item>
                <CircleDashedPlusIcon />
                All Sources I can access
              </button>
              <span class="ui-menu-sub ui-menu" data-menu>
                <button
                  class="ui-menu-item"
                  type="button"
                  role="menuitem"
                  data-menu-item
                  data-menu-trigger
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  <span class="ui-avatar root-menu-avatar">
                    <img src="/avatars/01.png" alt="" />
                  </span>
                  shadcn
                  <ChevronRightIcon class="root-menu-trailing-icon" />
                </button>
                <div
                  class="ui-menu-panel root-knowledge-menu"
                  data-menu-panel
                  data-menu-side={props.rtl ? "left" : "right"}
                  role="menu"
                  hidden
                >
                  <div class="root-command" data-command-scope>
                    <div class="root-command-input">
                      <SearchIcon />
                      <input
                        class="root-command-field"
                        type="text"
                        placeholder="Find or use knowledge in..."
                        aria-label="Find knowledge"
                        data-mention-search
                      />
                    </div>
                    <div class="root-command-list" data-mention-list role="listbox">
                      <p class="root-command-empty" data-mention-empty hidden>
                        No knowledge found
                      </p>
                      <div class="root-command-group" data-mention-group="user">
                        {mentionUsers.map((user) => (
                          <button
                            class="root-command-item"
                            type="button"
                            role="option"
                            aria-selected="false"
                            key={user.title}
                            data-mention-item
                            data-mention-title={user.title}
                            data-mention-avatar={user.image}
                          >
                            <span class="ui-avatar root-command-avatar">
                              <img src={user.image} alt="" />
                            </span>
                            {user.title}
                            <span class="root-command-item-hint">- Workspace</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </span>
              <button class="ui-menu-item" type="button" role="menuitem" data-menu-item>
                <BookIcon />
                Help Center
              </button>
              <span class="ui-menu-separator" aria-hidden="true"></span>
              <button class="ui-menu-item" type="button" role="menuitem" data-menu-item>
                <PlusIcon />
                Connect Apps
              </button>
              <span class="ui-menu-label">We&apos;ll only search in the sources selected here.</span>
            </div>
          </span>
          <button class="ui-input-group-button ui-input-group-button-icon ui-input-group-button-primary ui-input-group-addon-end" type="button" aria-label="Send">
            <ArrowUpIcon />
          </button>
        </span>
      </div>
    </form>
  )
}

function RootButtonGroupDemoPreview(props: { rtl?: boolean }) {
  return (
    <div class="ui-button-group">
      <button class="ui-icon-button ui-icon-button-sm" type="button" aria-label="Go Back">
        <ArrowLeftGlyph class="root-rtl-directional-icon" />
      </button>
      <span class="ui-button-group ui-button-group-attached root-button-group-inline">
        <button class="button button-outline button-xs" type="button">
          Archive
        </button>
        <button class="button button-outline button-xs" type="button">
          Report
        </button>
      </span>
      <span class="ui-button-group ui-button-group-attached root-button-group-inline">
        <button class="button button-outline button-xs" type="button">
          Snooze
        </button>
        <span class="ui-menu" data-menu>
          <button
            class="ui-icon-button ui-icon-button-sm"
            type="button"
            aria-label="More Options"
            data-menu-trigger
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <MoreHorizontalIcon />
          </button>
          <div
            class="ui-menu-panel root-actions-menu"
            data-menu-panel
            data-menu-side="bottom"
            data-menu-align="end"
            role="menu"
            hidden
          >
            <button class="ui-menu-item" type="button" role="menuitem" data-menu-item>
              <MailCheckIcon />
              Mark as Read
            </button>
            <button class="ui-menu-item" type="button" role="menuitem" data-menu-item>
              <ArchiveIcon />
              Archive
            </button>
            <span class="ui-menu-separator" aria-hidden="true"></span>
            <button class="ui-menu-item" type="button" role="menuitem" data-menu-item>
              <ClockIcon />
              Snooze
            </button>
            <button class="ui-menu-item" type="button" role="menuitem" data-menu-item>
              <CalendarPlusIcon />
              Add to Calendar
            </button>
            <button class="ui-menu-item" type="button" role="menuitem" data-menu-item>
              <ListFilterIcon />
              Add to List
            </button>
            <span class="ui-menu-sub ui-menu" data-menu>
              <button
                class="ui-menu-item"
                type="button"
                role="menuitem"
                data-menu-item
                data-menu-trigger
                aria-haspopup="menu"
                aria-expanded="false"
              >
                <TagIcon />
                Label As...
                <ChevronRightIcon class="root-menu-trailing-icon" />
              </button>
              <div class="ui-menu-panel" data-menu-panel data-menu-side={props.rtl ? "left" : "right"} role="menu" hidden>
                <button class="ui-menu-item" type="button" role="menuitemradio" data-menu-item data-menu-value="Personal" data-selected="true">
                  Personal
                  <CheckIcon class="ui-menu-item-check" />
                </button>
                <button class="ui-menu-item" type="button" role="menuitemradio" data-menu-item data-menu-value="Work">
                  Work
                  <CheckIcon class="ui-menu-item-check" />
                </button>
                <button class="ui-menu-item" type="button" role="menuitemradio" data-menu-item data-menu-value="Other">
                  Other
                  <CheckIcon class="ui-menu-item-check" />
                </button>
              </div>
            </span>
            <span class="ui-menu-separator" aria-hidden="true"></span>
            <button class="ui-menu-item" type="button" role="menuitem" data-menu-item data-destructive="true">
              <TrashIcon />
              Trash
            </button>
          </div>
        </span>
      </span>
    </div>
  )
}

function RootFieldCheckboxPreview() {
  return (
    <label class="ui-field ui-field-horizontal root-check-field" for="checkbox-demo-rtl">
      <UiCheckbox id="checkbox-demo-rtl" checked />
      <span class="ui-label ui-label-normal">I agree to the terms and conditions</span>
    </label>
  )
}

function RootNestedButtonsPreview() {
  return (
    <div class="root-nested-row">
      <div class="ui-button-group">
        <span class="ui-button-group ui-button-group-attached root-button-group-inline">
          <button class="button button-outline button-xs" type="button">
            1
          </button>
          <button class="button button-outline button-xs" type="button">
            2
          </button>
          <button class="button button-outline button-xs" type="button">
            3
          </button>
        </span>
        <span class="ui-button-group ui-button-group-attached root-button-group-inline">
          <button class="ui-icon-button ui-icon-button-sm" type="button" aria-label="Previous">
            <ArrowLeftGlyph class="root-rtl-directional-icon" />
          </button>
          <button class="ui-icon-button ui-icon-button-sm" type="button" aria-label="Next">
            <ArrowRightGlyph class="root-rtl-directional-icon" />
          </button>
        </span>
      </div>
      <div class="ui-button-group ui-button-group-attached root-button-group-inline">
        <button class="button button-outline button-xs" type="button">
          <BotIcon />
          Copilot
        </button>
        <span class="ui-menu" data-menu>
          <button
            class="ui-icon-button ui-icon-button-sm"
            type="button"
            aria-label="Open Popover"
            data-menu-trigger
            aria-haspopup="dialog"
            aria-expanded="false"
          >
            <ChevronDownIcon />
          </button>
          <div
            class="ui-popover-panel root-agent-popover"
            data-menu-panel
            data-menu-side="bottom"
            data-menu-align="end"
            role="dialog"
            aria-label="Agent Tasks"
            hidden
          >
            <div class="root-agent-popover-head">
              <p class="ui-popover-title">Agent Tasks</p>
            </div>
            <span class="ui-separator" aria-hidden="true"></span>
            <div class="root-agent-popover-body">
              <textarea
                class="ui-textarea root-agent-textarea"
                placeholder="Describe your task in natural language."
                aria-label="Agent task"
              ></textarea>
              <p class="ui-popover-title">Start a new task with Copilot</p>
              <p class="ui-popover-text">
                Describe your task in natural language. Copilot will work in the background and open
                a pull request for your review.
              </p>
            </div>
          </div>
        </span>
      </div>
    </div>
  )
}

function RootFieldHearPreview() {
  return (
    <div class="ui-card root-hear-card">
      <form>
        <fieldset class="ui-field-set">
          <legend class="ui-field-legend">How did you hear about us?</legend>
          <p class="ui-field-description root-clamp-1">
            Select the option that best describes how you heard about us.
          </p>
          <div class="root-hear-options">
            {[
              { label: "Social Media", checked: true },
              { label: "Search Engine", checked: false },
              { label: "Referral", checked: false },
              { label: "Other", checked: false },
            ].map((option) => (
              <label
                class="root-hear-option"
                key={option.label}
                data-hear-option
                data-checked={option.checked ? "true" : "false"}
              >
                <span
                  class="ui-checkbox root-hear-check"
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={option.checked ? "true" : "false"}
                  aria-label={option.label}
                  data-checked={option.checked ? "true" : "false"}
                >
                  <CheckIcon />
                </span>
                <span class="root-field-title">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </div>
  )
}

function RootSpinnerEmptyPreview() {
  return (
    <div class="ui-empty root-empty-solid">
      <div class="ui-empty-header">
        <span class="root-empty-media">
          <UiSpinner />
        </span>
        <p class="ui-empty-title">Processing your request</p>
        <p class="ui-empty-description">
          Please wait while we process your request. Do not refresh the page.
        </p>
      </div>
      <div>
        <button class="button button-outline button-xs" type="button">
          Cancel
        </button>
      </div>
    </div>
  )
}

function AtIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M13.234 20.252 21 12.3" />
      <path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

function ArrowLeftGlyph(props: { class?: string }) {
  return (
    <svg class={props.class} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

function ArrowRightGlyph(props: { class?: string }) {
  return (
    <svg class={props.class} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function MoreHorizontalIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

function MailCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      <path d="m16 19 2 2 4-4" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function CalendarPlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M12 14v4" />
      <path d="M10 16h4" />
    </svg>
  )
}

function ListFilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

function BotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}

function ChevronDownIcon(props: { class?: string }) {
  return (
    <svg class={props.class} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ExamplesRootPreview(props: { rtl?: boolean } = {}) {
  const rtl = untrack(() => props.rtl ?? false)

  return (
    <div
      class={rtl ? "examples-root-grid rtl-components" : "examples-root-grid"}
      dir={rtl ? "rtl" : undefined}
      data-lang={rtl ? "ar" : undefined}
      data-slot={rtl ? "rtl-components" : undefined}
      lang={rtl ? "ar" : undefined}
    >
      {rtl ? (
        <span class="ui-menu rtl-language-selector" data-menu>
          <button
            type="button"
            class="ui-select-trigger"
            aria-label="Language"
            aria-haspopup="listbox"
            aria-expanded="false"
            data-menu-trigger
          >
            <span data-menu-label-target>Arabic (العربية)</span>
            <ChevronDownIcon class="ui-select-chevron" />
          </button>
          <div
            class="ui-select-content"
            role="listbox"
            aria-label="Language"
            data-menu-panel
            data-menu-side="bottom"
            data-menu-align="start"
            hidden
          >
            <button
              type="button"
              class="ui-select-item"
              role="option"
              aria-selected="true"
              data-menu-item
              data-menu-value="Arabic (العربية)"
              data-rtl-language="ar"
            >
              <span class="ui-select-item-label">Arabic (العربية)</span>
              <CheckIcon class="ui-select-item-check" />
            </button>
            <button
              type="button"
              class="ui-select-item"
              role="option"
              aria-selected="false"
              data-menu-item
              data-menu-value="Hebrew (עברית)"
              data-rtl-language="he"
            >
              <span class="ui-select-item-label">Hebrew (עברית)</span>
              <CheckIcon class="ui-select-item-check" />
            </button>
          </div>
        </span>
      ) : null}
      {examplesRootColumns.map((column, columnIndex) => (
        <div class={`examples-root-column${column.className ? ` ${column.className}` : ""}`} key={`column-${columnIndex}`}>
          {column.entries.map((entry) => (
            <div class="example-root-panel" key={`${columnIndex}-${entry}`}>
              {entry === "field-demo" ? <RootFieldDemoPreview /> : null}

              {entry === "avatars" ? <RootAvatarEmptyPreview /> : null}

              {entry === "spinner-badge" ? <RootSpinnerBadgePreview /> : null}

              {entry === "button-group-input" ? <RootButtonGroupInputPreview /> : null}

              {entry === "field-slider" ? <RootFieldSliderPreview rtl={rtl} /> : null}

              {entry === "input-group-demo" ? <RootInputGroupDemoPreview rtl={rtl} /> : null}

              {entry === "input-group-button" ? <RootInputGroupButtonPreview rtl={rtl} /> : null}

              {entry === "item-demo" ? <RootItemDemoPreview /> : null}

              {entry === "appearance-separator" ? (
                <div class="ui-field-separator root-section-separator">
                  <span>Appearance Settings</span>
                </div>
              ) : null}

              {entry === "appearance-settings" ? <RootAppearanceSettingsPreview /> : null}

              {entry === "notion-prompt" ? <RootPromptPreview rtl={rtl} /> : null}

              {entry === "button-group-demo" ? <RootButtonGroupDemoPreview rtl={rtl} /> : null}

              {entry === "field-checkbox" ? <RootFieldCheckboxPreview /> : null}

              {entry === "nested-buttons" ? <RootNestedButtonsPreview /> : null}

              {entry === "field-hear" ? <RootFieldHearPreview /> : null}

              {entry === "spinner-empty" ? <RootSpinnerEmptyPreview /> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function ThemeSelectorControl(props: { themes: ThemeEntry[]; activeThemeName: string; onThemeSelect: (themeName: string) => void }) {
  return (
    <div class="theme-selector-stub">
      <UiSelectControl
        id="theme-selector"
        ariaLabel="Theme selector"
        value={props.activeThemeName}
        groupLabel="Theme"
        shellClass="theme-selector-field"
        triggerClass="theme-selector-trigger"
        options={createVisibleThemes.map((theme) => ({ value: theme.name, label: theme.title }))}
        onSelect={(themeName: string) => props.onThemeSelect(themeName)}
      />
      <ThemeCodeControl
        themeName={props.activeThemeName}
        triggerClass="button theme-selector-copy"
        iconOnly
      />
    </div>
  )
}

function ThemeCodeControl(props: { themeName: string; triggerClass: string; iconOnly?: boolean }) {
  let isOpen = $state(false)
  let activeFormat = $state<ThemeCodeFormat>("v4-oklch")

  const closeDialog = () => {
    const trigger = typeof document === "undefined"
      ? null
      : document.querySelector<HTMLButtonElement>("[data-theme-code-trigger][aria-expanded='true']")
    isOpen = false
    if (trigger) {
      window.requestAnimationFrame(() => trigger.focus())
    }
  }

  return (
    <>
      <button
        type="button"
        class={props.triggerClass}
        aria-label="Copy Code"
        title="Copy Code"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        data-theme-code-trigger
        data-theme-name={props.themeName}
        onClick$={() => {
          activeFormat = "v4-oklch"
          isOpen = true
          if (typeof document !== "undefined") {
            window.requestAnimationFrame(() => {
              document.querySelector<HTMLButtonElement>("[data-theme-code-dialog] .theme-code-close")?.focus()
            })
          }
        }}
      >
        <CopyIcon />
        {props.iconOnly ? <span class="sr-only">Copy Code</span> : <span class="theme-copy-label">Copy Code</span>}
      </button>

      {isOpen ? (
        <div
          class="theme-code-overlay"
          role="presentation"
          data-theme-code-overlay
          onClick$={(event: MouseEvent) => {
            if (event.target === event.currentTarget) {
              closeDialog()
            }
          }}
        >
          <section
            class="theme-code-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-code-title"
            aria-describedby="theme-code-description"
            data-theme-code-dialog
          >
            <button
              type="button"
              class="theme-code-close"
              aria-label="Close"
              onClick$={closeDialog}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <header class="theme-code-header">
              <h2 id="theme-code-title">{props.themeName === "default" ? "Neutral" : props.themeName}</h2>
              <p id="theme-code-description">Copy and paste the following code into your CSS file.</p>
            </header>

            <div
              class="theme-code-tabs"
              role="tablist"
              aria-label="Theme code format"
              onClick$={(event: MouseEvent) => {
                const target = event.target
                if (!(target instanceof Element)) {
                  return
                }

                const tab = target.closest<HTMLElement>("[data-theme-code-format]")
                const format = resolveThemeCodeFormat(tab?.dataset.themeCodeFormat)
                if (format) {
                  activeFormat = format
                }
              }}
            >
              {([
                ["v4-oklch", "OKLCH"],
                ["v4-hsl", "HSL"],
                ["v3", "Tailwind v3"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  class="theme-code-tab"
                  data-theme-code-format={value}
                  data-state={activeFormat === value ? "active" : "inactive"}
                  aria-selected={activeFormat === value}
                >
                  {label}
                </button>
              ))}
            </div>

            <figure class="theme-code-figure">
              <figcaption class="theme-code-caption">
                <span class="theme-code-css-icon" aria-hidden="true">#</span>
                app/globals.css
              </figcaption>
              <div class="theme-code-body">
                <button
                  type="button"
                  class="theme-code-copy"
                  aria-label="Copy"
                  onClick$={(event: MouseEvent) => {
                    const target = event.currentTarget
                    if (!(target instanceof HTMLButtonElement)) {
                      return
                    }

                    const code = target.parentElement?.querySelector("code")?.textContent
                    if (code) {
                      writeClipboardText(code, target)
                    }
                  }}
                >
                  <CopyIcon class="copy-icon-idle" />
                  <CheckIcon class="copy-icon-done" />
                </button>
                <ThemeCodeSource themeName={props.themeName} format={activeFormat} />
              </div>
            </figure>
          </section>
        </div>
      ) : null}
    </>
  )
}

function ThemeCodeSource(props: { themeName: string; format: ThemeCodeFormat }) {
  const themeName = untrack(() => props.themeName)
  const format = untrack(() => props.format)

  return <pre><code>{buildThemeCode(themeName, format)}</code></pre>
}

function AnnouncementBadge() {
  return (
    <a class="announcement-chip" href="/docs/changelog/2026-03-cli-v4">
      <span>shadcn/skills, presets and more</span>
      <svg
        class="announcement-chip-arrow"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </a>
  )
}

function DocsIndexPage(props: { docs: DocSummary[] }) {
  let query = $state("")
  let filteredDocs = $state<DocSummary[]>(props.docs)

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
    <section class="stack-gap container">
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
    <section class="docs-layout" data-slot="docs" data-doc-page={doc.slug.split("/").slice(-1)[0]}>
      <aside class="docs-sidebar">
        {props.route.docNavigation.map((section) => (
          <div class="docs-sidebar-section" key={section.title}>
            <p class="docs-sidebar-label">{section.title}</p>
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

      <article class="doc-main" data-doc-slug={doc.slug}>
        <div class="doc-main-shell">
          <header class="doc-header">
            <div class="doc-header-row">
              <h1>{doc.title}</h1>
              <div class="doc-header-actions">
              <button
                type="button"
                class="button button-outline doc-copy-page"
                onClick$={(event: MouseEvent) => {
                  if (typeof navigator === "undefined" || !navigator.clipboard || !props.route.doc) {
                    return
                  }

                  const bodySnapshot = untrack(() => props.route.doc?.body ?? "")
                  writeClipboardText(bodySnapshot, event.currentTarget)
                }}
              >
                <CopyIcon class="copy-icon-idle" />
                <CheckIcon class="copy-icon-done" />
                Copy Page
              </button>
              {props.route.docPrev ? (
                <a
                  class="button doc-icon-button"
                  href={props.route.docPrev.slug ? `/docs/${props.route.docPrev.slug}` : "/docs"}
                  aria-label="Previous page"
                >
                  <ArrowLeftIcon />
                </a>
              ) : null}
              {props.route.docNext ? (
                <a
                  class="button doc-icon-button"
                  href={props.route.docNext.slug ? `/docs/${props.route.docNext.slug}` : "/docs"}
                  aria-label="Next page"
                >
                  <ArrowRightIcon />
                </a>
              ) : null}
              </div>
            </div>
            <p class="lead">{doc.description || "No description provided."}</p>
          </header>

          <div class="doc-body">
            <DocBlockList blocks={doc.blocks} />
          </div>

          <div class="doc-nav">
            {props.route.docPrev ? (
              <a
                class="button button-secondary"
                href={props.route.docPrev.slug ? `/docs/${props.route.docPrev.slug}` : "/docs"}
              >
                <ArrowLeftIcon />
                {props.route.docPrev.title}
              </a>
            ) : (
              <span />
            )}
            {props.route.docNext ? (
              <a
                class="button button-secondary"
                href={props.route.docNext.slug ? `/docs/${props.route.docNext.slug}` : "/docs"}
              >
                {props.route.docNext.title}
                <ArrowRightIcon />
              </a>
            ) : null}
          </div>
        </div>
      </article>

      <aside class="docs-toc">
        <p class="docs-toc-label">On This Page</p>
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

function DocInline(props: { nodes?: DocInlineNode[]; text: string }) {
  const nodes = props.nodes
  if (!nodes || nodes.length === 0) {
    return props.text
  }

  return nodes.map((node, index) =>
    node.kind === "strong" ? (
      <strong key={`inline-${index}`}>{node.text}</strong>
    ) : node.kind === "em" ? (
      <em key={`inline-${index}`}>{node.text}</em>
    ) : node.kind === "code" ? (
      <code key={`inline-${index}`}>{node.text}</code>
    ) : node.kind === "link" ? (
      <a key={`inline-${index}`} href={node.href || "#"}>
        {node.text}
      </a>
    ) : (
      node.text
    ),
  )
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
          <li key={`${key}-item-${itemIndex}`}>
            <DocInline nodes={block.itemsInline?.[itemIndex]} text={item} />
          </li>
        ))}
      </ol>
    ) : (
      <ul key={key}>
        {(block.items || []).map((item, itemIndex) => (
          <li key={`${key}-item-${itemIndex}`}>
            <DocInline nodes={block.itemsInline?.[itemIndex]} text={item} />
          </li>
        ))}
      </ul>
    )
  ) : block.kind === "blockquote" ? (
    <blockquote key={key}>
      <DocInline nodes={block.inline} text={block.text} />
    </blockquote>
  ) : block.kind === "image" ? (
    <figure class="doc-image" key={key}>
      <img src={block.src || ""} alt={block.alt || block.text || "Documentation image"} loading="lazy" />
    </figure>
  ) : block.kind === "hr" ? (
    <hr key={key} />
  ) : block.kind === "callout" ? (
    <section class="doc-callout" data-variant={block.variant || "default"} key={key}>
      {block.title ? <p class="doc-callout-title">{block.title}</p> : null}
      <div class="doc-callout-body">
        <DocBlockList blocks={untrack(() => block.children || [])} keyPrefix={`${key}-callout`} />
      </div>
    </section>
  ) : block.kind === "steps" ? (
    <div class="doc-steps" key={key}>
      <DocBlockList blocks={untrack(() => block.children || [])} keyPrefix={`${key}-steps`} />
    </div>
  ) : block.kind === "step" ? (
    <h3 class="doc-step" key={key}>
      <DocInline nodes={block.inline} text={block.text} />
    </h3>
  ) : block.kind === "tabs" ? (
    <DocTabsBlock panels={untrack(() => block.panels || [])} blockKey={key} />
  ) : block.kind === "component-list" ? (
    <div class="doc-component-list" key={key}>
      {(block.links || []).map((link) => (
        <a class="doc-component-list-item" href={link.href} key={link.href}>
          {link.title}
        </a>
      ))}
    </div>
  ) : block.kind === "component-preview" || block.kind === "component-source" ? (
    <DocComponentBlock block={untrack(() => block)} />
  ) : (
    <p key={key}>
      <DocInline nodes={block.inline} text={block.text} />
    </p>
  )
}

function DocTabsBlock(props: { panels: Array<{ value: string; label: string; blocks: DocContentBlock[] }>; blockKey: string }) {
  const panels = untrack(() => props.panels)
  const blockKey = untrack(() => props.blockKey)

  return (
    <section class="doc-tabs">
      <div class="doc-tabs-list" role="tablist" aria-label="Documentation tabs">
        {panels.map((panel, panelIndex) => (
          <button
            type="button"
            key={`${blockKey}-${panel.value}`}
            data-index={String(panelIndex)}
            data-panel-value={panel.value}
            class={panelIndex === 0 ? "doc-tab-button doc-tab-button-active" : "doc-tab-button"}
            aria-selected={panelIndex === 0 ? "true" : "false"}
          >
            {panel.label}
          </button>
        ))}
      </div>

      <div class="doc-tabs-panel">
        {panels.map((panel, panelIndex) => (
          <div
            key={`${blockKey}-${panel.value}-panel`}
            class="doc-tab-panel-section"
            data-panel-value={panel.value}
            hidden={panelIndex !== 0}
          >
            <DocBlockList blocks={panel.blocks} keyPrefix={`${blockKey}-${panel.value}`} />
          </div>
        ))}
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
      name: block.name || block.text,
      family: getDocPreviewFamily(block.name || block.text),
      previewCode: block.code ? truncateDocCode(block.code, 2) : "",
    }
  })

  return (
    <section
      class={data.kind === "component-preview" ? "doc-component-card" : "doc-component-card doc-component-card-source"}
      data-doc-preview-name={data.kind === "component-preview" ? data.name : undefined}
    >
      {data.kind === "component-preview" ? (
        <>
          <div class="doc-component-preview-stage" dir={data.direction}>
            <DocComponentPreviewSurface family={data.family} name={data.name} />
          </div>
          {data.previewCode ? (
            <div class="doc-component-code" data-doc-preview-code-expanded="false">
              <pre class="doc-component-snippet">
                <code>{data.previewCode}</code>
              </pre>
              <button
                type="button"
                class="doc-preview-code-toggle"
                data-doc-preview-code-toggle
                aria-expanded="false"
              >
                View Code
              </button>
              <button type="button" class="doc-preview-code-copy" data-doc-preview-code-copy hidden>
                Copy
              </button>
              <pre class="doc-component-full-code" data-doc-preview-full-code hidden>
                <code>{data.code}</code>
              </pre>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div class="doc-component-head">
            <div class="doc-component-copy">
              <p class="eyebrow">Source</p>
              <h3>{data.headingText}</h3>
            </div>
            {data.filePath ? <p class="slug">{data.filePath}</p> : null}
          </div>
          {data.code ? (
            <pre class="doc-code doc-component-source-code">
              <code>{data.code}</code>
            </pre>
          ) : (
            <p>Source is not available for this registry entry yet.</p>
          )}
        </>
      )}
    </section>
  )
}

function DocComponentPreviewSurface(props: { family: string; name: string }) {
  const family = untrack(() => props.family)
  const name = untrack(() => props.name)

  return family === "checkbox" ? (
    <DocCheckboxPreview name={props.name} />
  ) : family === "direction" && name === "card-rtl" ? (
    <DocCardPreview name={props.name} />
  ) : family === "field" || name.startsWith("field-") ? (
    <DocFieldPreview name={props.name} />
  ) : family === "hover-card" || name.startsWith("hover-card-") ? (
    <DocHoverCardPreview name={props.name} />
  ) : family === "input" ? (
    <DocInputPreview name={props.name} />
  ) : family === "input-group" ? (
    <DocInputGroupPreview name={props.name} />
  ) : family === "input-otp" ? (
    <DocInputOtpPreview name={props.name} />
  ) : family === "kbd" ? (
    <DocKbdPreview name={props.name} />
  ) : family === "label" ? (
    <DocLabelPreview name={props.name} />
  ) : family === "menubar" ? (
    <DocMenubarPreview name={props.name} />
  ) : family === "native-select" ? (
    <DocNativeSelectPreview name={props.name} />
  ) : family === "navigation-menu" ? (
    <DocNavigationMenuPreview name={props.name} />
  ) : family === "pagination" ? (
    <DocPaginationPreview name={props.name} />
  ) : family === "popover" ? (
    <DocPopoverPreview name={props.name} />
  ) : family === "progress" ? (
    <DocProgressPreview name={props.name} />
  ) : family === "radio-group" ? (
    <DocRadioGroupPreview name={props.name} />
  ) : family === "resizable" ? (
    <DocResizablePreview name={props.name} />
  ) : family === "scroll-area" ? (
    <DocScrollAreaPreview name={props.name} />
  ) : family === "select" ? (
    <DocSelectPreview name={props.name} />
  ) : family === "separator" ? (
    <DocSeparatorPreview name={props.name} />
  ) : family === "sheet" ? (
    <DocSheetPreview name={props.name} />
  ) : family === "sidebar" ? (
    <DocSidebarPreview name={props.name} />
  ) : family === "skeleton" ? (
    <DocSkeletonPreview name={props.name} />
  ) : family === "slider" ? (
    <DocSliderPreview name={props.name} />
  ) : family === "sonner" ? (
    <DocSonnerPreview name={props.name} />
  ) : family === "spinner" ? (
    <DocSpinnerPreview name={props.name} />
  ) : family === "switch" ? (
    <DocSwitchPreview name={props.name} />
  ) : family === "typography" ? (
    <DocTypographyPreview name={props.name} />
  ) : family === "table" ? (
    <DocTablePreview name={props.name} />
  ) : family === "tabs" ? (
    <DocTabsPreview name={props.name} />
  ) : family === "textarea" ? (
    <DocTextareaPreview name={props.name} />
  ) : family === "toggle" ? (
    <DocTogglePreview name={props.name} />
  ) : family === "toggle-group" ? (
    <DocToggleGroupPreview name={props.name} />
  ) : family === "tooltip" ? (
    <DocTooltipPreview name={props.name} />
  ) : family === "item" ? (
    <DocItemPreview name={props.name} />
  ) : family === "empty" || name.startsWith("empty-") ? (
    <DocEmptyPreview name={props.name} />
  ) : family === "dropdown-menu" || name.startsWith("dropdown-menu-") ? (
    <DocDropdownMenuPreview name={props.name} />
  ) : family === "drawer" || name.startsWith("drawer-") ? (
    <DocDrawerPreview name={props.name} />
  ) : family === "dialog" || name.startsWith("dialog-") ? (
    <DocDialogPreview name={props.name} />
  ) : family === "date-picker" || name.startsWith("date-picker-") ? (
    <DocDatePickerPreview name={props.name} />
  ) : family === "data-table" || name.startsWith("data-table-") ? (
    <DocDataTablePreview name={props.name} />
  ) : family === "context-menu" || name.startsWith("context-menu-") ? (
    <DocContextMenuPreview name={props.name} />
  ) : family === "command" || name.startsWith("command-") ? (
    <DocCommandPreview name={props.name} />
  ) : family === "combobox" ? (
    <DocComboboxPreview name={props.name} />
  ) : family === "collapsible" ? (
    <DocCollapsiblePreview name={props.name} />
  ) : family === "chart" ? (
    <DocChartPreview name={props.name} />
  ) : family === "carousel" ? (
    <DocCarouselPreview name={props.name} />
  ) : family === "card" ? (
    <DocCardPreview name={props.name} />
  ) : family === "calendar" ? (
    <DocCalendarPreview name={props.name} />
  ) : family === "button" || name === "button-group-demo" ? (
    <DocButtonPreview name={props.name} />
  ) : family === "button-group" ? (
    <DocButtonGroupPreview name={props.name} />
  ) : family === "breadcrumb" ? (
    <DocBreadcrumbPreview name={props.name} />
  ) : family === "badge" ? (
    <DocBadgePreview name={props.name} />
  ) : family === "avatar" ? (
    <DocAvatarPreview name={props.name} />
  ) : family === "aspect-ratio" ? (
    <DocAspectRatioPreview name={props.name} />
  ) : family === "alert-dialog" ? (
    <DocAlertDialogPreview name={props.name} />
  ) : family === "alert" ? (
    <DocAlertPreview name={props.name} />
  ) : family === "accordion" ? (
    <DocAccordionPreview name={props.name} />
  ) : family === "button-group" || family === "toggle" || family === "toggle-group" ? (
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
  ) : family === "tabs" || family === "collapsible" || family === "navigation-menu" || family === "menubar" || family === "context-menu" || family === "dropdown-menu" || family === "breadcrumb" || family === "pagination" || family === "sidebar" ? (
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

const docFieldMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
const docFieldYears = ["2024", "2025", "2026", "2027", "2028", "2029"]

function DocFieldText(props: { ar: string; he: string; en: string }) {
  return <span data-doc-rtl-text data-text-ar={props.ar} data-text-he={props.he} data-text-en={props.en}>{props.ar}</span>
}

function DocFieldCheckboxControl(props: { id: string; label: string; checked?: boolean; disabled?: boolean }) {
  return (
    <button
      id={props.id}
      type="button"
      class="ui-checkbox doc-field-checkbox"
      role="checkbox"
      aria-label={props.label}
      aria-checked={props.checked ? "true" : "false"}
      data-checked={props.checked ? "true" : "false"}
      disabled={props.disabled}
      onClick$={(event: MouseEvent) => {
        const target = event.currentTarget
        if (!(target instanceof HTMLButtonElement) || target.disabled) return
        const next = target.dataset.checked !== "true"
        target.dataset.checked = next ? "true" : "false"
        target.setAttribute("aria-checked", next ? "true" : "false")
      }}
    >
      <CheckIcon />
    </button>
  )
}

function DocFieldRadioControl(props: { id: string; label: string; checked?: boolean }) {
  return (
    <span id={props.id} class="ui-radio" data-checked={props.checked ? "true" : "false"} role="radio" aria-label={props.label} aria-checked={props.checked ? "true" : "false"} tabIndex={props.checked ? 0 : -1}>
      <span></span>
    </span>
  )
}

function DocFieldPaymentForm(props: { rtl?: boolean }) {
  const rtl = untrack(() => !!props.rtl)
  const text = (ar: string, he: string, en: string) => rtl ? <DocFieldText ar={ar} he={he} en={en} /> : en
  const monthOptions = docFieldMonths.map((value) => ({ value, label: rtl ? new Intl.NumberFormat("ar-SA", { useGrouping: false }).format(Number(value)) : value }))
  return (
    <div class={`doc-field-payment${rtl ? " is-rtl" : ""}`} dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}>
      <form class="doc-field-form" data-doc-field-form>
        <div class="doc-field-group">
          <fieldset class="doc-field-set">
            <legend class="doc-field-legend">{text("طريقة الدفع", "אמצעי תשלום", "Payment Method")}</legend>
            <p class="doc-field-description">{text("جميع المعاملات آمنة ومشفرة", "כל העסקאות מאובטחות ומוצפנות", "All transactions are secure and encrypted")}</p>
            <div class="doc-field-group">
              <div class="doc-field">
                <label class="doc-field-label" for={`doc-field-card-name${rtl ? "-rtl" : ""}`}>{text("الاسم على البطاقة", "שם על הכרטיס", "Name on Card")}</label>
                <input class="ui-input" id={`doc-field-card-name${rtl ? "-rtl" : ""}`} placeholder="Evil Rabbit" required />
              </div>
              <div class="doc-field">
                <label class="doc-field-label" for={`doc-field-card-number${rtl ? "-rtl" : ""}`}>{text("رقم البطاقة", "מספר כרטיס", "Card Number")}</label>
                <input class="ui-input" id={`doc-field-card-number${rtl ? "-rtl" : ""}`} placeholder="1234 5678 9012 3456" required />
                <p class="doc-field-description">{text("أدخل رقم البطاقة المكون من 16 رقمًا", "הזן את מספר הכרטיס בן 16 הספרות שלך", "Enter your 16-digit card number")}</p>
              </div>
              <div class="doc-field-grid is-three">
                <div class="doc-field">
                  <label class="doc-field-label" for={`doc-field-month${rtl ? "-rtl" : ""}`}>{text("الشهر", "חודש", "Month")}</label>
                  <UiSelectControl triggerId={`doc-field-month${rtl ? "-rtl" : ""}`} ariaLabel="MM" value="" placeholder="MM" shellClass="ui-select-shell-full" options={monthOptions} />
                </div>
                <div class="doc-field">
                  <label class="doc-field-label" for={`doc-field-year${rtl ? "-rtl" : ""}`}>{text("السنة", "שנה", "Year")}</label>
                  <UiSelectControl triggerId={`doc-field-year${rtl ? "-rtl" : ""}`} ariaLabel="YYYY" value="" placeholder="YYYY" shellClass="ui-select-shell-full" options={docFieldYears.map((value) => ({ value, label: value }))} />
                </div>
                <div class="doc-field">
                  <label class="doc-field-label" for={`doc-field-cvv${rtl ? "-rtl" : ""}`}>CVV</label>
                  <input class="ui-input" id={`doc-field-cvv${rtl ? "-rtl" : ""}`} placeholder="123" required />
                </div>
              </div>
            </div>
          </fieldset>
          <div class="doc-field-separator" aria-hidden="true"></div>
          <fieldset class="doc-field-set">
            <legend class="doc-field-legend">{text("عنوان الفوترة", "כתובת חיוב", "Billing Address")}</legend>
            <p class="doc-field-description">{text("عنوان الفوترة المرتبط بطريقة الدفع الخاصة بك", "כתובת החיוב המשויכת לאמצעי התשלום שלך", "The billing address associated with your payment method")}</p>
            <div class="doc-field-group is-nested">
              <div class="doc-field is-horizontal" data-doc-field-toggle>
                <DocFieldCheckboxControl id={`doc-field-shipping${rtl ? "-rtl" : ""}`} label={rtl ? "نفس عنوان الشحن" : "Same as shipping address"} checked />
                <label class="doc-field-label is-normal" for={`doc-field-shipping${rtl ? "-rtl" : ""}`}>{text("نفس عنوان الشحن", "זהה לכתובת המשלוח", "Same as shipping address")}</label>
              </div>
            </div>
          </fieldset>
          <fieldset class="doc-field-set">
            <div class="doc-field-group is-nested">
              <div class="doc-field">
                <label class="doc-field-label" for={`doc-field-comments${rtl ? "-rtl" : ""}`}>{text("تعليقات", "הערות", "Comments")}</label>
                <textarea class="ui-textarea doc-field-textarea" id={`doc-field-comments${rtl ? "-rtl" : ""}`} placeholder={rtl ? "أضف أي تعليقات إضافية" : "Add any additional comments"} data-placeholder-ar={rtl ? "أضف أي تعليقات إضافية" : undefined} data-placeholder-he={rtl ? "הוסף הערות נוספות" : undefined} data-placeholder-en={rtl ? "Add any additional comments" : undefined}></textarea>
              </div>
            </div>
          </fieldset>
          <div class="doc-field is-horizontal doc-field-actions">
            <button class="doc-button is-default" type="submit">{text("إرسال", "שלח", "Submit")}</button>
            <button class="doc-button is-outline" type="button">{text("إلغاء", "בטל", "Cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  )
}

function DocFieldPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("field-", ""))
  if (variant === "demo") return <DocFieldPaymentForm />
  if (variant === "rtl") return <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-field-rtl-preview" dir="rtl" data-lang="ar"><DocFieldPaymentForm rtl /></div></div>
  if (variant === "input") return <fieldset class="doc-field-set doc-field-width-xs"><div class="doc-field-group"><div class="doc-field"><label class="doc-field-label" for="doc-username">Username</label><input class="ui-input" id="doc-username" placeholder="Max Leiter" /><p class="doc-field-description">Choose a unique username for your account.</p></div><div class="doc-field"><label class="doc-field-label" for="doc-password">Password</label><p class="doc-field-description">Must be at least 8 characters long.</p><input class="ui-input" id="doc-password" type="password" placeholder="••••••••" /></div></div></fieldset>
  if (variant === "textarea") return <fieldset class="doc-field-set doc-field-width-xs"><div class="doc-field-group"><div class="doc-field"><label class="doc-field-label" for="doc-feedback">Feedback</label><textarea class="ui-textarea doc-field-feedback" id="doc-feedback" placeholder="Your feedback helps us improve..." rows={4}></textarea><p class="doc-field-description">Share your thoughts about our service.</p></div></div></fieldset>
  if (variant === "select") return <div class="doc-field doc-field-width-xs"><label class="doc-field-label">Department</label><UiSelectControl ariaLabel="Department" value="" placeholder="Choose department" shellClass="ui-select-shell-full" options={["Engineering", "Design", "Marketing", "Sales", "Customer Support", "Human Resources", "Finance", "Operations"].map((label) => ({ value: label.toLowerCase().replace(/ /g, "-"), label }))} /><p class="doc-field-description">Select your department or area of work.</p></div>
  if (variant === "slider") return <div class="doc-field doc-field-width-xs doc-field-slider" data-slider-scope="doc-field-price"><p class="doc-field-label">Price Range</p><p class="doc-field-description is-before-control">Set your budget range ($<span class="doc-field-numeric" data-slider-output="0">200</span> - <span class="doc-field-numeric" data-slider-output="1">800</span>).</p><div class="ui-slider" data-slider="doc-field-price" data-slider-min="0" data-slider-max="1000" data-slider-step="10" role="group" aria-label="Price Range"><span class="ui-slider-track"><span class="ui-slider-range" data-slider-range style="left:20%;right:20%"></span></span><span class="ui-slider-thumb" data-slider-thumb="0" data-slider-value="200" role="slider" tabIndex={0} aria-label="Minimum price" aria-valuemin={0} aria-valuemax={1000} aria-valuenow={200} style="left:20%"></span><span class="ui-slider-thumb" data-slider-thumb="1" data-slider-value="800" role="slider" tabIndex={0} aria-label="Maximum price" aria-valuemin={0} aria-valuemax={1000} aria-valuenow={800} style="left:80%"></span></div></div>
  if (variant === "fieldset") return <fieldset class="doc-field-set doc-field-width-sm"><legend class="doc-field-legend">Address Information</legend><p class="doc-field-description">We need your address to deliver your order.</p><div class="doc-field-group"><div class="doc-field"><label class="doc-field-label" for="doc-street">Street Address</label><input class="ui-input" id="doc-street" placeholder="123 Main St" /></div><div class="doc-field-grid is-two"><div class="doc-field"><label class="doc-field-label" for="doc-city">City</label><input class="ui-input" id="doc-city" placeholder="New York" /></div><div class="doc-field"><label class="doc-field-label" for="doc-zip">Postal Code</label><input class="ui-input" id="doc-zip" placeholder="90502" /></div></div></div></fieldset>
  if (variant === "checkbox") return <div class="doc-field-group doc-field-width-xs"><fieldset class="doc-field-set"><legend class="doc-field-legend is-label">Show these items on the desktop</legend><p class="doc-field-description">Select the items you want to show on the desktop.</p><div class="doc-field-group is-checkboxes">{["Hard disks", "External disks", "CDs, DVDs, and iPods", "Connected servers"].map((label, index) => <div class="doc-field is-horizontal" data-doc-field-toggle><DocFieldCheckboxControl id={`doc-finder-${index}`} label={label} /><label class="doc-field-label is-normal" for={`doc-finder-${index}`}>{label}</label></div>)}</div></fieldset><div class="doc-field-separator"></div><div class="doc-field is-horizontal is-content" data-doc-field-toggle><DocFieldCheckboxControl id="doc-sync-folders" label="Sync Desktop & Documents folders" checked /><div class="doc-field-content"><label class="doc-field-label" for="doc-sync-folders">Sync Desktop &amp; Documents folders</label><p class="doc-field-description">Your Desktop &amp; Documents folders are being synced with iCloud Drive. You can access them from other devices.</p></div></div></div>
  if (variant === "radio") return <fieldset class="doc-field-set doc-field-width-xs"><legend class="doc-field-legend is-label">Subscription Plan</legend><p class="doc-field-description">Yearly and lifetime plans offer significant savings.</p><div class="doc-field-radio-group" data-radio-group role="radiogroup" aria-label="Subscription Plan">{[["monthly", "Monthly ($9.99/month)"], ["yearly", "Yearly ($99.99/year)"], ["lifetime", "Lifetime ($299.99)"]].map((item, index) => <label class="doc-field is-horizontal" data-radio-item data-checked={index === 0 ? "true" : "false"}><DocFieldRadioControl id={`doc-plan-${item[0]}`} label={item[1]} checked={index === 0} /><span class="doc-field-label is-normal">{item[1]}</span></label>)}</div></fieldset>
  if (variant === "switch") return <div class="doc-field is-horizontal is-fit" data-doc-field-toggle><label class="doc-field-label" for="doc-2fa">Multi-factor authentication</label><UiSwitch id="doc-2fa" /></div>
  if (variant === "choice-card") return <div class="doc-field-group doc-field-width-xs"><fieldset class="doc-field-set"><legend class="doc-field-legend is-label">Compute Environment</legend><p class="doc-field-description">Select the compute environment for your cluster.</p><div class="doc-field-radio-group" data-radio-group role="radiogroup" aria-label="Compute Environment">{[["kubernetes", "Kubernetes", "Run GPU workloads on a K8s cluster."], ["vm", "Virtual Machine", "Access a cluster to run GPU workloads."]].map((item, index) => <label class="doc-field-choice" data-radio-item data-checked={index === 0 ? "true" : "false"}><div class="doc-field is-horizontal is-content"><div class="doc-field-content"><span class="doc-field-label">{item[1]}</span><p class="doc-field-description">{item[2]}</p></div><DocFieldRadioControl id={`doc-choice-${item[0]}`} label={item[1]} checked={index === 0} /></div></label>)}</div></fieldset></div>
  if (variant === "group") return <div class="doc-field-group doc-field-width-xs"><fieldset class="doc-field-set is-checkbox-set"><p class="doc-field-label">Responses</p><p class="doc-field-description">Get notified when ChatGPT responds to requests that take time, like research or image generation.</p><div class="doc-field-group is-nested"><div class="doc-field is-horizontal is-disabled"><DocFieldCheckboxControl id="doc-push" label="Push notifications" checked disabled /><label class="doc-field-label is-normal" for="doc-push">Push notifications</label></div></div></fieldset><div class="doc-field-separator"></div><fieldset class="doc-field-set is-checkbox-set"><p class="doc-field-label">Tasks</p><p class="doc-field-description">Get notified when tasks you've created have updates. <a href="#">Manage tasks</a></p><div class="doc-field-group is-checkboxes">{["Push notifications", "Email notifications"].map((label, index) => <div class="doc-field is-horizontal" data-doc-field-toggle><DocFieldCheckboxControl id={`doc-task-${index}`} label={label} /><label class="doc-field-label is-normal" for={`doc-task-${index}`}>{label}</label></div>)}</div></fieldset></div>
  if (variant === "responsive") return <div class="doc-field-responsive"><form class="doc-field-form" data-doc-field-form><fieldset class="doc-field-set"><legend class="doc-field-legend">Profile</legend><p class="doc-field-description">Fill in your profile information.</p><div class="doc-field-group"><div class="doc-field is-responsive"><div class="doc-field-content"><label class="doc-field-label" for="doc-profile-name">Name</label><p class="doc-field-description">Provide your full name for identification</p></div><input class="ui-input" id="doc-profile-name" placeholder="Evil Rabbit" required /></div><div class="doc-field is-responsive doc-field-actions"><button class="doc-button is-default" type="submit">Submit</button><button class="doc-button is-outline" type="button">Cancel</button></div></div></fieldset></form></div>
  return <DocFieldPaymentForm />
}

function DocHoverCardItem(props: { trigger: string; triggerHe?: string; triggerEn?: string; side?: string; delay?: number; demo?: boolean; rtl?: boolean }) {
  const rtl = untrack(() => !!props.rtl)
  const side = untrack(() => props.side || "bottom")
  return (
    <span class="doc-hover-card" data-doc-hover-card data-doc-hover-delay={String(props.delay ?? 100)} data-doc-hover-close-delay="100" data-doc-hover-side={side} data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
      <button type="button" class={props.demo ? "doc-button is-link doc-hover-trigger" : "doc-button is-outline doc-hover-trigger"} data-doc-hover-trigger aria-expanded="false">
        {rtl ? <DocFieldText ar={props.trigger} he={props.triggerHe || props.trigger} en={props.triggerEn || props.trigger} /> : props.trigger}
      </button>
      <div class={`doc-hover-content${props.demo ? " is-demo" : rtl ? " is-product" : " is-side"}`} data-doc-hover-content data-doc-hover-side={side} data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"} hidden>
        {props.demo ? <><strong>@nextjs</strong><p>The React Framework – created and maintained by @vercel.</p><small>Joined December 2021</small></> : rtl ? <><strong><DocFieldText ar="سماعات لاسلكية" he="אוזניות אלחוטיות" en="Wireless Headphones" /></strong><p><DocFieldText ar="٩٩.٩٩ $" he="99.99 $" en="$99.99" /></p></> : <><strong>Hover Card</strong><p>This hover card appears on the {side} side of the trigger.</p></>}
      </div>
    </span>
  )
}

function DocHoverCardPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("hover-card-", ""))
  if (variant === "sides") return <div class="doc-hover-row">{["left", "top", "bottom", "right"].map((side) => <DocHoverCardItem trigger={side[0].toUpperCase() + side.slice(1)} side={side} delay={100} />)}</div>
  if (variant === "rtl") {
    const physical = [["يسار", "שמאל", "Left", "left"], ["أعلى", "למעלה", "Top", "top"], ["أسفل", "למטה", "Bottom", "bottom"], ["يمين", "ימין", "Right", "right"]]
    const logical = [["بداية السطر", "תחילת השורה", "Inline Start", "inline-start"], ["نهاية السطر", "סוף השורה", "Inline End", "inline-end"]]
    return <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-hover-rtl-preview" dir="rtl" data-lang="ar"><div class="doc-hover-rtl-grid"><div class="doc-hover-row">{physical.map((item) => <DocHoverCardItem trigger={item[0]} triggerHe={item[1]} triggerEn={item[2]} side={item[3]} delay={10} rtl />)}</div><div class="doc-hover-row">{logical.map((item) => <DocHoverCardItem trigger={item[0]} triggerHe={item[1]} triggerEn={item[2]} side={item[3]} delay={10} rtl />)}</div></div></div></div>
  }
  return <DocHoverCardItem trigger="Hover Here" delay={10} demo />
}

function DocInputField(props: { id: string; label: string; placeholder: string; description?: string; type?: string; disabled?: boolean; invalid?: boolean; required?: boolean; file?: boolean }) {
  return (
    <div class={`doc-field doc-input-width${props.disabled ? " is-disabled" : ""}${props.invalid ? " is-invalid" : ""}`} data-invalid={props.invalid ? "true" : undefined}>
      <label class="doc-field-label" for={props.id}>{props.label}{props.required ? <span class="doc-input-required">*</span> : null}</label>
      <input class={`ui-input${props.file ? " doc-input-file" : ""}`} id={props.id} type={props.file ? "file" : props.type || "text"} placeholder={props.file ? undefined : props.placeholder} disabled={props.disabled} aria-invalid={props.invalid ? "true" : undefined} required={props.required} />
      {props.description ? <p class="doc-field-description">{props.description}</p> : null}
    </div>
  )
}

function DocInputPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("input-", ""))
  if (variant === "basic") return <input class="ui-input doc-input-width" aria-label="Text" placeholder="Enter text" />
  if (variant === "field") return <DocInputField id="doc-input-username" label="Username" placeholder="Enter your username" description="Choose a unique username for your account." />
  if (variant === "fieldgroup") return <div class="doc-field-group doc-input-width"><div class="doc-field"><label class="doc-field-label" for="doc-input-name">Name</label><input class="ui-input" id="doc-input-name" placeholder="Jordan Lee" /></div><div class="doc-field"><label class="doc-field-label" for="doc-input-email">Email</label><input class="ui-input" id="doc-input-email" type="email" placeholder="name@example.com" /><p class="doc-field-description">We'll send updates to this address.</p></div><div class="doc-field is-horizontal doc-field-actions"><button type="reset" class="doc-button is-outline">Reset</button><button type="submit" class="doc-button is-default">Submit</button></div></div>
  if (variant === "disabled") return <DocInputField id="doc-input-disabled" label="Email" type="email" placeholder="Email" description="This field is currently disabled." disabled />
  if (variant === "invalid") return <DocInputField id="doc-input-invalid" label="Invalid Input" placeholder="Error" description="This field contains validation errors." invalid />
  if (variant === "file") return <DocInputField id="doc-input-file" label="Picture" placeholder="" description="Select a picture to upload." file />
  if (variant === "inline") return <div class="doc-field is-horizontal doc-input-width doc-input-inline"><input class="ui-input" type="search" aria-label="Search" placeholder="Search..." /><button type="button" class="doc-button is-default">Search</button></div>
  if (variant === "grid") return <div class="doc-field-group doc-input-grid"><div class="doc-field"><label class="doc-field-label" for="doc-first-name">First Name</label><input class="ui-input" id="doc-first-name" placeholder="Jordan" /></div><div class="doc-field"><label class="doc-field-label" for="doc-last-name">Last Name</label><input class="ui-input" id="doc-last-name" placeholder="Lee" /></div></div>
  if (variant === "required") return <DocInputField id="doc-input-required" label="Required Field" placeholder="This field is required" description="This field must be filled out." required />
  if (variant === "badge") return <div class="doc-field doc-input-width"><label class="doc-field-label doc-input-badge-label" for="doc-input-webhook">Webhook URL <span class="doc-input-badge">Beta</span></label><input class="ui-input" id="doc-input-webhook" type="url" placeholder="https://api.example.com/webhook" /></div>
  if (variant === "input-group") return <div class="doc-field doc-input-width"><label class="doc-field-label" for="doc-input-website">Website URL</label><div class="ui-input-group doc-input-group"><input class="ui-input-group-input" id="doc-input-website" placeholder="example.com" /><span class="ui-input-group-addon">https://</span><span class="ui-input-group-addon ui-input-group-addon-end"><InfoIcon /></span></div></div>
  if (variant === "button-group") return <div class="doc-field doc-input-width"><label class="doc-field-label" for="doc-input-search-group">Search</label><div class="doc-input-button-group" role="group"><input class="ui-input" id="doc-input-search-group" placeholder="Type to search..." /><button type="button" class="doc-button is-outline">Search</button></div></div>
  if (variant === "form") return <form class="doc-field-form doc-input-form" data-doc-field-form><div class="doc-field-group"><div class="doc-field"><label class="doc-field-label" for="doc-form-name">Name</label><input class="ui-input" id="doc-form-name" placeholder="Evil Rabbit" required /></div><div class="doc-field"><label class="doc-field-label" for="doc-form-email">Email</label><input class="ui-input" id="doc-form-email" type="email" placeholder="john@example.com" /><p class="doc-field-description">We'll never share your email with anyone.</p></div><div class="doc-field-grid is-two"><div class="doc-field"><label class="doc-field-label" for="doc-form-phone">Phone</label><input class="ui-input" id="doc-form-phone" type="tel" placeholder="+1 (555) 123-4567" /></div><div class="doc-field"><label class="doc-field-label" for="doc-form-country">Country</label><UiSelectControl triggerId="doc-form-country" ariaLabel="Country" value="us" shellClass="ui-select-shell-full" options={[{ value: "us", label: "United States" }, { value: "uk", label: "United Kingdom" }, { value: "ca", label: "Canada" }]} /></div></div><div class="doc-field"><label class="doc-field-label" for="doc-form-address">Address</label><input class="ui-input" id="doc-form-address" placeholder="123 Main St" /></div><div class="doc-field is-horizontal doc-field-actions"><button type="button" class="doc-button is-outline">Cancel</button><button type="submit" class="doc-button is-default">Submit</button></div></div></form>
  if (variant === "rtl") return <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-input-rtl-preview" dir="rtl" data-lang="ar"><div class="doc-field doc-input-width" data-doc-rtl-direction dir="rtl"><label class="doc-field-label" for="doc-input-rtl"><DocFieldText ar="مفتاح API" he="מפתח API" en="API Key" /></label><input class="ui-input" id="doc-input-rtl" type="password" placeholder="sk-..." data-placeholder-ar="sk-..." data-placeholder-he="sk-..." data-placeholder-en="sk-..." dir="rtl" data-doc-rtl-direction /><p class="doc-field-description"><DocFieldText ar="مفتاح API الخاص بك مشفر ومخزن بأمان." he="מפתח ה-API שלך מוצפן ונשמר בצורה מאובטחת." en="Your API key is encrypted and stored securely." /></p></div></div></div>
  return <DocInputField id="doc-input-api-key" label="API Key" type="password" placeholder="sk-..." description="Your API key is encrypted and stored securely." />
}

function DocInputGroupPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("input-group-", ""))
  const group = (children: any, options: { className?: string; block?: boolean; round?: boolean; disabled?: boolean; dir?: "ltr" | "rtl"; rtl?: boolean } = {}) => (
    <div data-slot="input-group" data-doc-rtl-direction={options.rtl ? "true" : undefined} class={`ui-input-group doc-input-group-shell${options.block ? " is-block" : ""}${options.round ? " is-round" : ""}${options.disabled ? " is-disabled" : ""}${options.className ? ` ${options.className}` : ""}`} dir={options.dir}>{children}</div>
  )
  const input = (placeholder = "", options: { id?: string; type?: string; disabled?: boolean; dir?: "ltr" | "rtl"; rtl?: boolean; he?: string; en?: string } = {}) => (
    <input data-slot="input-group-control" data-doc-rtl-direction={options.rtl ? "true" : undefined} data-doc-rtl-placeholder={options.rtl ? "true" : undefined} data-placeholder-ar={options.rtl ? placeholder : undefined} data-placeholder-he={options.he} data-placeholder-en={options.en} class="ui-input-group-input" id={options.id} placeholder={placeholder} type={options.type || "text"} disabled={options.disabled} dir={options.dir} />
  )
  const textarea = (placeholder: string, options: { id?: string; className?: string; dir?: "ltr" | "rtl"; rtl?: boolean; he?: string; en?: string } = {}) => (
    <textarea data-slot="input-group-control" data-doc-rtl-direction={options.rtl ? "true" : undefined} data-doc-rtl-placeholder={options.rtl ? "true" : undefined} data-placeholder-ar={options.rtl ? placeholder : undefined} data-placeholder-he={options.he} data-placeholder-en={options.en} class={`ui-input-group-textarea${options.className ? ` ${options.className}` : ""}`} id={options.id} placeholder={placeholder} dir={options.dir}></textarea>
  )
  const addon = (children: any, options: { end?: boolean; block?: "start" | "end"; className?: string } = {}) => (
    <span data-slot="input-group-addon" data-align={options.block ? `block-${options.block}` : options.end ? "inline-end" : "inline-start"} class={`ui-input-group-addon${options.end ? " ui-input-group-addon-end" : ""}${options.block ? ` ui-input-group-addon-block is-${options.block}` : ""}${options.className ? ` ${options.className}` : ""}`}>{children}</span>
  )
  const button = (children: any, options: { label?: string; primary?: boolean; secondary?: boolean; icon?: boolean; className?: string; menu?: boolean; toggle?: string; popover?: boolean } = {}) => (
    <button type="button" aria-label={options.label} data-menu-trigger={options.menu ? "" : undefined} data-doc-input-group-toggle={options.toggle} data-doc-input-group-popover-trigger={options.popover ? "" : undefined} aria-haspopup={options.popover ? "dialog" : undefined} aria-expanded={options.menu || options.popover ? "false" : undefined} class={`ui-input-group-button${options.icon ? " ui-input-group-button-icon" : ""}${options.primary ? " ui-input-group-button-primary" : ""}${options.secondary ? " ui-input-group-button-secondary" : ""}${options.className ? ` ${options.className}` : ""}`}>{children}</button>
  )
  const icon = (kind: "eye" | "mail" | "card" | "star" | "file-code" | "javascript" | "refresh" | "copy" | "copy-lucide" | "loader" | "enter") => {
    const path = kind === "eye" ? <><path d="M2 12s3.5-6 10-6s10 6 10 6s-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/><path d="m3 3 18 18"/></> : kind === "mail" ? <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></> : kind === "card" ? <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></> : kind === "star" ? <path d="M12 17.75 5.828 20.995l1.179-6.873-5-4.867 6.9-1L11.993 2l3.086 6.253 6.9 1-5 4.867 1.179 6.873z"/> : kind === "file-code" ? <><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></> : kind === "javascript" ? <><path d="M20 4 18 18.5 12 20.5 6 18.5 4 4z"/><path d="M7.5 8h3v8l-2-1"/><path d="M16.5 8H14a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1.423a.5.5 0 0 1 .495.57L15.5 15.5l-2 .5"/></> : kind === "refresh" ? <><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></> : kind === "copy-lucide" ? <><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></> : kind === "copy" ? <><path d="M7 7m0 2.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z"/><path d="M4.012 16.737A2.005 2.005 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></> : kind === "enter" ? <path d="M18 6v6a3 3 0 0 1-3 3H5l4-4m0 8-4-4"/> : <path d="M20 12a8 8 0 1 1-2.34-5.66"/>
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{path}</svg>
  }
  const menu = (label: string, wide = false) => (
    <span class="ui-menu doc-input-group-menu" data-menu>{button(wide ? <>{label}{renderDocButtonIcon("chevron-down")}</> : renderDocButtonIcon("more"), { label, icon: !wide, menu: true })}<div class="ui-menu-panel" data-menu-panel data-menu-side="bottom" data-menu-align="end" role="menu" hidden>{(wide ? ["Documentation", "Blog Posts", "Changelog"] : ["Settings", "Copy path", "Open location"]).map((item) => <button class="ui-menu-item" type="button" role="menuitem" data-menu-item>{item}</button>)}</div></span>
  )
  const inlineGroup = (placeholder: string, start: any = null, end: any = null) => group(<>{input(placeholder)}{start !== null ? addon(start) : null}{end !== null ? addon(end, { end: true }) : null}</>)

  if (variant === "demo") return <div class="doc-input-group-demo">{inlineGroup("Search...", <SearchIcon />, "12 results")}</div>
  if (variant === "inline-start" || variant === "inline-end") return <div class="doc-field doc-input-group-field"><label class="doc-field-label" for={`doc-${variant}`}>Input</label>{group(<>{input(variant === "inline-start" ? "Search..." : "Enter password", { id: `doc-${variant}`, type: variant === "inline-end" ? "password" : "text" })}{addon(variant === "inline-start" ? <SearchIcon /> : icon("eye"), { end: variant === "inline-end" })}</>)}<p class="doc-field-description">Icon positioned at the {variant === "inline-start" ? "start" : "end"}.</p></div>
  if (variant === "block-start") return <div class="doc-field-group doc-input-group-align-stack"><div class="doc-field"><label class="doc-field-label" for="doc-block-start-input">Input</label>{group(<>{input("Enter your name", { id: "doc-block-start-input" })}{addon("Full Name", { block: "start" })}</>, { block: true })}<p class="doc-field-description">Header positioned above the input.</p></div><div class="doc-field"><label class="doc-field-label" for="doc-block-start-textarea">Textarea</label>{group(<>{textarea("console.log('Hello, world!');", { id: "doc-block-start-textarea", className: "is-mono" })}{addon(<>{icon("file-code")}<span class="doc-input-group-mono">script.js</span>{button(icon("copy-lucide"), { label: "Copy", icon: true, className: "push-end" })}</>, { block: "start" })}</>, { block: true })}<p class="doc-field-description">Header positioned above the textarea.</p></div></div>
  if (variant === "block-end") return <div class="doc-field-group doc-input-group-align-stack"><div class="doc-field"><label class="doc-field-label" for="doc-block-end-input">Input</label>{group(<>{input("Enter amount", { id: "doc-block-end-input" })}{addon("USD", { block: "end" })}</>, { block: true })}<p class="doc-field-description">Footer positioned below the input.</p></div><div class="doc-field"><label class="doc-field-label" for="doc-block-end-textarea">Textarea</label>{group(<>{textarea("Write a comment...", { id: "doc-block-end-textarea" })}{addon(<><span>0/280</span>{button("Post", { primary: true, className: "push-end" })}</>, { block: "end" })}</>, { block: true })}<p class="doc-field-description">Footer positioned below the textarea.</p></div></div>
  if (variant === "icon") return <div class="doc-input-group-stack">{inlineGroup("Search...", <SearchIcon />)}{inlineGroup("Enter your email", icon("mail"))}{inlineGroup("Card number", icon("card"), <CheckIcon />)}{inlineGroup("Card number", null, <>{icon("star")}<InfoIcon /></>)}</div>
  if (variant === "text") return <div class="doc-input-group-stack">{inlineGroup("0.00", "$", "USD")}{inlineGroup("example.com", "https://", ".com")}{inlineGroup("Enter your username", null, "@company.com")}{group(<>{textarea("Enter your message")}{addon(<small>120 characters left</small>, { block: "end" })}</>, { block: true })}</div>
  if (variant === "button") return <div class="doc-input-group-stack">{group(<>{input("https://x.com/shadcn")}{addon(button(<><span class="doc-input-group-copy-idle">{icon("copy")}</span><span class="doc-input-group-copy-done"><CheckIcon /></span></>, { label: "Copy", icon: true, toggle: "copy" }), { end: true })}</>)}{group(<>{addon(button(<InfoIcon />, { label: "Info", icon: true, secondary: true, popover: true }))}{addon("https://", { className: "doc-input-group-prefix" })}{input()}{addon(button(icon("star"), { label: "Favorite", icon: true, toggle: "favorite" }), { end: true })}<div class="doc-input-group-popover" role="dialog" hidden><strong>Your connection is not secure.</strong><p>You should not enter any sensitive information on this site.</p></div></>, { round: true })}{group(<>{input("Type to search...")}{addon(button("Search", { secondary: true }), { end: true })}</>)}</div>
  if (variant === "kbd") return group(<>{input("Search...")}{addon(<SearchIcon />)}{addon(<kbd class="doc-input-group-kbd">⌘K</kbd>, { end: true })}</>, { className: "doc-input-group-wide" })
  if (variant === "dropdown") return <div class="doc-input-group-stack is-tight">{group(<>{input("Enter file name")}{addon(menu("More"), { end: true })}</>)}{group(<>{input("Enter search query")}{addon(menu("Search In...", true), { end: true })}</>, { round: true })}</div>
  if (variant === "spinner") {
    const items: Array<[string, boolean, string]> = [["Searching...", false, ""], ["Processing...", true, ""], ["Saving changes...", false, "Saving..."], ["Refreshing data...", true, "Please wait..."]]
    return <div class="doc-input-group-stack is-tight">{items.map((item, index) => group(<>{input(item[0], { disabled: true })}{addon(<>{item[2] && index !== 3 ? <span>{item[2]}</span> : null}{index === 3 ? icon("loader") : <UiSpinner />}</>, { end: !item[1] })}{index === 3 ? addon(<span>{item[2]}</span>, { end: true }) : null}</>, { disabled: true }))}</div>
  }
  if (variant === "textarea") return <div class="doc-input-group-textarea-demo">{group(<>{textarea("console.log('Hello, world!');", { className: "is-code" })}{addon(<><span>Line 1, Column 1</span>{button(<>Run {icon("enter")}</>, { primary: true, className: "push-end" })}</>, { block: "end", className: "has-border" })}{addon(<>{icon("javascript")}<span class="doc-input-group-mono">script.js</span>{button(icon("refresh"), { label: "Refresh", icon: true, className: "push-end" })}{button(icon("copy"), { label: "Copy", icon: true })}</>, { block: "start", className: "has-border" })}</>, { block: true })}</div>
  if (variant === "custom") return <div class="doc-input-group-custom">{group(<>{textarea("Autoresize textarea...")}{addon(button("Submit", { primary: true, className: "push-end" }), { block: "end" })}</>, { block: true })}</div>
  if (variant === "rtl") return <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-input-group-rtl-preview" dir="rtl" data-lang="ar"><div class="doc-input-group-stack">{group(<>{input("بحث...", { dir: "rtl", rtl: true, he: "חפש...", en: "Search..." })}{addon(<SearchIcon />)}{addon(<DocFieldText ar="١٢ نتيجة" he="12 תוצאות" en="12 results" />, { end: true })}</>, { className: "is-xs", dir: "rtl", rtl: true })}{group(<>{input("جاري البحث...", { dir: "rtl", rtl: true, he: "מחפש...", en: "Searching..." })}{addon(<UiSpinner />, { end: true })}</>, { dir: "rtl", rtl: true })}{group(<>{input("جاري حفظ التغييرات...", { dir: "rtl", rtl: true, he: "שומר שינויים...", en: "Saving changes..." })}{addon(<><DocFieldText ar="جاري الحفظ..." he="שומר..." en="Saving..." /><UiSpinner /></>, { end: true })}</>, { dir: "rtl", rtl: true })}<div class="doc-field"><label class="doc-field-label" for="doc-input-group-rtl-text"><DocFieldText ar="منطقة النص" he="אזור טקסט" en="Textarea" /></label>{group(<>{textarea("اكتب تعليقًا...", { id: "doc-input-group-rtl-text", dir: "rtl", rtl: true, he: "כתוב תגובה...", en: "Write a comment..." })}{addon(<><DocFieldText ar="٠/٢٨٠" he="0/280" en="0/280" />{button(<DocFieldText ar="نشر" he="פרסם" en="Post" />, { primary: true, className: "push-end" })}</>, { block: "end" })}</>, { block: true, dir: "rtl", rtl: true })}<p class="doc-field-description"><DocFieldText ar="تذييل موضع أسفل منطقة النص." he="כותרת תחתונה ממוקמת מתחת לאזור הטקסט." en="Footer positioned below the textarea." /></p></div></div></div></div>
  return <div class="doc-input-group-demo">{inlineGroup("Search...", <SearchIcon />)}</div>
}

function DocInputOtpPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("input-otp-", ""))
  const separator = () => <span class="doc-input-otp-separator" role="separator" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14" /></svg></span>
  const slots = (value: string, start: number, count: number, options: { invalid?: boolean; large?: boolean } = {}) => (
    <div data-slot="input-otp-group" class={`doc-input-otp-group${options.large ? " is-large" : ""}`}>{Array.from({ length: count }, (_, offset) => <div data-slot="input-otp-slot" data-doc-input-otp-slot={String(start + offset)} aria-invalid={options.invalid ? "true" : undefined} class={`doc-input-otp-slot${options.invalid ? " is-invalid" : ""}`}>{value[start + offset] || ""}</div>)}</div>
  )
  const otp = (value: string, groups: Array<{ start: number; count: number }>, options: { className?: string; max?: number; disabled?: boolean; invalid?: boolean; large?: boolean; pattern?: "digits" | "alphanumeric"; id?: string; label?: string; dir?: "ltr" | "rtl"; rtl?: boolean; required?: boolean } = {}) => {
    const max = options.max || groups.reduce((total, group) => total + group.count, 0)
    return <div class={`doc-input-otp-root${options.className ? ` ${options.className}` : ""}${options.disabled ? " is-disabled" : ""}`} data-doc-input-otp data-doc-input-otp-max={String(max)} data-doc-input-otp-pattern={options.pattern} data-doc-rtl-direction={options.rtl ? "true" : undefined} dir={options.dir}><input data-slot="input-otp" data-doc-input-otp-control data-doc-rtl-direction={options.rtl ? "true" : undefined} id={options.id} aria-label={options.label || "One-time password"} autoComplete="one-time-code" inputMode={options.pattern === "alphanumeric" ? "text" : "numeric"} maxLength={max} value={value} disabled={options.disabled} required={options.required} dir={options.dir} />{groups.map((group, index) => <>{slots(value, group.start, group.count, { invalid: options.invalid, large: options.large })}{index < groups.length - 1 ? separator() : null}</>)}</div>
  }
  if (variant === "demo") return otp("123456", [{ start: 0, count: 6 }], { className: "is-standard" })
  if (variant === "pattern") return <div class="doc-field doc-input-otp-pattern"><label class="doc-field-label" for="doc-input-otp-pattern">Digits Only</label>{otp("", [{ start: 0, count: 6 }], { className: "is-standard", pattern: "digits", id: "doc-input-otp-pattern", label: "Digits Only" })}</div>
  if (variant === "separator") return otp("", [{ start: 0, count: 2 }, { start: 2, count: 2 }, { start: 4, count: 2 }], { className: "is-separated" })
  if (variant === "disabled") return otp("123456", [{ start: 0, count: 3 }, { start: 3, count: 3 }], { className: "is-split", disabled: true })
  if (variant === "controlled") return <div class="doc-input-otp-controlled">{otp("", [{ start: 0, count: 6 }], { className: "is-controlled" })}<p data-doc-input-otp-output>Enter your one-time password.</p></div>
  if (variant === "invalid") return otp("000000", [{ start: 0, count: 2 }, { start: 2, count: 2 }, { start: 4, count: 2 }], { className: "is-separated", invalid: true })
  if (variant === "four-digits") return otp("", [{ start: 0, count: 4 }], { className: "is-four", max: 4, pattern: "digits" })
  if (variant === "alphanumeric") return otp("", [{ start: 0, count: 3 }, { start: 3, count: 3 }], { className: "is-split", pattern: "alphanumeric" })
  if (variant === "form") return <form class="doc-input-otp-card" data-doc-input-otp-form><div class="doc-input-otp-card-header"><h3>Verify your login</h3><p>Enter the verification code we sent to your email address: <strong>m@example.com</strong>.</p></div><div class="doc-input-otp-card-content"><div class="doc-field"><div class="doc-input-otp-label-row"><label class="doc-field-label" for="doc-input-otp-form">Verification code</label><button type="button" class="doc-button is-outline is-xs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>Resend Code</button></div>{otp("", [{ start: 0, count: 3 }, { start: 3, count: 3 }], { className: "is-form", large: true, id: "doc-input-otp-form", label: "Verification code", required: true })}<p class="doc-field-description"><a href="#">I no longer have access to this email address.</a></p></div></div><div class="doc-input-otp-card-footer"><button type="submit" class="doc-button is-default">Verify</button><p>Having trouble signing in? <a href="#">Contact support</a></p></div></form>
  if (variant === "rtl") return <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-input-otp-rtl-preview" dir="rtl" data-lang="ar"><div class="doc-field doc-input-otp-rtl-field" data-doc-rtl-direction dir="rtl"><label class="doc-field-label" for="doc-input-otp-rtl"><DocFieldText ar="رمز التحقق" he="קוד אימות" en="Verification code" /></label>{otp("123456", [{ start: 0, count: 6 }], { className: "is-rtl", id: "doc-input-otp-rtl", label: "Verification code", dir: "rtl", rtl: true })}</div></div></div>
  return otp("123456", [{ start: 0, count: 6 }], { className: "is-standard" })
}

function DocItemPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("item-", ""))
  const icon = (kind: "inbox" | "shield" | "check" | "chevron" | "down" | "external" | "plus") => {
    const path = kind === "inbox" ? <><path d="M4 4h16v13H4z"/><path d="M4 13h4l2 3h4l2-3h4"/></> : kind === "shield" ? <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v4M12 16h.01"/></> : kind === "check" ? <><path d="M12 3 14 5l3-.2.8 2.9 2.6 1.5-1 2.8 1 2.8-2.6 1.5-.8 2.9-3-.2-2 2-2-2-3 .2-.8-2.9-2.6-1.5 1-2.8-1-2.8 2.6-1.5L7 4.8l3 .2Z"/><path d="m9 12 2 2 4-4"/></> : kind === "chevron" ? <path d="m9 18 6-6-6-6"/> : kind === "down" ? <path d="m6 9 6 6 6-6"/> : kind === "external" ? <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></> : <><path d="M12 5v14M5 12h14"/></>
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{path}</svg>
  }
  const content = (title: any, description?: any, options: { fixed?: boolean; compact?: boolean } = {}) => <div data-slot="item-content" class={`doc-item-content${options.fixed ? " is-fixed" : ""}${options.compact ? " is-compact" : ""}`}><div data-slot="item-title" class="doc-item-title">{title}</div>{description !== undefined ? <p data-slot="item-description" class="doc-item-description">{description}</p> : null}</div>
  const media = (children: any, className = "") => <div data-slot="item-media" class={`doc-item-media${className ? ` ${className}` : ""}`}>{children}</div>
  const actions = (children: any) => <div data-slot="item-actions" class="doc-item-actions">{children}</div>
  const item = (children: any, options: { variant?: "default" | "outline" | "muted"; size?: "default" | "sm" | "xs"; href?: string; target?: string; className?: string; dir?: "ltr" | "rtl"; rtl?: boolean } = {}) => {
    const className = `doc-item is-${options.variant || "default"} is-${options.size || "default"}${options.className ? ` ${options.className}` : ""}`
    return options.href ? <a data-slot="item" class={className} href={options.href} target={options.target} rel={options.target ? "noopener noreferrer" : undefined} data-doc-rtl-direction={options.rtl ? "true" : undefined} dir={options.dir}>{children}</a> : <div data-slot="item" class={className} data-doc-rtl-direction={options.rtl ? "true" : undefined} dir={options.dir}>{children}</div>
  }
  const inboxItem = (title: string, description: string, options: { variant?: "default" | "outline" | "muted"; size?: "default" | "sm" | "xs" } = {}) => item(<>{media(icon("inbox"), "is-icon")}{content(title, description, { compact: options.size === "xs" })}</>, options)
  if (variant === "demo") return <div class="doc-item-stack is-md">{item(<>{content("Basic Item", "A simple item with title and description.")}{actions(<button type="button" class="doc-button is-outline is-sm">Action</button>)}</>, { variant: "outline" })}{item(<>{media(icon("check"), "is-verified")}{content("Your profile has been verified.")}{actions(icon("chevron"))}</>, { variant: "outline", size: "sm", href: "#" })}</div>
  if (variant === "variant") return <div class="doc-item-stack is-md">{inboxItem("Default Variant", "Transparent background with no border.")}{inboxItem("Outline Variant", "Outlined style with a visible border.", { variant: "outline" })}{inboxItem("Muted Variant", "Muted background for secondary content.", { variant: "muted" })}</div>
  if (variant === "size") return <div class="doc-item-stack is-md">{inboxItem("Default Size", "The standard size for most use cases.", { variant: "outline" })}{inboxItem("Small Size", "A compact size for dense layouts.", { variant: "outline", size: "sm" })}{inboxItem("Extra Small Size", "The most compact size available.", { variant: "outline", size: "xs" })}</div>
  if (variant === "icon") return <div class="doc-item-stack is-lg">{item(<>{media(icon("shield"), "is-icon")}{content("Security Alert", "New login detected from unknown device.")}{actions(<button type="button" class="doc-button is-outline is-sm">Review</button>)}</>, { variant: "outline" })}</div>
  if (variant === "avatar") return <div class="doc-item-stack is-lg">{item(<>{media(<img class="doc-item-avatar is-large" src="https://github.com/evilrabbit.png" alt="Evil Rabbit" />)}{content("Evil Rabbit", "Last seen 5 months ago")}{actions(<button type="button" class="doc-button is-outline is-icon-sm is-rounded" aria-label="Invite">{icon("plus")}</button>)}</>, { variant: "outline" })}{item(<>{media(<div class="doc-item-avatar-group"><img src="https://github.com/shadcn.png" alt="shadcn"/><img src="https://github.com/maxleiter.png" alt="maxleiter"/><img src="https://github.com/evilrabbit.png" alt="evilrabbit"/></div>)}{content("No Team Members", "Invite your team to collaborate on this project.")}{actions(<button type="button" class="doc-button is-outline is-sm">Invite</button>)}</>, { variant: "outline" })}</div>
  if (variant === "image") {
    const songs = [["Midnight City Lights", "Electric Nights", "Neon Dreams", "3:45"], ["Coffee Shop Conversations", "Urban Stories", "The Morning Brew", "4:05"], ["Digital Rain", "Binary Beats", "Cyber Symphony", "3:30"]]
    return <div class="doc-item-stack is-md is-image-list">{songs.map((song) => item(<>{media(<img class="doc-item-song-image" src={`https://avatar.vercel.sh/${encodeURIComponent(song[0])}`} alt={song[0]} />)}{content(<>{song[0]} - <span>{song[1]}</span></>, song[2])}{content("", song[3], { fixed: true })}</>, { variant: "outline", href: "#" }))}</div>
  }
  if (variant === "group") {
    const people = [["shadcn", "shadcn@vercel.com", "https://github.com/shadcn.png"], ["maxleiter", "maxleiter@vercel.com", "https://github.com/maxleiter.png"], ["evilrabbit", "evilrabbit@vercel.com", "https://github.com/evilrabbit.png"]]
    return <div class="doc-item-stack is-sm is-group-list">{people.map((person) => item(<>{media(<img class="doc-item-avatar" src={person[2]} alt={person[0]} />)}{content(person[0], person[1])}{actions(<button type="button" class="doc-button is-ghost is-icon is-rounded" aria-label={`Add ${person[0]}`}>{icon("plus")}</button>)}</>, { variant: "outline" }))}</div>
  }
  if (variant === "header") {
    const models = [["v0-1.5-sm", "Everyday tasks and UI generation.", "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop"], ["v0-1.5-lg", "Advanced thinking or reasoning.", "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop"], ["v0-2.0-mini", "Open Source model for everyone.", "https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop"]]
    return <div class="doc-item-header-grid">{models.map((model) => item(<><div data-slot="item-header" class="doc-item-header"><img src={model[2]} alt={model[0]} /></div>{content(model[0], model[1])}</>, { variant: "outline", className: "is-header" }))}</div>
  }
  if (variant === "link") return <div class="doc-item-stack is-md is-link-list">{item(<>{content("Visit our documentation", "Learn how to get started with our components.")}{actions(icon("chevron"))}</>, { href: "#" })}{item(<>{content("External resource", "Opens in a new tab with security attributes.")}{actions(icon("external"))}</>, { variant: "outline", href: "#", target: "_blank" })}</div>
  if (variant === "dropdown") {
    const people = [["shadcn", "shadcn@vercel.com", "https://github.com/shadcn.png"], ["maxleiter", "maxleiter@vercel.com", "https://github.com/maxleiter.png"], ["evilrabbit", "evilrabbit@vercel.com", "https://github.com/evilrabbit.png"]]
    return <span class="ui-menu doc-item-dropdown" data-menu><button type="button" class="doc-button is-outline" data-menu-trigger aria-haspopup="menu" aria-expanded="false">Select {icon("down")}</button><div class="ui-menu-panel doc-item-dropdown-panel" data-menu-panel data-menu-side="bottom" data-menu-align="end" role="menu" hidden>{people.map((person) => <button type="button" class="ui-menu-item doc-item-dropdown-option" role="menuitem" data-menu-item>{item(<>{media(<img class="doc-item-avatar is-dropdown" src={person[2]} alt={person[0]} />)}{content(person[0], person[1], { compact: true })}</>, { size: "xs" })}</button>)}</div></span>
  }
  if (variant === "rtl") return <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-item-rtl-preview" dir="rtl" data-lang="ar"><div class="doc-item-stack is-md" data-doc-rtl-direction dir="rtl">{item(<>{content(<DocFieldText ar="عنصر أساسي" he="פריט בסיסי" en="Basic Item" />, <DocFieldText ar="عنصر بسيط يحتوي على عنوان ووصف." he="פריט פשוט עם כותרת ותיאור." en="A simple item with title and description." />)}{actions(<button type="button" class="doc-button is-outline is-sm"><DocFieldText ar="إجراء" he="פעולה" en="Action" /></button>)}</>, { variant: "outline", dir: "rtl", rtl: true })}{item(<>{media(icon("check"), "is-verified")}{content(<DocFieldText ar="تم التحقق من ملفك الشخصي." he="הפרופיל שלך אומת." en="Your profile has been verified." />)}{actions(icon("chevron"))}</>, { variant: "outline", size: "sm", href: "#", dir: "rtl", rtl: true })}</div></div></div>
  return <div class="doc-item-stack is-md">{item(content("Basic Item", "A simple item with title and description."), { variant: "outline" })}</div>
}

function DocKbdPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("kbd-", ""))
  const key = (value: string, className = "") => (
    <kbd data-slot="kbd" class={`doc-kbd${className ? ` ${className}` : ""}`}>{value}</kbd>
  )
  const group = (children: any) => <kbd data-slot="kbd-group" class="doc-kbd-group">{children}</kbd>
  const demo = (rtl = false) => (
    <div class="doc-kbd-stack" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
      {group(<>{key("⌘")}{key("⇧", "is-shift")}{key("⌥")}{key("⌃")}</>)}
      {group(<>{key("Ctrl")}<span>+</span>{key("B")}</>)}
    </div>
  )

  if (variant === "demo") return demo()
  if (variant === "group") return <div class="doc-kbd-stack"><p class="doc-kbd-copy">Use {group(<>{key("Ctrl + B")}{key("Ctrl + K")}</>)} to open the command palette</p></div>
  if (variant === "button") return <button type="button" class="doc-button is-outline doc-kbd-button">Accept {key("⏎", "is-inline-end is-enter")}</button>
  if (variant === "tooltip") return <div class="doc-kbd-tooltip-buttons doc-button-group"><button type="button" class="doc-button is-outline" data-tooltip="Save Changes" data-tooltip-kbd="S">Save</button><button type="button" class="doc-button is-outline" data-tooltip="Print Document" data-tooltip-kbd="Ctrl,P">Print</button></div>
  if (variant === "input-group") return <div data-slot="input-group" class="ui-input-group doc-input-group-shell doc-kbd-input-group"><input data-slot="input-group-control" class="ui-input-group-input" aria-label="Search" placeholder="Search..." /><span data-slot="input-group-addon" class="ui-input-group-addon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span><span data-slot="input-group-addon" data-align="inline-end" class="ui-input-group-addon ui-input-group-addon-end">{key("⌘")}{key("K")}</span></div>
  if (variant === "rtl") return <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-kbd-rtl-preview" dir="rtl" data-lang="ar">{demo(true)}</div></div>
  return demo()
}

function DocLabelPreview(props: { name: string }) {
  const rtl = untrack(() => props.name === "label-rtl")
  const id = rtl ? "label-terms-rtl" : "label-terms"
  const control = (
    <div class="doc-label-demo" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
      <button id={id} type="button" role="checkbox" class="doc-checkbox-control" aria-checked="false" data-state="unchecked" data-doc-checkbox><span aria-hidden="true">✓</span></button>
      <label class="doc-label-text" for={id} data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
        {rtl ? <DocFieldText ar="قبول الشروط والأحكام" he="קבל תנאים והגבלות" en="Accept terms and conditions" /> : "Accept terms and conditions"}
      </label>
    </div>
  )
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-label-rtl-preview" dir="rtl" data-lang="ar">{control}</div></div> : control
}

type DocMenubarMenu = {
  label: string
  labelHe?: string
  labelEn?: string
  panelClass?: string
  entries: DocDropdownEntry[]
}

function DocMenubarPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "menubar-rtl"
  const sep = (): DocDropdownEntry => ({ type: "separator" })
  const fileEntries: DocDropdownEntry[] = [
    { label: rtl ? "علامة تبويب جديدة" : "New Tab", labelHe: rtl ? "כרטיסייה חדשה" : undefined, labelEn: rtl ? "New Tab" : undefined, shortcut: "⌘T" },
    { label: rtl ? "نافذة جديدة" : "New Window", labelHe: rtl ? "חלון חדש" : undefined, labelEn: rtl ? "New Window" : undefined, shortcut: "⌘N" },
    { label: rtl ? "نافذة التصفح المتخفي الجديدة" : "New Incognito Window", labelHe: rtl ? "חלון גלישה בסתר חדש" : undefined, labelEn: rtl ? "New Incognito Window" : undefined, disabled: true },
    sep(),
    { type: "submenu", label: rtl ? "مشاركة" : "Share", labelHe: rtl ? "שתף" : undefined, labelEn: rtl ? "Share" : undefined, children: [
      { label: rtl ? "رابط البريد الإلكتروني" : "Email link", labelHe: rtl ? "קישור אימייל" : undefined, labelEn: rtl ? "Email link" : undefined },
      { label: rtl ? "الرسائل" : "Messages", labelHe: rtl ? "הודעות" : undefined, labelEn: rtl ? "Messages" : undefined },
      { label: rtl ? "الملاحظات" : "Notes", labelHe: rtl ? "הערות" : undefined, labelEn: rtl ? "Notes" : undefined },
    ] },
    sep(),
    { label: rtl ? "طباعة..." : "Print...", labelHe: rtl ? "הדפס..." : undefined, labelEn: rtl ? "Print..." : undefined, shortcut: "⌘P" },
  ]
  const editEntries: DocDropdownEntry[] = [
    { label: rtl ? "تراجع" : "Undo", labelHe: rtl ? "בטל" : undefined, labelEn: rtl ? "Undo" : undefined, shortcut: "⌘Z" },
    { label: rtl ? "إعادة" : "Redo", labelHe: rtl ? "בצע שוב" : undefined, labelEn: rtl ? "Redo" : undefined, shortcut: "⇧⌘Z" },
    sep(),
    { type: "submenu", label: rtl ? "بحث" : "Find", labelHe: rtl ? "מצא" : undefined, labelEn: rtl ? "Find" : undefined, children: [
      { label: rtl ? "البحث على الويب" : "Search the web", labelHe: rtl ? "חפש באינטרנט" : undefined, labelEn: rtl ? "Search the web" : undefined },
      sep(),
      { label: rtl ? "بحث..." : "Find...", labelHe: rtl ? "מצא..." : undefined, labelEn: rtl ? "Find..." : undefined },
      { label: rtl ? "البحث التالي" : "Find Next", labelHe: rtl ? "מצא הבא" : undefined, labelEn: rtl ? "Find Next" : undefined },
      { label: rtl ? "البحث السابق" : "Find Previous", labelHe: rtl ? "מצא הקודם" : undefined, labelEn: rtl ? "Find Previous" : undefined },
    ] },
    sep(),
    { label: rtl ? "قص" : "Cut", labelHe: rtl ? "גזור" : undefined, labelEn: rtl ? "Cut" : undefined },
    { label: rtl ? "نسخ" : "Copy", labelHe: rtl ? "העתק" : undefined, labelEn: rtl ? "Copy" : undefined },
    { label: rtl ? "لصق" : "Paste", labelHe: rtl ? "הדבק" : undefined, labelEn: rtl ? "Paste" : undefined },
  ]
  const viewEntries: DocDropdownEntry[] = [
    { type: "checkbox", label: rtl ? "شريط الإشارات المرجعية" : "Bookmarks Bar", labelHe: rtl ? "סרגל סימניות" : undefined, labelEn: rtl ? "Bookmarks Bar" : undefined },
    { type: "checkbox", label: rtl ? "عناوين URL الكاملة" : "Full URLs", labelHe: rtl ? "כתובות URL מלאות" : undefined, labelEn: rtl ? "Full URLs" : undefined, selected: true },
    sep(),
    { label: rtl ? "إعادة تحميل" : "Reload", labelHe: rtl ? "רענן" : undefined, labelEn: rtl ? "Reload" : undefined, shortcut: "⌘R" },
    { label: rtl ? "إعادة تحميل قسري" : "Force Reload", labelHe: rtl ? "רענן בכוח" : undefined, labelEn: rtl ? "Force Reload" : undefined, shortcut: "⇧⌘R", disabled: true },
    sep(),
    { label: rtl ? "تبديل وضع ملء الشاشة" : "Toggle Fullscreen", labelHe: rtl ? "החלף מסך מלא" : undefined, labelEn: rtl ? "Toggle Fullscreen" : undefined },
    sep(),
    { label: rtl ? "إخفاء الشريط الجانبي" : "Hide Sidebar", labelHe: rtl ? "הסתר סרגל צד" : undefined, labelEn: rtl ? "Hide Sidebar" : undefined },
  ]
  const profileEntries: DocDropdownEntry[] = [
    { type: "radio", label: "Andy", value: "andy" },
    { type: "radio", label: "Benoit", value: "benoit", selected: true },
    { type: "radio", label: "Luis", value: "luis" },
    sep(),
    { label: rtl ? "تعديل..." : "Edit...", labelHe: rtl ? "ערוך..." : undefined, labelEn: rtl ? "Edit..." : undefined },
    sep(),
    { label: rtl ? "إضافة ملف شخصي..." : "Add Profile...", labelHe: rtl ? "הוסף פרופיל..." : undefined, labelEn: rtl ? "Add Profile..." : undefined },
  ]
  const iconEntries: DocDropdownEntry[] = [
    { label: "New File", icon: "file", shortcut: "⌘N" },
    { label: "Open Folder", icon: "folder" },
    sep(),
    { label: "Save", icon: "save", shortcut: "⌘S" },
  ]
  const moreEntries: DocDropdownEntry[] = [
    { label: "Settings", icon: "settings" },
    { label: "Help", icon: "help" },
    sep(),
    { label: "Delete", icon: "trash", destructive: true },
  ]
  let menus: DocMenubarMenu[]
  if (name === "menubar-checkbox") menus = [
    { label: "View", panelClass: "is-wide", entries: [{ type: "checkbox", label: "Always Show Bookmarks Bar" }, { type: "checkbox", label: "Always Show Full URLs", selected: true }, sep(), { label: "Reload", shortcut: "⌘R" }, { label: "Force Reload", shortcut: "⇧⌘R", disabled: true }] },
    { label: "Format", entries: [{ type: "checkbox", label: "Strikethrough", selected: true }, { type: "checkbox", label: "Code" }, { type: "checkbox", label: "Superscript" }] },
  ]
  else if (name === "menubar-radio") menus = [
    { label: "Profiles", entries: profileEntries.filter((entry, index) => index < 4 || index === 4 || index === 6) },
    { label: "Theme", entries: [{ type: "radio", label: "Light", value: "light" }, { type: "radio", label: "Dark", value: "dark" }, { type: "radio", label: "System", value: "system", selected: true }] },
  ]
  else if (name === "menubar-submenu") menus = [
    { label: "File", entries: [{ type: "submenu", label: "Share", children: [{ label: "Email link" }, { label: "Messages" }, { label: "Notes" }] }, sep(), { label: "Print...", shortcut: "⌘P" }] },
    { label: "Edit", entries: editEntries },
  ]
  else if (name === "menubar-icons") menus = [{ label: "File", entries: iconEntries }, { label: "More", entries: moreEntries }]
  else menus = [
    { label: rtl ? "ملف" : "File", labelHe: rtl ? "קובץ" : undefined, labelEn: rtl ? "File" : undefined, entries: fileEntries },
    { label: rtl ? "تعديل" : "Edit", labelHe: rtl ? "ערוך" : undefined, labelEn: rtl ? "Edit" : undefined, entries: editEntries },
    { label: rtl ? "عرض" : "View", labelHe: rtl ? "תצוגה" : undefined, labelEn: rtl ? "View" : undefined, panelClass: "is-view", entries: viewEntries },
    { label: rtl ? "الملفات الشخصية" : "Profiles", labelHe: rtl ? "פרופילים" : undefined, labelEn: rtl ? "Profiles" : undefined, entries: profileEntries },
  ]
  const bar = <div class="doc-menubar" data-slot="menubar" data-doc-menubar data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>{menus.map((menu, index) => <span class="ui-menu doc-dropdown-menu doc-menubar-menu" data-menu><button type="button" class="doc-menubar-trigger" role="menuitem" data-slot="menubar-trigger" data-doc-menubar-trigger data-menu-trigger aria-haspopup="menu" aria-expanded="false" data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? menu.label : undefined} data-text-he={menu.labelHe} data-text-en={menu.labelEn}>{menu.label}</button><div class={`ui-menu-panel doc-dropdown-panel doc-menubar-panel${menu.panelClass ? ` ${menu.panelClass}` : ""}`} data-slot="menubar-content" data-menu-panel data-menu-side="bottom" data-menu-align={rtl && index === 0 ? "end" : "start"} role="menu" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"} hidden><DocDropdownEntries entries={menu.entries} rtl={rtl} /></div></span>)}</div>
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-menubar-rtl-preview" dir="rtl" data-lang="ar">{bar}</div></div> : bar
}

function DocNativeSelectPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "native-select-rtl"
  const groups = name === "native-select-groups"
  const disabled = name === "native-select-disabled"
  const invalid = name === "native-select-invalid"
  const option = (value: string, label: string, labelHe?: string, labelEn?: string) => <option data-slot="native-select-option" value={value} data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? label : undefined} data-text-he={labelHe} data-text-en={labelEn}>{label}</option>
  const options = rtl ? <>{option("", "اختر الحالة", "בחר סטטוס", "Select status")}{option("todo", "مهام", "לעשות", "Todo")}{option("in-progress", "قيد التنفيذ", "בתהליך", "In Progress")}{option("done", "منجز", "הושלם", "Done")}{option("cancelled", "ملغي", "בוטל", "Cancelled")}</> : groups ? <>{option("", "Select department")}<optgroup data-slot="native-select-optgroup" label="Engineering">{option("frontend", "Frontend")}{option("backend", "Backend")}{option("devops", "DevOps")}</optgroup><optgroup data-slot="native-select-optgroup" label="Sales">{option("sales-rep", "Sales Rep")}{option("account-manager", "Account Manager")}{option("sales-director", "Sales Director")}</optgroup><optgroup data-slot="native-select-optgroup" label="Operations">{option("support", "Customer Support")}{option("product-manager", "Product Manager")}{option("ops-manager", "Operations Manager")}</optgroup></> : disabled ? <>{option("", "Disabled")}{option("apple", "Apple")}{option("banana", "Banana")}{option("blueberry", "Blueberry")}</> : invalid ? <>{option("", "Error state")}{option("apple", "Apple")}{option("banana", "Banana")}{option("blueberry", "Blueberry")}</> : <>{option("", "Select status")}{option("todo", "Todo")}{option("in-progress", "In Progress")}{option("done", "Done")}{option("cancelled", "Cancelled")}</>
  const control = <div class={`doc-native-select is-${name.replace("native-select-", "")}`} data-slot="native-select-wrapper" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}><select data-slot="native-select" aria-label={rtl ? "اختر الحالة" : groups ? "Select department" : disabled ? "Disabled" : invalid ? "Error state" : "Select status"} aria-invalid={invalid ? "true" : undefined} disabled={disabled}>{options}</select><svg data-slot="native-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></div>
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-native-select-rtl-preview" dir="rtl" data-lang="ar">{control}</div></div> : control
}

function DocNavigationMenuPreview(props: { name: string }) {
  const rtl = untrack(() => props.name === "navigation-menu-rtl")
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const started = [
    ["مقدمة", "הקדמה", "Introduction", "مكونات قابلة لإعادة الاستخدام مبنية باستخدام Tailwind CSS.", "רכיבים לשימוש חוזר שנבנו עם Tailwind CSS.", "Re-usable components built with Tailwind CSS.", "/docs"],
    ["التثبيت", "התקנה", "Installation", "كيفية تثبيت التبعيات وتنظيم تطبيقك.", "כיצד להתקין תלויות ולבנות את האפליקציה שלך.", "How to install dependencies and structure your app.", "/docs/installation"],
    ["الطباعة", "טיפוגרפיה", "Typography", "أنماط للعناوين والفقرات والقوائم...إلخ", "סגנונות לכותרות, פסקאות, רשימות...וכו'", "Styles for headings, paragraphs, lists...etc", "/docs/primitives/typography"],
  ]
  const components = [
    ["حوار التنبيه", "דיאלוג התראה", "Alert Dialog", "حوار نافذة يقطع المستخدم بمحتوى مهم ويتوقع استجابة.", "דיאלוג מודאלי שמפריע למשתמש עם תוכן חשוב ומצפה לתגובה.", "A modal dialog that interrupts the user with important content and expects a response.", "/docs/primitives/alert-dialog"],
    ["بطاقة التحويم", "כרטיס ריחוף", "Hover Card", "للمستخدمين المبصرين لمعاينة المحتوى المتاح خلف الرابط.", "למשתמשים רואים כדי להציג תצוגה מקדימה של תוכן זמין מאחורי קישור.", "For sighted users to preview content available behind a link.", "/docs/primitives/hover-card"],
    ["التقدم", "התקדמות", "Progress", "يعرض مؤشرًا يوضح تقدم إتمام المهمة، عادةً يتم عرضه كشريط تقدم.", "מציג אינדיקטור המציג את התקדמות ההשלמה של משימה, בדרך כלל מוצג כסרגל התקדמות.", "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.", "/docs/primitives/progress"],
    ["منطقة التمرير", "אזור גלילה", "Scroll-area", "يفصل المحتوى بصريًا أو دلاليًا.", "מפריד תוכן חזותית או סמנטית.", "Visually or semantically separates content.", "/docs/primitives/scroll-area"],
    ["التبويبات", "כרטיסיות", "Tabs", "مجموعة من أقسام المحتوى المتعددة الطبقات—المعروفة بألواح التبويب—التي يتم عرضها واحدة في كل مرة.", "קבוצה של חלקי תוכן מרובדים—המכונים לוחות כרטיסיות—המוצגים אחד בכל פעם.", "A set of layered sections of content—known as tab panels—that are displayed one at a time.", "/docs/primitives/tabs"],
    ["تلميح", "טולטיפ", "Tooltip", "نافذة منبثقة تعرض معلومات متعلقة بعنصر عندما يتلقى العنصر التركيز على لوحة المفاتيح أو عند تحويم الماوس فوقه.", "חלון קופץ המציג מידע הקשור לאלמנט כאשר האלמנט מקבל מיקוד מקלדת או כאשר העכבר מרחף מעליו.", "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.", "/docs/primitives/tooltip"],
  ]
  const links = (entries: string[][], kind: "started" | "components") => <ul class={`doc-navigation-grid is-${kind}`}>{entries.map((entry) => <li><a href={entry[6]} data-doc-navigation-link><span class="doc-navigation-title">{text(entry[0], entry[1], entry[2])}</span><span class="doc-navigation-description">{text(entry[3], entry[4], entry[5])}</span></a></li>)}</ul>
  const nav = <nav class="doc-navigation-menu" data-slot="navigation-menu" data-doc-navigation-menu data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}><ul class="doc-navigation-list" data-slot="navigation-menu-list"><li><button type="button" class="doc-navigation-trigger" data-slot="navigation-menu-trigger" data-doc-navigation-trigger aria-expanded="false">{text("البدء", "התחלה", "Getting started")}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button><div class="doc-navigation-panel is-started" data-slot="navigation-menu-content" data-doc-navigation-panel hidden>{links(started, "started")}</div></li><li><button type="button" class="doc-navigation-trigger" data-slot="navigation-menu-trigger" data-doc-navigation-trigger aria-expanded="false">{text("المكونات", "רכיבים", "Components")}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button><div class="doc-navigation-panel is-components" data-slot="navigation-menu-content" data-doc-navigation-panel hidden>{links(components, "components")}</div></li><li><a class="doc-navigation-direct-link" href="/docs" data-slot="navigation-menu-link">{text("الوثائق", "תיעוד", "Docs")}</a></li></ul></nav>
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-navigation-rtl-preview" dir="rtl" data-lang="ar">{nav}</div></div> : nav
}

function DocPaginationPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "pagination-rtl"
  const simple = name === "pagination-simple"
  const iconsOnly = name === "pagination-icons-only"
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const number = (value: number) => rtl ? text(["٠", "١", "٢", "٣"][value], String(value), String(value)) : String(value)
  const arrow = (direction: "previous" | "next") => <svg class="doc-pagination-icon" data-direction={direction} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={direction === "previous" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"}></path></svg>
  const link = (label: string | number, active = false) => <li><a href="#" class={`doc-pagination-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>{typeof label === "number" ? number(label) : label}</a></li>
  const navigation = (
    <nav class="doc-pagination" role="navigation" aria-label="pagination" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
      <ul class="doc-pagination-content">
        {!simple ? <li><a href="#" class="doc-pagination-link is-wide" aria-label="Go to previous page">{arrow("previous")}{!iconsOnly ? text("السابق", "הקודם", "Previous") : null}</a></li> : null}
        {!iconsOnly ? <>{link(1)}{link(2, true)}{link(3)}{simple ? <>{link(4)}{link(5)}</> : <li><span class="doc-pagination-ellipsis" aria-hidden="true"><MoreHorizontalIcon /></span></li>}</> : null}
        {!simple ? <li><a href="#" class="doc-pagination-link is-wide" aria-label="Go to next page">{!iconsOnly ? text("التالي", "הבא", "Next") : null}{arrow("next")}</a></li> : null}
      </ul>
    </nav>
  )
  const content = iconsOnly ? <div class="doc-pagination-icons-layout"><label class="doc-pagination-field"><span>Rows per page</span><span class="ui-menu doc-pagination-select" data-menu><button type="button" data-menu-trigger aria-haspopup="menu" aria-expanded="false"><span data-doc-pagination-value>25</span><ChevronDownIcon /></button><span class="ui-menu-panel doc-pagination-select-panel" data-menu-panel role="menu" hidden>{["10", "25", "50", "100"].map((value) => <button type="button" class="ui-menu-item" role="menuitemradio" aria-checked={value === "25" ? "true" : "false"} data-menu-item data-doc-pagination-option={value}>{value}</button>)}</span></span></label>{navigation}</div> : navigation
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-pagination-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocPopoverPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "popover-rtl"
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const header = () => <div class="doc-popover-header"><h4>{text("الأبعاد", "מימדים", "Dimensions")}</h4><p>{text("تعيين الأبعاد للطبقة.", "הגדר את המימדים לשכבה.", "Set the dimensions for the layer.")}</p></div>
  const shell = (trigger: any, content: any, side = "bottom", align = "center", panelClass = "") => <span class="doc-popover" data-doc-popover><button type="button" class="doc-button is-outline doc-popover-trigger" data-doc-popover-trigger aria-haspopup="dialog" aria-expanded="false">{trigger}</button><div class={`doc-popover-panel ${panelClass}`} data-doc-popover-panel data-side={side} data-align={align} role="dialog" tabIndex={-1} hidden>{content}</div></span>
  let content
  if (name === "popover-demo") {
    const fields = [["width", "Width", "100%"], ["maxWidth", "Max. width", "300px"], ["height", "Height", "25px"], ["maxHeight", "Max. height", "none"]]
    content = shell("Open popover", <div class="doc-popover-demo-content">{header()}<div class="doc-popover-dimensions">{fields.map(([id, label, value]) => <label for={`popover-${id}`}><span>{label}</span><input id={`popover-${id}`} value={value} /></label>)}</div></div>, "bottom", "center", "is-demo")
  } else if (name === "popover-basic") {
    content = shell("Open Popover", header(), "bottom", "start", "is-basic")
  } else if (name === "popover-alignments") {
    content = <div class="doc-popover-alignments">{shell("Start", "Aligned to start", "bottom", "start", "is-alignment")}{shell("Center", "Aligned to center", "bottom", "center", "is-alignment")}{shell("End", "Aligned to end", "bottom", "end", "is-alignment")}</div>
  } else if (name === "popover-form") {
    content = shell("Open Popover", <div class="doc-popover-form-content">{header()}<div class="doc-popover-form-fields"><label for="popover-form-width"><span>Width</span><input id="popover-form-width" value="100%" /></label><label for="popover-form-height"><span>Height</span><input id="popover-form-height" value="25px" /></label></div></div>, "bottom", "start", "is-form")
  } else {
    content = <div class="doc-popover-rtl-group" data-doc-rtl-direction dir="rtl">{shell(text("يسار", "שמאל", "Left"), header(), "left", "center", "is-rtl")}{shell(text("أعلى", "למעלה", "Top"), header(), "top", "center", "is-rtl")}{shell(text("أسفل", "למטה", "Bottom"), header(), "bottom", "center", "is-rtl")}{shell(text("يمين", "ימין", "Right"), header(), "right", "center", "is-rtl")}</div>
  }
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-popover-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocProgressPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "progress-rtl"
  const value = name === "progress-controlled" ? 50 : name === "progress-demo" ? 13 : 66
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const progress = <div class="doc-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} data-doc-progress-demo={name === "progress-demo" ? "true" : undefined} data-doc-progress-controlled={name === "progress-controlled" ? "true" : undefined}><span class="doc-progress-indicator" style={`transform:translateX(-${100 - value}%)`}></span></div>
  let content
  if (name === "progress-demo") content = <div class="doc-progress-demo" data-doc-progress-demo>{progress}</div>
  else if (name === "progress-controlled") content = <div class="doc-progress-field" data-slider-scope="doc-progress-control">{progress}<div class="ui-slider doc-progress-slider" data-slider="doc-progress-control" data-slider-min="0" data-slider-max="100" data-slider-step="1" role="group" aria-label="Progress"><span class="ui-slider-track"><span class="ui-slider-range" data-slider-range style="left:0%;right:50%"></span></span><span class="ui-slider-thumb" data-slider-thumb="0" data-slider-value="50" role="slider" tabIndex={0} aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={50} style="left:50%"></span></div></div>
  else content = <div class="doc-progress-field" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}><label for="progress-upload"><span>{text("تقدم الرفع", "התקדמות העלאה", "Upload progress")}</span><span class="doc-progress-value" data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "٦٦%" : undefined} data-text-he={rtl ? "66%" : undefined} data-text-en={rtl ? "66%" : undefined}>{rtl ? "٦٦%" : "66%"}</span></label>{progress}</div>
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-progress-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocRadioGroupPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const variant = name.replace("radio-group-", "")
  const rtl = variant === "rtl"
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const descriptions = rtl || variant === "description"
  const items = rtl ? [
    ["default", "افتراضي", "ברירת מחדל", "Default", "تباعد قياسي لمعظم حالات الاستخدام.", "ריווח סטנדרטי לרוב מקרי השימוש.", "Standard spacing for most use cases."],
    ["comfortable", "مريح", "נוח", "Comfortable", "مساحة أكبر بين العناصر.", "יותר מקום בין האלמנטים.", "More space between elements."],
    ["compact", "مضغوط", "קומפקטי", "Compact", "تباعد أدنى للتخطيطات الكثيفة.", "ריווח מינימלי לפריסות צפופות.", "Minimal spacing for dense layouts."],
  ] : variant === "choice-card" ? [["plus", "Plus", "", "", "For individuals and small teams."], ["pro", "Pro", "", "", "For growing businesses."], ["enterprise", "Enterprise", "", "", "For large teams and enterprises."]] : variant === "fieldset" ? [["monthly", "Monthly ($9.99/month)"], ["yearly", "Yearly ($99.99/year)"], ["lifetime", "Lifetime ($299.99)"]] : variant === "disabled" ? [["option1", "Disabled"], ["option2", "Option 2"], ["option3", "Option 3"]] : variant === "invalid" ? [["email", "Email only"], ["sms", "SMS only"], ["both", "Both Email & SMS"]] : [["default", "Default", "", "", "Standard spacing for most use cases."], ["comfortable", "Comfortable", "", "", "More space between elements."], ["compact", "Compact", "", "", "Minimal spacing for dense layouts."]]
  const selected = variant === "choice-card" ? "plus" : variant === "fieldset" ? "monthly" : variant === "disabled" ? "option2" : variant === "invalid" ? "email" : "comfortable"
  const group = <div class={`doc-radio-group is-${variant}`} role="radiogroup" data-doc-radio-group data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>{items.map((item, index) => {
    const id = `radio-${variant}-${item[0]}`
    const disabled = variant === "disabled" && index === 0
    const label = rtl ? text(item[1] ?? "", item[2] ?? "", item[3] ?? "") : item[1]
    const description = rtl ? text(item[4] ?? "", item[5] ?? "", item[6] ?? "") : item[4]
    const input = <input type="radio" name={`radio-${variant}`} id={id} value={item[0]} checked={item[0] === selected} data-checked={item[0] === selected ? "true" : "false"} disabled={disabled} aria-invalid={variant === "invalid" ? "true" : undefined} />
    return variant === "choice-card" ? <label class="doc-radio-card" for={id}><span class="doc-radio-copy"><strong>{label}</strong><small>{description}</small></span>{input}</label> : <div class={`doc-radio-field${disabled ? " is-disabled" : ""}${variant === "invalid" ? " is-invalid" : ""}`}>{input}<label for={id}><span>{label}</span>{descriptions ? <small>{description}</small> : null}</label></div>
  })}</div>
  const content = variant === "fieldset" || variant === "invalid" ? <fieldset class="doc-radio-fieldset"><legend>{variant === "invalid" ? "Notification Preferences" : "Subscription Plan"}</legend><p>{variant === "invalid" ? "Choose how you want to receive notifications." : "Yearly and lifetime plans offer significant savings."}</p>{group}</fieldset> : group
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-radio-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocResizablePreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "resizable-rtl"
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const handle = (orientation: "horizontal" | "vertical", withHandle = false, value = 50) => <div class={`doc-resizable-handle${withHandle ? " with-handle" : ""}`} data-doc-resizable-handle role="separator" tabIndex={0} aria-orientation={orientation} aria-valuemin={10} aria-valuemax={90} aria-valuenow={value}>{withHandle ? <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 7h.01M9 12h.01M9 17h.01M15 7h.01M15 12h.01M15 17h.01"></path></svg></span> : null}</div>
  const complex = <div class="doc-resizable-group is-horizontal is-complex" data-doc-resizable-group data-orientation="horizontal" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}><div class="doc-resizable-panel" data-doc-resizable-panel style="flex-basis:50%"><strong>{text("واحد", "אחד", "One")}</strong></div>{handle("vertical", true)}<div class="doc-resizable-panel" data-doc-resizable-panel style="flex-basis:50%"><div class="doc-resizable-group is-vertical is-nested" data-doc-resizable-group data-orientation="vertical" dir={rtl ? "rtl" : "ltr"}><div class="doc-resizable-panel" data-doc-resizable-panel style="flex-basis:25%"><strong>{text("اثنان", "שניים", "Two")}</strong></div>{handle("horizontal", true, 25)}<div class="doc-resizable-panel" data-doc-resizable-panel style="flex-basis:75%"><strong>{text("ثلاثة", "שלושה", "Three")}</strong></div></div></div></div>
  let content
  if (name === "resizable-demo" || rtl) content = complex
  else if (name === "resizable-vertical") content = <div class="doc-resizable-group is-vertical is-simple" data-doc-resizable-group data-orientation="vertical"><div class="doc-resizable-panel" data-doc-resizable-panel style="flex-basis:25%"><strong>Header</strong></div>{handle("horizontal", false, 25)}<div class="doc-resizable-panel" data-doc-resizable-panel style="flex-basis:75%"><strong>Content</strong></div></div>
  else content = <div class="doc-resizable-group is-horizontal is-handle" data-doc-resizable-group data-orientation="horizontal"><div class="doc-resizable-panel" data-doc-resizable-panel style="flex-basis:25%"><strong>Sidebar</strong></div>{handle("vertical", true, 25)}<div class="doc-resizable-panel" data-doc-resizable-panel style="flex-basis:75%"><strong>Content</strong></div></div>
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-resizable-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocScrollAreaPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "scroll-area-rtl"
  const tags = Array.from({ length: 50 }, (_, index) => `v1.2.0-beta.${50 - index}`)
  const vertical = <div class="doc-scroll-area is-vertical" data-doc-scroll-area data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}><div class="doc-scroll-viewport" data-doc-scroll-viewport><div class="doc-scroll-tags"><h4 data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "العلامات" : undefined} data-text-he={rtl ? "תגיות" : undefined} data-text-en={rtl ? "Tags" : undefined}>{rtl ? "العلامات" : "Tags"}</h4>{tags.map((tag) => <><div>{tag}</div><span class="doc-scroll-separator"></span></>)}</div></div><span class="doc-scrollbar is-vertical" aria-hidden="true"><span></span></span></div>
  const works = [["Ornella Binni", "https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80"], ["Tom Byrom", "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80"], ["Vladimir Malyavko", "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80"]]
  const horizontal = <div class="doc-scroll-area is-horizontal" data-doc-scroll-area><div class="doc-scroll-viewport" data-doc-scroll-viewport><div class="doc-scroll-works">{works.map(([artist, art]) => <figure><div><img src={art} alt={`Photo by ${artist}`} width="300" height="400" /></div><figcaption>Photo by <strong>{artist}</strong></figcaption></figure>)}</div></div><span class="doc-scrollbar is-horizontal" aria-hidden="true"><span></span></span></div>
  const content = name === "scroll-area-horizontal-demo" ? horizontal : vertical
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-scroll-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocSelectPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const variant = name.replace("select-", "")
  const rtl = variant === "rtl"
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const fruits = rtl ? [["apple", "تفاح", "תפוח", "Apple"], ["banana", "موز", "בננה", "Banana"], ["blueberry", "توت أزرق", "אוכמניה", "Blueberry"], ["grapes", "عنب", "ענבים", "Grapes"], ["pineapple", "أناناس", "אננס", "Pineapple"]] : [["apple", "Apple"], ["banana", "Banana"], ["blueberry", "Blueberry"], ["grapes", "Grapes"], ["pineapple", "Pineapple"]]
  const vegetables = rtl ? [["carrot", "جزر", "גזר", "Carrot"], ["broccoli", "بروكلي", "ברוקולי", "Broccoli"], ["spinach", "سبانخ", "תרד", "Spinach"]] : [["carrot", "Carrot"], ["broccoli", "Broccoli"], ["spinach", "Spinach"]]
  const timezones = ["Eastern Standard Time", "Central Standard Time", "Mountain Standard Time", "Pacific Standard Time", "Alaska Standard Time", "Hawaii Standard Time", "Greenwich Mean Time", "Central European Time", "Eastern European Time", "Western European Summer Time", "Central Africa Time", "East Africa Time", "Moscow Time", "India Standard Time", "China Standard Time", "Japan Standard Time", "Korea Standard Time", "Indonesia Central Standard Time", "Australian Western Standard Time", "Australian Central Standard Time", "Australian Eastern Standard Time", "New Zealand Standard Time", "Fiji Time", "Argentina Time", "Bolivia Time", "Brasilia Time", "Chile Standard Time"].map((label, index) => [`tz-${index}`, label])
  const item = (entry: string[], disabled = false) => <button type="button" class="doc-select-item" role="option" aria-selected="false" data-doc-select-item data-value={entry[0]} data-label-ar={rtl ? entry[1] : undefined} data-label-he={rtl ? entry[2] : undefined} data-label-en={rtl ? entry[3] : undefined} disabled={disabled}><span>{rtl ? text(entry[1], entry[2], entry[3]) : entry[1]}</span><span class="doc-select-check">✓</span></button>
  const label = (ar: string, he: string, en: string) => <span class="doc-select-label">{text(ar, he, en)}</span>
  const grouped = variant === "groups" || rtl
  const scrollable = variant === "scrollable"
  const entries = scrollable ? <>{label("North America", "North America", "North America")}{timezones.slice(0, 6).map((entry) => item(entry))}{label("Europe & Africa", "Europe & Africa", "Europe & Africa")}{timezones.slice(6, 12).map((entry) => item(entry))}{label("Asia", "Asia", "Asia")}{timezones.slice(12, 18).map((entry) => item(entry))}{label("Australia & Pacific", "Australia & Pacific", "Australia & Pacific")}{timezones.slice(18, 23).map((entry) => item(entry))}{label("South America", "South America", "South America")}{timezones.slice(23).map((entry) => item(entry))}</> : grouped ? <>{label(rtl ? "الفواكه" : "Fruits", rtl ? "פירות" : "Fruits", "Fruits")}{fruits.map((entry) => item(entry))}<span class="doc-select-separator"></span>{label(rtl ? "الخضروات" : "Vegetables", rtl ? "ירקות" : "Vegetables", "Vegetables")}{vegetables.map((entry) => item(entry))}</> : <>{variant === "demo" ? label("Fruits", "Fruits", "Fruits") : null}{fruits.map((entry) => item(entry, variant === "disabled" && entry[0] === "grapes"))}</>
  const defaultValue = variant === "align-item" ? "banana" : ""
  const placeholder = scrollable ? "Select a timezone" : rtl ? "اختر فاكهة" : "Select a fruit"
  const select = <span class={`doc-select is-${variant}`} data-doc-select data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"} data-value={defaultValue}><button type="button" class="doc-select-trigger" data-doc-select-trigger aria-haspopup="listbox" aria-expanded="false" aria-invalid={variant === "invalid" ? "true" : undefined} disabled={variant === "disabled"}><span data-doc-select-value data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "اختر فاكهة" : undefined} data-text-he={rtl ? "בחר פרי" : undefined} data-text-en={rtl ? "Select a fruit" : undefined}>{defaultValue === "banana" ? "Banana" : placeholder}</span><ChevronDownIcon /></button><div class={`doc-select-panel${scrollable ? " is-scrollable" : ""}`} data-doc-select-panel role="listbox" hidden>{entries}</div></span>
  const content = variant === "align-item" ? <div class="doc-select-align"><label><span><strong>Align Item</strong><small>Toggle to align the item with the trigger.</small></span><button type="button" role="switch" aria-checked="true" data-doc-select-align-switch><span></span></button></label>{select}</div> : variant === "invalid" ? <div class="doc-select-invalid-field"><label>Fruit</label>{select}<p>Please select a fruit.</p></div> : select
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-select-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocSeparatorPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "separator-rtl"
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const demo = <div class="doc-separator-demo" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}><div><strong>shadcn/ui</strong><span>{text("الأساس لنظام التصميم الخاص بك", "הבסיס למערכת העיצוב שלך", "The Foundation for your Design System")}</span></div><span class="doc-separator is-horizontal" role="separator" aria-orientation="horizontal"></span><p>{text("مجموعة من المكونات المصممة بشكل جميل يمكنك تخصيصها وتوسيعها والبناء عليها.", "סט של רכיבים מעוצבים בצורה יפה שאתה יכול להתאים אישית, להרחיב ולבנות עליהם.", "A set of beautifully designed components that you can customize, extend, and build on.")}</p></div>
  let content
  if (name === "separator-demo" || rtl) content = demo
  else if (name === "separator-vertical") content = <div class="doc-separator-vertical"><span>Blog</span><span class="doc-separator is-vertical" role="separator" aria-orientation="vertical"></span><span>Docs</span><span class="doc-separator is-vertical" role="separator" aria-orientation="vertical"></span><span>Source</span></div>
  else if (name === "separator-menu") content = <div class="doc-separator-menu">{[["Settings", "Manage preferences"], ["Account", "Profile & security"], ["Help", "Support & docs"]].map((entry, index) => <>{index > 0 ? <span class="doc-separator is-vertical" role="separator" aria-orientation="vertical"></span> : null}<div><strong>{entry[0]}</strong><small>{entry[1]}</small></div></>)}</div>
  else content = <div class="doc-separator-list">{[["Item 1", "Value 1"], ["Item 2", "Value 2"], ["Item 3", "Value 3"]].map((entry, index) => <>{index > 0 ? <span class="doc-separator is-horizontal" role="separator" aria-orientation="horizontal"></span> : null}<dl><dt>{entry[0]}</dt><dd>{entry[1]}</dd></dl></>)}</div>
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-separator-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocSheetPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const variant = name.replace("sheet-", "")
  const rtl = variant === "rtl"
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const sheet = (trigger: any, side: string, noClose = false, long = false) => <div class="doc-sheet-preview" data-doc-dialog-root><button type="button" class="doc-button is-outline" data-doc-dialog-trigger aria-haspopup="dialog" aria-expanded="false">{trigger}</button><div class="doc-dialog-portal doc-sheet-portal" data-doc-dialog-portal hidden><div class="doc-dialog-overlay" data-doc-dialog-overlay></div><div class={`doc-sheet-content is-${side}${long ? " is-long" : ""}`} role="dialog" aria-modal="true" aria-label={rtl ? "تعديل الملف الشخصي" : long ? `Edit profile ${side}` : noClose ? "No Close Button" : "Edit profile"} data-doc-rtl-label={rtl ? "true" : undefined} data-label-ar={rtl ? "تعديل الملف الشخصي" : undefined} data-label-he={rtl ? "עריכת פרופיל" : undefined} data-label-en={rtl ? "Edit profile" : undefined} tabIndex={-1} data-doc-sheet-rtl-side={rtl ? "true" : undefined} data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>{!noClose ? <button type="button" class="doc-dialog-x" aria-label="Close" data-doc-dialog-close>×</button> : null}<header><h3>{noClose ? "No Close Button" : text("تعديل الملف الشخصي", "עריכת פרופיל", "Edit profile")}</h3><p>{noClose ? "This sheet doesn't have a close button in the top-right corner. Click outside to close." : text("قم بإجراء تغييرات على ملفك الشخصي هنا. انقر حفظ عند الانتهاء.", "בצע שינויים בפרופיל שלך כאן. לחץ שמור כשתסיים.", "Make changes to your profile here. Click save when you're done.")}</p></header>{long ? <div class="doc-sheet-scroll">{Array.from({ length: 10 }, (_, index) => <p key={index}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>)}</div> : noClose ? null : <div class="doc-sheet-fields"><label><span>{text("الاسم", "שם", "Name")}</span><input value="Pedro Duarte" /></label><label><span>{text("اسم المستخدم", "שם משתמש", "Username")}</span><input value={rtl ? "peduarte" : "@peduarte"} /></label></div>}{!noClose ? <footer><button type="button" class="doc-button is-default" data-doc-dialog-close>{long ? "Save changes" : text("حفظ التغييرات", "שמור שינויים", "Save changes")}</button><button type="button" class="doc-button is-outline" data-doc-dialog-close>{long ? "Cancel" : text("إغلاق", "סגור", "Close")}</button></footer> : null}</div></div></div>
  let content
  if (variant === "side") content = <div class="doc-sheet-sides">{["top", "right", "bottom", "left"].map((side) => sheet(side, side, false, true))}</div>
  else if (variant === "no-close-button") content = sheet("Open Sheet", "right", true)
  else content = sheet(text("فتح", "פתח", "Open"), rtl ? "left" : "right")
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-sheet-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocSidebarIcon(props: { kind: string }) {
  const paths: Record<string, any> = {
    playground: <><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 8h4M7 12h2"></path></>,
    models: <><rect x="4" y="5" width="16" height="14" rx="2"></rect><path d="M9 9h6M9 13h6"></path></>,
    docs: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22z"></path><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22z"></path></>,
    settings: <><circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.5h-4L10.4 6a8 8 0 0 0-1.5 1.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.5 1.1l.3 2.5h4L15 18a8 8 0 0 0 1.5-1.1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z"></path></>,
  }
  return <svg class="doc-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths[props.kind] ?? <path d="M4 4h16v16H4z"></path>}</svg>
}

function DocSidebarPreview(props: { name: string }) {
  untrack(() => props.name)
  const groups = [
    { title: "Playground", icon: "playground", open: true, items: ["History", "Starred", "Settings"] },
    { title: "Models", icon: "models", items: ["Genesis", "Explorer", "Quantum"] },
    { title: "Documentation", icon: "docs", items: ["Introduction", "Get Started", "Tutorials", "Changelog"] },
    { title: "Settings", icon: "settings", items: ["General", "Team", "Billing", "Limits"] },
  ]
  return (
    <div class="doc-sidebar-demo" data-doc-sidebar-root data-state="expanded">
      <aside class="doc-sidebar-panel" aria-label="Application sidebar">
        <button type="button" class="doc-sidebar-team" aria-label="Switch team">
          <span class="doc-sidebar-team-logo">▰</span><span class="doc-sidebar-copy"><strong>Acme Inc</strong><small>Enterprise</small></span><span class="doc-sidebar-chevrons">⌃<br />⌄</span>
        </button>
        <div class="doc-sidebar-content">
          <p class="doc-sidebar-group-label">Platform</p>
          <nav aria-label="Platform">
            {groups.map((group) => (
              <div class="doc-sidebar-nav-group" data-doc-sidebar-group data-open={group.open ? "true" : "false"}>
                <button type="button" class="doc-sidebar-nav-button" data-doc-sidebar-group-trigger aria-expanded={group.open ? "true" : "false"}>
                  <DocSidebarIcon kind={group.icon} /><span class="doc-sidebar-copy">{group.title}</span><span class="doc-sidebar-chevron">›</span>
                </button>
                <div class="doc-sidebar-submenu" data-doc-sidebar-group-content hidden={!group.open}>
                  {group.items.map((item) => <a href="#">{item}</a>)}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <button type="button" class="doc-sidebar-user" aria-label="User menu">
          <img src="/avatars/shadcn.jpg" alt="shadcn" /><span class="doc-sidebar-copy"><strong>shadcn</strong><small>m@example.com</small></span><span class="doc-sidebar-chevrons">⌃<br />⌄</span>
        </button>
      </aside>
      <main class="doc-sidebar-inset">
        <button type="button" class="doc-sidebar-trigger" data-doc-sidebar-trigger aria-label="Toggle Sidebar" title="Toggle Sidebar"><span aria-hidden="true"></span></button>
      </main>
    </div>
  )
}

function DocSkeletonPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("skeleton-", ""))
  const block = (className: string) => <span class={`doc-skeleton ${className}`} data-slot="skeleton"></span>
  const demo = <div class="doc-skeleton-profile">{block("is-avatar-lg")}<div>{block("is-w-250")}{block("is-w-200")}</div></div>
  let content
  if (variant === "avatar") content = <div class="doc-skeleton-profile is-small">{block("is-avatar-sm")}<div>{block("is-w-150")}{block("is-w-100")}</div></div>
  else if (variant === "card") content = <div class="doc-skeleton-card"><header>{block("is-w-192")}{block("is-w-144")}</header><div>{block("is-card-media")}</div></div>
  else if (variant === "text") content = <div class="doc-skeleton-stack is-text">{block("is-full")}{block("is-full")}{block("is-three-quarters")}</div>
  else if (variant === "form") content = <div class="doc-skeleton-form"><div>{block("is-w-80")}{block("is-input")}</div><div>{block("is-w-96")}{block("is-input")}</div>{block("is-button")}</div>
  else if (variant === "table") content = <div class="doc-skeleton-table">{Array.from({ length: 5 }, () => <div>{block("is-flex")}{block("is-w-96")}{block("is-w-80")}</div>)}</div>
  else content = demo
  return variant === "rtl" ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-skeleton-rtl-preview" dir="rtl" data-lang="ar" data-doc-rtl-direction="true">{content}</div></div> : content
}

function DocSliderPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("slider-", ""))
  const slider = (values: number[], options: { vertical?: boolean; disabled?: boolean; rtl?: boolean; id?: string } = {}) => <div class={`ui-slider doc-slider${options.vertical ? " is-vertical" : ""}${options.disabled ? " is-disabled" : ""}`} data-slider={options.id ?? `doc-slider-${variant}`} data-slider-min="0" data-slider-max={variant === "controlled" ? "1" : "100"} data-slider-step={variant === "controlled" ? "0.1" : variant === "multiple" ? "10" : variant === "range" ? "5" : "1"} data-slider-direction={options.rtl ? "rtl" : "ltr"} data-slider-orientation={options.vertical ? "vertical" : "horizontal"} data-slider-disabled={options.disabled ? "true" : undefined} role="group" aria-label={options.vertical ? "Vertical slider" : "Slider"} dir={options.rtl ? "rtl" : "ltr"} data-doc-rtl-direction={options.rtl ? "true" : undefined}><span class="ui-slider-track"><span class="ui-slider-range" data-slider-range></span></span>{values.map((value, index) => <span class="ui-slider-thumb" data-slider-thumb={String(index)} data-slider-value={String(value)} role="slider" tabIndex={options.disabled ? -1 : 0} aria-label={`Value ${index + 1}`} aria-valuemin={0} aria-valuemax={variant === "controlled" ? 1 : 100} aria-valuenow={value} aria-disabled={options.disabled ? "true" : undefined}></span>)}</div>
  let content
  if (variant === "range") content = slider([25, 50])
  else if (variant === "multiple") content = slider([10, 20, 70])
  else if (variant === "vertical") content = <div class="doc-slider-verticals">{slider([50], { vertical: true, id: "doc-slider-vertical-1" })}{slider([25], { vertical: true, id: "doc-slider-vertical-2" })}</div>
  else if (variant === "controlled") content = <div class="doc-slider-controlled" data-slider-scope="doc-slider-controlled"><div><label>Temperature</label><span><span data-slider-output="0">0.3</span>, <span data-slider-output="1">0.7</span></span></div>{slider([0.3, 0.7], { id: "doc-slider-controlled" })}</div>
  else if (variant === "disabled") content = slider([50], { disabled: true })
  else if (variant === "rtl") content = slider([75], { rtl: true })
  else content = slider([75])
  return variant === "rtl" ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-slider-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocSonnerPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("sonner-", ""))
  const button = (label: string, options: { type?: string; description?: string; position?: string; action?: string } = {}) => <button type="button" class="doc-button is-outline" data-doc-sonner-trigger data-toast-type={options.type ?? "default"} data-toast-description={options.description} data-toast-position={options.position ?? "top-center"} data-toast-action={options.action}>{label}</button>
  if (variant === "types") return <div class="doc-sonner-buttons">{button("Default")}{button("Success", { type: "success" })}{button("Info", { type: "info" })}{button("Warning", { type: "warning" })}{button("Error", { type: "error" })}{button("Promise", { type: "promise" })}</div>
  if (variant === "description") return button("Show Toast", { description: "Monday, January 3rd at 6:00pm" })
  if (variant === "position") return <div class="doc-sonner-buttons is-position">{["Top Left", "Top Center", "Top Right", "Bottom Left", "Bottom Center", "Bottom Right"].map((label) => button(label, { position: label.toLowerCase().replace(" ", "-") }))}</div>
  return button("Show Toast", { description: "Sunday, December 03, 2023 at 9:00 AM", action: "Undo" })
}

function DocSpinner(props: { size?: number; class?: string }) {
  const size = untrack(() => props.size ?? 16)
  return <svg class={`doc-spinner${props.class ? ` ${props.class}` : ""}`} role="status" aria-label="Loading" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56"></path></svg>
}

function DocSpinnerPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("spinner-", ""))
  const item = (rtl = false) => <div class="doc-spinner-item" dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}><DocSpinner /><strong data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "جاري معالجة الدفع..." : undefined} data-text-he={rtl ? "מעבד תשלום..." : undefined} data-text-en={rtl ? "Processing payment..." : undefined}>{rtl ? "جاري معالجة الدفع..." : "Processing payment..."}</strong><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "١٠٠.٠٠ دولار" : undefined} data-text-he={rtl ? "$100.00" : undefined} data-text-en={rtl ? "$100.00" : undefined}>{rtl ? "١٠٠.٠٠ دولار" : "$100.00"}</span></div>
  let content
  if (variant === "custom") content = <DocSpinner />
  else if (variant === "size") content = <div class="doc-spinner-sizes">{[12, 16, 24, 32].map((size) => <DocSpinner size={size} />)}</div>
  else if (variant === "button") content = <div class="doc-spinner-buttons">{[["Loading...", "is-default"], ["Please wait", "is-outline"], ["Processing", "is-secondary"]].map(([label, style]) => <button type="button" class={`doc-button ${style}`} disabled><DocSpinner />{label}</button>)}</div>
  else if (variant === "badge") content = <div class="doc-spinner-badges">{[["Syncing", ""], ["Updating", "is-secondary"], ["Processing", "is-outline"]].map(([label, style]) => <span class={`doc-badge has-icon-start ${style}`}><DocSpinner size={12} />{label}</span>)}</div>
  else if (variant === "input-group") content = <div class="doc-spinner-inputs"><label class="ui-input-group"><input class="ui-input-group-input" placeholder="Send a message..." disabled /><span class="ui-input-group-addon ui-input-group-addon-end"><DocSpinner /></span></label><label class="ui-input-group ui-input-group-block"><textarea class="ui-input-group-textarea" placeholder="Send a message..." disabled></textarea><span class="ui-input-group-addon ui-input-group-addon-block"><DocSpinner /> Validating...<button type="button" class="ui-input-group-button ui-input-group-button-primary" aria-label="Send">↑</button></span></label></div>
  else if (variant === "empty") content = <div class="doc-spinner-empty"><span><DocSpinner /></span><h3>Processing your request</h3><p>Please wait while we process your request. Do not refresh the page.</p><button type="button" class="doc-button is-outline">Cancel</button></div>
  else content = item(variant === "rtl")
  return variant === "rtl" ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-spinner-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocSwitchPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("switch-", ""))
  const control = (options: { id: string; checked?: boolean; disabled?: boolean; invalid?: boolean; size?: "sm"; label?: string }) => <button id={options.id} type="button" class={`ui-switch${options.size === "sm" ? " is-sm" : ""}`} role="switch" aria-label={options.label} aria-checked={options.checked ? "true" : "false"} aria-invalid={options.invalid ? "true" : undefined} data-checked={options.checked ? "true" : "false"} data-doc-switch disabled={options.disabled}><span></span></button>
  const field = (options: { id: string; title: any; description?: any; checked?: boolean; disabled?: boolean; invalid?: boolean; card?: boolean; rtl?: boolean }) => <div class={`doc-switch-field${options.card ? " is-card" : ""}${options.disabled ? " is-disabled" : ""}${options.invalid ? " is-invalid" : ""}`} dir={options.rtl ? "rtl" : "ltr"} data-doc-rtl-direction={options.rtl ? "true" : undefined}><div><label for={options.id}>{options.title}</label>{options.description ? <p>{options.description}</p> : null}</div>{control({ id: options.id, checked: options.checked, disabled: options.disabled, invalid: options.invalid, label: typeof options.title === "string" ? options.title : undefined })}</div>
  if (variant === "demo") return <div class="doc-switch-inline">{control({ id: "airplane-mode", label: "Airplane Mode" })}<label for="airplane-mode">Airplane Mode</label></div>
  if (variant === "description") return field({ id: "switch-focus-mode", title: "Share across devices", description: "Focus is shared across devices, and turns off when you leave the app." })
  if (variant === "choice-card") return <div class="doc-switch-cards">{field({ id: "switch-share", title: "Share across devices", description: "Focus is shared across devices, and turns off when you leave the app.", card: true })}{field({ id: "switch-notifications", title: "Enable notifications", description: "Receive notifications when focus mode is enabled or disabled.", checked: true, card: true })}</div>
  if (variant === "disabled") return <div class="doc-switch-inline is-disabled">{control({ id: "switch-disabled-unchecked", disabled: true, label: "Disabled" })}<label for="switch-disabled-unchecked">Disabled</label></div>
  if (variant === "invalid") return field({ id: "switch-terms", title: "Accept terms and conditions", description: "You must accept the terms and conditions to continue.", invalid: true })
  if (variant === "sizes") return <div class="doc-switch-sizes"><div class="doc-switch-inline">{control({ id: "switch-size-sm", size: "sm", label: "Small" })}<label for="switch-size-sm">Small</label></div><div class="doc-switch-inline">{control({ id: "switch-size-default", label: "Default" })}<label for="switch-size-default">Default</label></div></div>
  const title = <span data-doc-rtl-text data-text-ar="المشاركة عبر الأجهزة" data-text-he="שיתוף בין מכשירים" data-text-en="Share across devices">المشاركة عبر الأجهزة</span>
  const description = <span data-doc-rtl-text data-text-ar="يتم مشاركة التركيز عبر الأجهزة، ويتم إيقاف تشغيله عند مغادرة التطبيق." data-text-he="המיקוד משותף בין מכשירים, וכבה כשאתה עוזב את האפליקציה." data-text-en="Focus is shared across devices, and turns off when you leave the app.">يتم مشاركة التركيز عبر الأجهزة، ويتم إيقاف تشغيله عند مغادرة التطبيق.</span>
  return <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-switch-rtl-preview" dir="rtl" data-lang="ar">{field({ id: "switch-focus-mode-rtl", title, description, rtl: true })}</div></div>
}

function DocTypographyPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("typography-", ""))
  const rtl = variant === "rtl"
  const text = (ar: string, he: string, en: string) =>
    rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en

  const article = () => (
    <div class="doc-typography-article" dir={rtl ? "rtl" : "ltr"}>
      <h1 class="doc-typography-h1 is-start">{text("فرض الضرائب على الضحك: سجلات ضريبة النكتة", "מיסוי הצחוק: כרוניקות מס הבדיחה", "Taxing Laughter: The Joke Tax Chronicles")}</h1>
      <p class="doc-typography-lead-paragraph">{text("في قديم الزمان، في أرض بعيدة، كان هناك ملك كسول جداً يقضي يومه كله مستلقياً على عرشه. في أحد الأيام، جاءه مستشاروه بمشكلة: المملكة كانت تنفد من المال.", "היה היה פעם, בארץ רחוקה, מלך עצלן מאוד שבילה את כל היום בהתרווחות על כס מלכותו. יום אחד, יועציו באו אליו עם בעיה: הממלכה נגמר לה הכסף.", "Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money.")}</p>
      <h2 class="doc-typography-h2">{text("خطة الملك", "התוכנית של המלך", "The King's Plan")}</h2>
      <p class="doc-typography-p">
        {text("فكر الملك طويلاً وبجد، وأخيراً توصل إلى", "המלך חשב ארוכות וקשות, ולבסוף העלה", "The king thought long and hard, and finally came up with")}{" "}
        <a class="doc-typography-link" href="#">{text("خطة عبقرية", "תוכנית גאונית", "a brilliant plan")}</a>
        {text(": سيفرض ضريبة على النكات في المملكة.", ": הוא ימסה את הבדיחות בממלכה.", ": he would tax the jokes in the kingdom.")}
      </p>
      <blockquote class="doc-typography-blockquote">{text("\"في النهاية،\" قال، \"الجميع يستمتع بنكتة جيدة، لذا من العدل أن يدفعوا مقابل هذا الامتياز.\"", "\"אחרי הכל,\" אמר, \"כולם נהנים מבדיחה טובה, אז זה רק הוגן שישלמו על הזכות הזו.\"", "\"After all,\" he said, \"everyone enjoys a good joke, so it's only fair that they should pay for the privilege.\"")}</blockquote>
      <h3 class="doc-typography-h3">{text("ضريبة النكتة", "מס הבדיחה", "The Joke Tax")}</h3>
      <p class="doc-typography-p">{text("لم يكن رعايا الملك سعداء. تذمروا واشتكوا، لكن الملك كان حازماً:", "נתיני המלך לא היו מרוצים. הם התלוננו והתרעמו, אבל המלך היה נחוש:", "The king's subjects were not amused. They grumbled and complained, but the king was firm:")}</p>
      <ul class="doc-typography-list">
        <li>{text("المستوى الأول من التورية: 5 قطع ذهبية", "רמה ראשונה של משחקי מילים: 5 מטבעות זהב", "1st level of puns: 5 gold coins")}</li>
        <li>{text("المستوى الثاني من النكات: 10 قطع ذهبية", "רמה שנייה של בדיחות: 10 מטבעות זהב", "2nd level of jokes: 10 gold coins")}</li>
        <li>{text("المستوى الثالث من النكات القصيرة: 20 قطعة ذهبية", "רמה שלישית של חידודים: 20 מטבעות זהב", "3rd level of one-liners: 20 gold coins")}</li>
      </ul>
      <p class="doc-typography-p">{text("نتيجة لذلك، توقف الناس عن رواية النكات، وغرقت المملكة في الكآبة. لكن كان هناك شخص واحد رفض أن تحبطه حماقة الملك: مهرج البلاط المسمى المازح.", "כתוצאה מכך, אנשים הפסיקו לספר בדיחות, והממלכה שקעה בעצב. אבל היה אדם אחד שסירב לתת לטיפשות המלך להפיל אותו: ליצן חצר בשם הבדחן.", "As a result, people stopped telling jokes, and the kingdom fell into a gloom. But there was one person who refused to let the king's foolishness get him down: a court jester named Jokester.")}</p>
      <h3 class="doc-typography-h3">{text("ثورة المازح", "המרד של הבדחן", "Jokester's Revolt")}</h3>
      <p class="doc-typography-p">{text("بدأ المازح يتسلل إلى القلعة في منتصف الليل ويترك النكات في كل مكان: تحت وسادة الملك، في حسائه، حتى في المرحاض الملكي. كان الملك غاضباً، لكنه لم يستطع إيقاف المازح.", "הבדחן התחיל להתגנב לטירה באמצע הלילה ולהשאיר בדיחות בכל מקום: מתחת לכרית המלך, במרק שלו, אפילו בשירותים המלכותיים. המלך היה זועם, אבל הוא לא הצליח לעצור את הבדחן.", "Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the place: under the king's pillow, in his soup, even in the royal toilet. The king was furious, but he couldn't seem to stop Jokester.")}</p>
      <p class="doc-typography-p">{text("وبعد ذلك، في يوم من الأيام، اكتشف سكان المملكة أن النكات التي تركها المازح كانت مضحكة جداً لدرجة أنهم لم يستطيعوا منع أنفسهم من الضحك. وبمجرد أن بدأوا بالضحك، لم يستطيعوا التوقف.", "ואז, יום אחד, תושבי הממלכה גילו שהבדיחות שהבדחן השאיר היו כל כך מצחיקות שהם לא יכלו להתאפק מלצחוק. וברגע שהתחילו לצחוק, הם לא יכלו להפסיק.", "And then, one day, the people of the kingdom discovered that the jokes left by Jokester were so funny that they couldn't help but laugh. And once they started laughing, they couldn't stop.")}</p>
      <h3 class="doc-typography-h3">{text("ثورة الشعب", "המרד של העם", "The People's Rebellion")}</h3>
      <p class="doc-typography-p">{text("شعر سكان المملكة بالبهجة من الضحك، وبدأوا في رواية النكات والتورية مرة أخرى، وسرعان ما أصبحت المملكة بأكملها جزءاً من النكتة.", "תושבי הממלכה, שהרגישו מרוממים מהצחוק, התחילו לספר בדיחות ומשחקי מילים שוב, ובקרוב כל הממלכה הייתה חלק מהבדיחה.", "The people of the kingdom, feeling uplifted by the laughter, started to tell jokes and puns again, and soon the entire kingdom was in on the joke.")}</p>
      <div class="doc-typography-table-wrap">
        <table class="doc-typography-table">
          <thead>
            <tr>
              <th>{text("خزينة الملك", "אוצר המלך", "King's Treasury")}</th>
              <th>{text("سعادة الشعب", "אושר העם", "People's happiness")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{text("فارغة", "ריק", "Empty")}</td>
              <td>{text("فائضة", "גדוש", "Overflowing")}</td>
            </tr>
            <tr>
              <td>{text("متواضعة", "צנוע", "Modest")}</td>
              <td>{text("راضٍ", "מרוצה", "Satisfied")}</td>
            </tr>
            <tr>
              <td>{text("ممتلئة", "מלא", "Full")}</td>
              <td>{text("منتشٍ", "אקסטטי", "Ecstatic")}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="doc-typography-p">{text("الملك، عندما رأى مدى سعادة رعاياه، أدرك خطأ طرقه وألغى ضريبة النكتة. أُعلن المازح بطلاً، وعاشت المملكة في سعادة دائمة.", "המלך, כשראה כמה מאושרים נתיניו, הבין את טעותו וביטל את מס הבדיחה. הבדחן הוכרז כגיבור, והממלכה חיה באושר לנצח.", "The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax. Jokester was declared a hero, and the kingdom lived happily ever after.")}</p>
      <p class="doc-typography-p">{text("مغزى القصة هو: لا تستهن أبداً بقوة الضحك الجيد وكن دائماً حذراً من الأفكار السيئة.", "המוסר של הסיפור הוא: לעולם אל תזלזל בכוח של צחוק טוב ותמיד היזהר מרעיונות רעים.", "The moral of the story is: never underestimate the power of a good laugh and always be careful of bad ideas.")}</p>
    </div>
  )

  if (variant === "h1") return <h1 class="doc-typography-h1">Taxing Laughter: The Joke Tax Chronicles</h1>
  if (variant === "h2") return <h2 class="doc-typography-h2">The People of the Kingdom</h2>
  if (variant === "h3") return <h3 class="doc-typography-h3">The Joke Tax</h3>
  if (variant === "h4") return <h4 class="doc-typography-h4">People stopped telling jokes</h4>
  if (variant === "p") return <p class="doc-typography-p">The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax.</p>
  if (variant === "blockquote") return <blockquote class="doc-typography-blockquote">"After all," he said, "everyone enjoys a good joke, so it's only fair that they should pay for the privilege."</blockquote>
  if (variant === "list") return <ul class="doc-typography-list"><li>1st level of puns: 5 gold coins</li><li>2nd level of jokes: 10 gold coins</li><li>3rd level of one-liners : 20 gold coins</li></ul>
  if (variant === "inline-code") return <code class="doc-typography-inline-code">@radix-ui/react-alert-dialog</code>
  if (variant === "lead") return <p class="doc-typography-lead">A modal dialog that interrupts the user with important content and expects a response.</p>
  if (variant === "large") return <div class="doc-typography-large">Are you absolutely sure?</div>
  if (variant === "small") return <small class="doc-typography-small">Email address</small>
  if (variant === "muted") return <p class="doc-typography-muted">Enter your email address.</p>
  if (variant === "table") {
    return (
      <div class="doc-typography-table-wrap">
        <table class="doc-typography-table">
          <thead>
            <tr>
              <th>King's Treasury</th>
              <th>People's happiness</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Empty</td><td>Overflowing</td></tr>
            <tr><td>Modest</td><td>Satisfied</td></tr>
            <tr><td>Full</td><td>Ecstatic</td></tr>
          </tbody>
        </table>
      </div>
    )
  }
  if (rtl) {
    return (
      <div class="doc-rtl-preview-shell">
        <div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div>
        <div class="doc-rtl-preview doc-typography-rtl-preview" dir="rtl" data-lang="ar">{article()}</div>
      </div>
    )
  }
  return article()
}

function DocTablePreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("table-", ""))
  const rtl = variant === "rtl"
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const invoices = [
    ["INV001", ["مدفوع", "שולם", "Paid"], ["بطاقة ائتمانية", "כרטיס אשראי", "Credit Card"], "$250.00"],
    ["INV002", ["قيد الانتظار", "ממתין", "Pending"], ["PayPal", "PayPal", "PayPal"], "$150.00"],
    ["INV003", ["غير مدفوع", "לא שולם", "Unpaid"], ["تحويل بنكي", "העברה בנקאית", "Bank Transfer"], "$350.00"],
    ["INV004", ["مدفوع", "שולם", "Paid"], ["بطاقة ائتمانية", "כרטיס אשראי", "Credit Card"], "$450.00"],
    ["INV005", ["مدفوع", "שולם", "Paid"], ["PayPal", "PayPal", "PayPal"], "$550.00"],
    ["INV006", ["قيد الانتظار", "ממתין", "Pending"], ["تحويل بنكي", "העברה בנקאית", "Bank Transfer"], "$200.00"],
    ["INV007", ["غير مدفوع", "לא שולם", "Unpaid"], ["بطاقة ائتمانية", "כרטיס אשראי", "Credit Card"], "$300.00"],
  ] as const
  const invoiceTable = (rows: number) => <div class="doc-table-scroll"><table class="doc-table" dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}><caption>{text("قائمة بفواتيرك الأخيرة.", "רשימת החשבוניות האחרונות שלך.", "A list of your recent invoices.")}</caption><thead><tr><th class="is-invoice">{text("الفاتورة", "חשבונית", "Invoice")}</th><th>{text("الحالة", "סטטוס", "Status")}</th><th>{text("الطريقة", "שיטה", "Method")}</th><th class="is-numeric">{text("المبلغ", "סכום", "Amount")}</th></tr></thead><tbody>{invoices.slice(0, rows).map((invoice) => <tr><td><strong>{invoice[0]}</strong></td><td>{text(invoice[1][0], invoice[1][1], invoice[1][2])}</td><td>{text(invoice[2][0], invoice[2][1], invoice[2][2])}</td><td class="is-numeric">{invoice[3]}</td></tr>)}</tbody><tfoot><tr><td colSpan={3}>{text("المجموع", 'סה"כ', "Total")}</td><td class="is-numeric">$2,500.00</td></tr></tfoot></table></div>
  const actionRows = [["Wireless Mouse", "$29.99"], ["Mechanical Keyboard", "$129.99"], ["USB-C Hub", "$49.99"]]
  const actions = <div class="doc-table-scroll"><table class="doc-table doc-table-actions"><thead><tr><th>Product</th><th>Price</th><th class="is-numeric">Actions</th></tr></thead><tbody>{actionRows.map((row) => <tr><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td class="is-numeric"><span class="ui-menu doc-table-menu" data-menu><button type="button" class="doc-table-action" data-menu-trigger aria-label={`Open menu for ${row[0]}`} aria-haspopup="menu" aria-expanded="false">•••</button><div class="ui-menu-panel doc-table-menu-panel" data-menu-panel data-menu-side="bottom" data-menu-align="end" role="menu" hidden><button type="button" class="ui-menu-item" data-menu-item role="menuitem">Edit</button><button type="button" class="ui-menu-item" data-menu-item role="menuitem">Duplicate</button><span class="ui-menu-separator"></span><button type="button" class="ui-menu-item is-destructive" data-menu-item role="menuitem">Delete</button></div></span></td></tr>)}</tbody></table></div>
  const content = variant === "actions" ? actions : invoiceTable(variant === "footer" ? 3 : 7)
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-table-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocTabsPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("tabs-", ""))
  const rtl = variant === "rtl"
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  const entries = [
    { value: "overview", label: ["نظرة عامة", "סקירה כללית", "Overview"], description: ["عرض مقاييسك الرئيسية وأنشطة المشروع الأخيرة. تتبع التقدم عبر جميع مشاريعك النشطة.", "הצג את המדדים העיקריים שלך ופעילות הפרויקט האחרונה. עקוב אחר התקדמות בכל הפרויקטים הפעילים שלך.", "View your key metrics and recent project activity. Track progress across all your active projects."], content: ["لديك ١٢ مشروعًا نشطًا و٣ مهام معلقة.", "יש לך 12 פרויקטים פעילים ו-3 משימות ממתינות.", "You have 12 active projects and 3 pending tasks."] },
    { value: "analytics", label: ["التحليلات", "אנליטיקה", "Analytics"], description: ["تتبع مقاييس الأداء ومشاركة المستخدمين. راقب الاتجاهات وحدد فرص النمو.", "עקוב אחר ביצועים ומדדי מעורבות משתמשים. עקוב אחר מגמות וזהה הזדמנויות צמיחה.", "Track performance and user engagement metrics. Monitor trends and identify growth opportunities."], content: ["زادت مشاهدات الصفحة بنسبة ٢٥٪ مقارنة بالشهر الماضي.", "צפיות בדף עלו ב-25% בהשוואה לחודש שעבר.", "Page views are up 25% compared to last month."] },
    { value: "reports", label: ["التقارير", "דוחות", "Reports"], description: ["إنشاء وتنزيل تقاريرك التفصيلية. تصدير البيانات بتنسيقات متعددة للتحليل.", "צור והורד את הדוחות המפורטים שלך. ייצא נתונים בפורמטים מרובים לניתוח.", "Generate and download your detailed reports. Export data in multiple formats for analysis."], content: ["لديك ٥ تقارير جاهزة ومتاحة للتصدير.", "יש לך 5 דוחות מוכנים וזמינים לייצוא.", "You have 5 reports ready and available to export."] },
    { value: "settings", label: ["الإعدادات", "הגדרות", "Settings"], description: ["إدارة تفضيلات حسابك وخياراته. تخصيص تجربتك لتناسب احتياجاتك.", "נהל את העדפות החשבון והאפשרויות שלך. התאם אישית את החוויה שלך כך שתתאים לצרכים שלך.", "Manage your account preferences and options. Customize your experience to fit your needs."], content: ["تكوين الإشعارات والأمان والسمات.", "הגדר התראות, אבטחה וערכות נושא.", "Configure notifications, security, and themes."] },
  ] as const
  const simple = variant === "line" ? entries.slice(0, 3) : variant === "vertical" ? [{ value: "account", label: ["", "", "Account"] }, { value: "password", label: ["", "", "Password"] }, { value: "notifications", label: ["", "", "Notifications"] }] : variant === "disabled" ? [{ value: "home", label: ["", "", "Home"] }, { value: "disabled", label: ["", "", "Disabled"], disabled: true }] : variant === "icons" ? [{ value: "preview", label: ["", "", "Preview"], icon: "preview" }, { value: "code", label: ["", "", "Code"], icon: "code" }] : entries
  const withPanels = variant === "demo" || rtl
  const tabs = <div class={`doc-preview-tabs${variant === "line" ? " is-line" : ""}${variant === "vertical" ? " is-vertical" : ""}`} data-doc-preview-tabs data-orientation={variant === "vertical" ? "vertical" : "horizontal"} dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}><div class="doc-preview-tabs-list" role="tablist" aria-orientation={variant === "vertical" ? "vertical" : "horizontal"}>{simple.map((entry, index) => <button type="button" role="tab" class="doc-preview-tab" data-doc-preview-tab data-value={entry.value} aria-selected={index === 0 ? "true" : "false"} tabIndex={index === 0 ? 0 : -1} disabled={"disabled" in entry ? entry.disabled : false}>{"icon" in entry ? <DocSidebarIcon kind={entry.icon === "code" ? "models" : "playground"} /> : null}{text(entry.label[0], entry.label[1], entry.label[2])}</button>)}</div>{withPanels ? <div class="doc-preview-tab-panels">{entries.map((entry, index) => <div class="doc-preview-tab-panel" role="tabpanel" data-doc-preview-tab-panel data-value={entry.value} hidden={index !== 0}><div class="doc-preview-tabs-card"><h3>{text(entry.label[0], entry.label[1], entry.label[2])}</h3><p>{text(entry.description[0], entry.description[1], entry.description[2])}</p><div>{text(entry.content[0], entry.content[1], entry.content[2])}</div></div></div>)}</div> : null}</div>
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-tabs-rtl-preview" dir="rtl" data-lang="ar">{tabs}</div></div> : tabs
}

function DocTextareaPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("textarea-", ""))
  const rtl = variant === "rtl"
  const textarea = (options: { id?: string; disabled?: boolean; invalid?: boolean; placeholder?: string } = {}) => <textarea id={options.id} class="doc-textarea" aria-invalid={options.invalid ? "true" : undefined} disabled={options.disabled} placeholder={options.placeholder ?? "Type your message here."} data-doc-rtl-placeholder={rtl ? "true" : undefined} data-placeholder-ar={rtl ? "تعليقاتك تساعدنا على التحسين..." : undefined} data-placeholder-he={rtl ? "המשוב שלך עוזר לנו להשתפר..." : undefined} data-placeholder-en={rtl ? "Your feedback helps us improve..." : undefined} dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}></textarea>
  const field = (options: { label: any; description?: any; disabled?: boolean; invalid?: boolean }) => <div class={`doc-textarea-field${options.disabled ? " is-disabled" : ""}${options.invalid ? " is-invalid" : ""}`} dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}><label for={rtl ? "feedback" : options.invalid ? "textarea-invalid" : options.disabled ? "textarea-disabled" : "textarea-message"}>{options.label}</label>{!options.invalid && options.description ? <p>{options.description}</p> : null}{textarea({ id: rtl ? "feedback" : options.invalid ? "textarea-invalid" : options.disabled ? "textarea-disabled" : "textarea-message", disabled: options.disabled, invalid: options.invalid, placeholder: rtl ? "تعليقاتك تساعدنا على التحسين..." : undefined })}{options.invalid && options.description ? <p>{options.description}</p> : null}</div>
  let content
  if (variant === "field") content = field({ label: "Message", description: "Enter your message below." })
  else if (variant === "disabled") content = field({ label: "Message", disabled: true })
  else if (variant === "invalid") content = field({ label: "Message", description: "Please enter a valid message.", invalid: true })
  else if (variant === "button") content = <div class="doc-textarea-button">{textarea()}<button type="button" class="doc-button is-default">Send message</button></div>
  else if (rtl) content = field({ label: <span data-doc-rtl-text data-text-ar="التعليقات" data-text-he="משוב" data-text-en="Feedback">التعليقات</span>, description: <span data-doc-rtl-text data-text-ar="شاركنا أفكارك حول خدمتنا." data-text-he="שתף את מחשבותיך על השירות שלנו." data-text-en="Share your thoughts about our service.">شاركنا أفكارك حول خدمتنا.</span> })
  else content = textarea()
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-textarea-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocToggleIcon(props: { kind: "bookmark" | "italic" | "bold" | "underline" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{props.kind === "bookmark" ? <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z"></path> : props.kind === "italic" ? <><path d="M19 4h-9"></path><path d="M14 20H5"></path><path d="M15 4 9 20"></path></> : props.kind === "underline" ? <><path d="M6 4v6a6 6 0 0 0 12 0V4"></path><path d="M4 20h16"></path></> : <><path d="M6 4h8a4 4 0 0 1 0 8H6z"></path><path d="M6 12h9a4 4 0 0 1 0 8H6z"></path></>}</svg>
}

function DocTogglePreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("toggle-", ""))
  const rtl = variant === "rtl"
  const toggle = (label: any, options: { ariaLabel: string; outline?: boolean; size?: "sm" | "default" | "lg"; disabled?: boolean; icon?: "bookmark" | "italic" | "bold" }) => <button type="button" class={`doc-toggle${options.outline ? " is-outline" : ""} is-${options.size ?? "default"}`} aria-label={options.ariaLabel} aria-pressed="false" data-toggle="doc" data-toggle-active="false" disabled={options.disabled} dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}>{options.icon ? <DocToggleIcon kind={options.icon} /> : null}{label}</button>
  let content
  if (variant === "outline") content = <div class="doc-toggle-row">{toggle("Italic", { ariaLabel: "Toggle italic", outline: true, icon: "italic" })}{toggle("Bold", { ariaLabel: "Toggle bold", outline: true, icon: "bold" })}</div>
  else if (variant === "text") content = toggle("Italic", { ariaLabel: "Toggle italic", icon: "italic" })
  else if (variant === "sizes") content = <div class="doc-toggle-row">{toggle("Small", { ariaLabel: "Toggle small", outline: true, size: "sm" })}{toggle("Default", { ariaLabel: "Toggle default", outline: true })}{toggle("Large", { ariaLabel: "Toggle large", outline: true, size: "lg" })}</div>
  else if (variant === "disabled") content = <div class="doc-toggle-row">{toggle("Disabled", { ariaLabel: "Toggle disabled", disabled: true })}{toggle("Disabled", { ariaLabel: "Toggle disabled outline", outline: true, disabled: true })}</div>
  else if (rtl) content = toggle(<span data-doc-rtl-text data-text-ar="إشارة مرجعية" data-text-he="סימנייה" data-text-en="Bookmark">إشارة مرجعية</span>, { ariaLabel: "Toggle bookmark", outline: true, size: "sm", icon: "bookmark" })
  else content = toggle("Bookmark", { ariaLabel: "Toggle bookmark", outline: true, size: "sm", icon: "bookmark" })
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-toggle-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

type DocToggleGroupItem = { value: string; label?: string; ariaLabel?: string; icon?: "bold" | "italic" | "underline"; pressed?: boolean; disabled?: boolean; labelAr?: string; labelHe?: string }

function DocToggleGroupPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("toggle-group-", ""))
  const rtl = variant === "rtl"
  const group = (items: DocToggleGroupItem[], options: { multiple?: boolean; outline?: boolean; size?: "sm" | "default" | "lg"; spacing?: number; vertical?: boolean; disabled?: boolean; font?: boolean } = {}) => <div class={`doc-toggle-group${options.outline ? " is-outline" : ""}${options.vertical ? " is-vertical" : ""}${options.font ? " is-font" : ""} is-${options.size ?? "default"}`} role="group" data-doc-toggle-group data-type={options.multiple ? "multiple" : "single"} data-orientation={options.vertical ? "vertical" : "horizontal"} data-spacing={options.spacing ?? 0} dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}>{items.map((item, index) => <button type="button" class="doc-toggle-group-item" data-doc-toggle-group-item data-value={item.value} aria-label={rtl ? item.labelAr : item.ariaLabel ?? item.label ?? item.value} data-doc-rtl-label={rtl ? "true" : undefined} data-label-ar={item.labelAr} data-label-he={item.labelHe} data-label-en={item.label} aria-pressed={item.pressed ? "true" : "false"} tabIndex={item.pressed || (!items.some((candidate) => candidate.pressed) && index === 0) ? 0 : -1} disabled={options.disabled || item.disabled}>{item.icon ? <DocToggleIcon kind={item.icon} /> : options.font ? <><strong class={`is-${item.value}`}>Aa</strong><small>{item.label}</small></> : rtl ? <span data-doc-rtl-text data-text-ar={item.labelAr} data-text-he={item.labelHe} data-text-en={item.label}>{item.labelAr}</span> : item.label}</button>)}</div>
  const formatItems: DocToggleGroupItem[] = [{ value: "bold", ariaLabel: "Toggle bold", icon: "bold" }, { value: "italic", ariaLabel: "Toggle italic", icon: "italic" }, { value: "underline", ariaLabel: "Toggle underline", icon: "underline" }]
  const directionItems: DocToggleGroupItem[] = ["Top", "Bottom", "Left", "Right"].map((label, index) => ({ value: label.toLowerCase(), label, ariaLabel: `Toggle ${label.toLowerCase()}`, pressed: index === 0 }))
  let content
  if (variant === "demo") content = group(formatItems, { multiple: true, outline: true })
  else if (variant === "outline") content = group([{ value: "all", label: "All", pressed: true }, { value: "missed", label: "Missed" }], { outline: true })
  else if (variant === "sizes") content = <div class="doc-toggle-group-stack">{group(directionItems, { outline: true, size: "sm" })}{group(directionItems, { outline: true })}</div>
  else if (variant === "spacing") content = group(directionItems, { outline: true, size: "sm", spacing: 2 })
  else if (variant === "vertical") content = group([{ ...formatItems[0], pressed: true }, { ...formatItems[1], pressed: true }, formatItems[2]], { multiple: true, vertical: true, spacing: 1 })
  else if (variant === "disabled") content = group(formatItems, { multiple: true, disabled: true })
  else if (variant === "font-weight-selector") content = <div class="doc-toggle-font-field"><label>Font Weight</label>{group(["light", "normal", "medium", "bold"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1), pressed: value === "normal" })), { outline: true, size: "lg", spacing: 2, font: true })}<p>Use <code data-doc-toggle-font-output>font-normal</code> to set the font weight.</p></div>
  else content = group([{ value: "list", label: "List", labelAr: "قائمة", labelHe: "רשימה", pressed: true }, { value: "grid", label: "Grid", labelAr: "شبكة", labelHe: "רשת" }, { value: "cards", label: "Cards", labelAr: "بطاقات", labelHe: "כרטיסים" }], { outline: true })
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-toggle-group-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocTooltipPreview(props: { name: string }) {
  const variant = untrack(() => props.name.replace("tooltip-", ""))
  const rtl = variant === "rtl"
  const tooltipButton = (label: any, options: { side?: "left" | "top" | "bottom" | "right"; tooltip?: string; tooltipAr?: string; tooltipHe?: string; ariaLabel?: string } = {}) => <button type="button" class="doc-button is-outline doc-tooltip-button" data-tooltip={rtl ? options.tooltipAr ?? options.tooltip ?? "Add to library" : options.tooltip ?? "Add to library"} data-tooltip-side={options.side ?? "top"} data-doc-tooltip="true" data-doc-rtl-tooltip={rtl ? "true" : undefined} data-tooltip-ar={options.tooltipAr} data-tooltip-he={options.tooltipHe} data-tooltip-en={options.tooltip} aria-label={options.ariaLabel}>{label}</button>
  const sides = ["left", "top", "bottom", "right"] as const
  let content
  if (variant === "sides") content = <div class="doc-tooltip-row">{sides.map((side) => tooltipButton(side, { side }))}</div>
  else if (variant === "keyboard") content = <button type="button" class="doc-button is-outline is-icon-sm doc-tooltip-button" aria-label="Save changes" data-tooltip="Save Changes" data-tooltip-kbd="S" data-tooltip-side="top" data-doc-tooltip="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.2 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.8z"></path><path d="M17 21v-8H7v8"></path><path d="M7 3v5h8"></path></svg></button>
  else if (variant === "disabled") content = <span class="doc-tooltip-disabled" data-tooltip="This feature is currently unavailable" data-tooltip-side="top" data-doc-tooltip="true"><button type="button" class="doc-button is-outline" disabled>Disabled</button></span>
  else if (rtl) content = <div class="doc-tooltip-row" dir="rtl" data-doc-rtl-direction="true">{sides.map((side) => {
    const labels = side === "left" ? ["يسار", "שמאל", "Left"] : side === "top" ? ["أعلى", "למעלה", "Top"] : side === "bottom" ? ["أسفل", "למטה", "Bottom"] : ["يمين", "ימין", "Right"]
    return tooltipButton(<span data-doc-rtl-text data-text-ar={labels[0]} data-text-he={labels[1]} data-text-en={labels[2]}>{labels[0]}</span>, { side, tooltip: "Add to library", tooltipAr: "إضافة إلى المكتبة", tooltipHe: "הוסף לספרייה", ariaLabel: labels[0] })
  })}</div>
  else content = tooltipButton("Hover")
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-tooltip-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocEmptyPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const variant = name.replace("empty-", "")
  const rtl = variant === "rtl"
  const title = rtl ? "لا توجد مشاريع بعد" : variant === "outline" ? "Cloud Storage Empty" : variant === "background" ? "No Notifications" : variant === "avatar" ? "User Offline" : variant === "avatar-group" ? "No Team Members" : variant === "input-group" ? "404 - Not Found" : "No Projects Yet"
  const description = rtl ? "لم تقم بإنشاء أي مشاريع بعد. ابدأ بإنشاء مشروعك الأول." : variant === "outline" ? "Upload files to your cloud storage to access them anywhere." : variant === "background" ? "You're all caught up. New notifications will appear here." : variant === "avatar" ? "This user is currently offline. You can leave a message to notify them or try again later." : variant === "avatar-group" ? "Invite your team to collaborate on this project." : variant === "input-group" ? "The page you're looking for doesn't exist. Try searching for what you need below." : "You haven't created any projects yet. Get started by creating your first project."
  const icon = variant === "avatar" ? <div class="doc-empty-avatar"><img src="/avatars/shadcn.jpg" alt="shadcn" /></div> : variant === "avatar-group" ? <div class="doc-empty-avatar-group"><img src="/avatars/shadcn.jpg" alt="shadcn" /><img src="/avatars/02.png" alt="maxleiter" /><img src="/avatars/03.png" alt="evilrabbit" /></div> : variant === "input-group" ? null : <div class="doc-empty-media" data-variant="icon">{renderDocDropdownIcon(variant === "background" ? "bell" : variant === "outline" ? "cloud" : "folder")}</div>
  const empty = (
    <div class={`doc-empty is-${variant}`} data-slot="empty" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
      <div class="doc-empty-header">
        {icon}
        <h3 data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "لا توجد مشاريع بعد" : undefined} data-text-he={rtl ? "אין פרויקטים עדיין" : undefined} data-text-en={rtl ? "No Projects Yet" : undefined}>{title}</h3>
        <p data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "لم تقم بإنشاء أي مشاريع بعد. ابدأ بإنشاء مشروعك الأول." : undefined} data-text-he={rtl ? "עדיין לא יצרת פרויקטים. התחל על ידי יצירת הפרויקט הראשון שלך." : undefined} data-text-en={rtl ? "You haven't created any projects yet. Get started by creating your first project." : undefined}>{description}</p>
      </div>
      {variant === "input-group" ? (
        <div class="doc-empty-content"><label class="doc-empty-input-group">{renderDocButtonIcon("search")}<input type="search" aria-label="Search pages" placeholder="Try searching for pages..." /><kbd>/</kbd></label><p>Need help? <a href="#">Contact support</a></p></div>
      ) : variant === "demo" || rtl ? (
        <><div class="doc-empty-content is-row"><button type="button" class="doc-button is-default"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "إنشاء مشروع" : undefined} data-text-he={rtl ? "צור פרויקט" : undefined} data-text-en={rtl ? "Create Project" : undefined}>{rtl ? "إنشاء مشروع" : "Create Project"}</span></button><button type="button" class="doc-button is-outline"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "استيراد مشروع" : undefined} data-text-he={rtl ? "ייבא פרויקט" : undefined} data-text-en={rtl ? "Import Project" : undefined}>{rtl ? "استيراد مشروع" : "Import Project"}</span></button></div><a class="doc-empty-learn" href="#"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "تعرف على المزيد" : undefined} data-text-he={rtl ? "למד עוד" : undefined} data-text-en={rtl ? "Learn More" : undefined}>{rtl ? "تعرف على المزيد" : "Learn More"}</span>{renderDocButtonIcon("arrow-up-right")}</a></>
      ) : (
        <div class="doc-empty-content"><button type="button" class={`doc-button ${variant === "outline" || variant === "background" ? "is-outline" : "is-default"}${variant === "outline" || variant === "avatar" || variant === "avatar-group" ? " doc-empty-small-button" : ""}`}>{variant === "outline" ? "Upload Files" : variant === "background" ? <>{renderDocDropdownIcon("refresh")}Refresh</> : variant === "avatar" ? "Leave Message" : <>{renderDocButtonIcon("plus")}Invite Members</>}</button></div>
      )}
    </div>
  )
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-empty-rtl-preview" dir="rtl" data-lang="ar">{empty}</div></div> : empty
}

type DocDropdownEntry = {
  type?: "item" | "label" | "separator" | "checkbox" | "radio" | "submenu"
  label?: string
  labelHe?: string
  labelEn?: string
  shortcut?: string
  icon?: string
  disabled?: boolean
  destructive?: boolean
  selected?: boolean
  value?: string
  children?: DocDropdownEntry[]
}

function renderDocDropdownIcon(kind: string) {
  return kind === "cloud" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H6a4 4 0 0 1-.5-8A6.5 6.5 0 0 1 18 9.5a4.8 4.8 0 0 1-.5 9.5Z"></path></svg>
  ) : kind === "refresh" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6v5h-5M4 18v-5h5M6.1 9a7 7 0 0 1 11.5-2.4L20 9M4 15l2.4 2.4A7 7 0 0 0 18 15"></path></svg>
  ) : kind === "card" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path></svg>
  ) : kind === "settings" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.5h-4L10.4 6a8 8 0 0 0-1.5 1.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.5 1.1l.3 2.5h4L15 18a8 8 0 0 0 1.5-1.1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z"></path></svg>
  ) : kind === "mail" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>
  ) : kind === "bell" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"></path></svg>
  ) : kind === "trash" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"></path></svg>
  ) : kind === "folder" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h7l2 2h9v11H3z"></path></svg>
  ) : kind === "file" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h9l4 4v14H6zM14 3v5h5"></path></svg>
  ) : kind === "save" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3h12l2 2v16H5zM8 3v6h8V3M8 21v-7h8v7"></path></svg>
  ) : kind === "help" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"></path></svg>
  ) : kind === "logout" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 17l5-5-5-5M15 12H3M15 4h5v16h-5"></path></svg>
  ) : kind === "edit" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 20 4-1 11-11-3-3L5 16zM14 7l3 3"></path></svg>
  ) : kind === "share" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="2"></circle><circle cx="6" cy="12" r="2"></circle><circle cx="18" cy="19" r="2"></circle><path d="m8 11 8-5M8 13l8 5"></path></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>
  )
}

function DocDropdownEntries(props: { entries: DocDropdownEntry[]; rtl?: boolean }) {
  const entries = untrack(() => props.entries)
  const rtl = untrack(() => !!props.rtl)
  const text = (entry: DocDropdownEntry) => rtl ? <span data-doc-rtl-text data-text-ar={entry.label} data-text-he={entry.labelHe} data-text-en={entry.labelEn}>{entry.label}</span> : entry.label
  return (
    <>
      {entries.map((entry) => entry.type === "separator" ? (
        <span class="ui-menu-separator" aria-hidden="true"></span>
      ) : entry.type === "label" ? (
        <span class="ui-menu-label">{text(entry)}</span>
      ) : entry.type === "submenu" ? (
        <span class="ui-menu-sub ui-menu doc-dropdown-menu" data-menu>
          <button type="button" class="ui-menu-item doc-dropdown-sub-trigger" role="menuitem" data-menu-item data-menu-trigger aria-haspopup="menu" aria-expanded="false">{entry.icon ? renderDocDropdownIcon(entry.icon) : null}{text(entry)}<span class="doc-dropdown-chevron" aria-hidden="true">›</span></button>
          <div class="ui-menu-panel doc-dropdown-panel doc-dropdown-sub-panel" data-menu-panel data-menu-side={rtl ? "left" : "right"} role="menu" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"} hidden><DocDropdownEntries entries={entry.children ?? []} rtl={rtl} /></div>
        </span>
      ) : (
        <button type="button" class={`ui-menu-item doc-dropdown-item${entry.destructive ? " is-destructive" : ""}`} role={entry.type === "checkbox" ? "menuitemcheckbox" : entry.type === "radio" ? "menuitemradio" : "menuitem"} aria-checked={entry.type === "checkbox" || entry.type === "radio" ? (entry.selected ? "true" : "false") : undefined} data-selected={entry.type === "checkbox" || entry.type === "radio" ? (entry.selected ? "true" : "false") : undefined} data-menu-item data-doc-dropdown-checkbox={entry.type === "checkbox" ? "true" : undefined} data-doc-dropdown-radio={entry.type === "radio" ? "true" : undefined} data-doc-dropdown-radio-value={entry.type === "radio" ? entry.value : undefined} disabled={entry.disabled}>
          {entry.type === "checkbox" ? <span class="doc-dropdown-check" aria-hidden="true">✓</span> : entry.type === "radio" ? <span class="doc-dropdown-radio" aria-hidden="true">●</span> : null}
          {entry.icon ? renderDocDropdownIcon(entry.icon) : null}{text(entry)}{entry.shortcut ? <span class="doc-dropdown-shortcut">{entry.shortcut}</span> : null}
        </button>
      ))}
    </>
  )
}

function getDocDropdownEntries(variant: string, rtl: boolean): DocDropdownEntry[] {
  const sep = (): DocDropdownEntry => ({ type: "separator" })
  const label = (value: string): DocDropdownEntry => ({ type: "label", label: value })
  const account = [label("My Account"), { label: "Profile", shortcut: "⇧⌘P" }, { label: "Billing", shortcut: "⌘B" }, { label: "Settings", shortcut: "⌘S" }]
  if (rtl) return [
    { type: "submenu", label: "الحساب", labelHe: "חשבון", labelEn: "Account", children: [{ label: "الملف الشخصي", labelHe: "פרופיל", labelEn: "Profile", icon: "user" }, { label: "الفوترة", labelHe: "חיוב", labelEn: "Billing", icon: "card" }, { label: "الإعدادات", labelHe: "הגדרות", labelEn: "Settings", icon: "settings" }] }, sep(),
    { type: "label", label: "الفريق", labelHe: "הצוות", labelEn: "Team" }, { label: "الفريق", labelHe: "הצוות", labelEn: "Team" }, { type: "submenu", label: "دعوة المستخدمين", labelHe: "הזמן משתמשים", labelEn: "Invite users", children: [{ label: "البريد الإلكتروني", labelHe: "אימייל", labelEn: "Email" }, { label: "رسالة", labelHe: "הודעה", labelEn: "Message" }, { type: "submenu", label: "المزيد", labelHe: "עוד", labelEn: "More", children: [{ label: "تقويم", labelHe: "יומן", labelEn: "Calendar" }, { label: "دردشة", labelHe: "צ'אט", labelEn: "Chat" }, sep(), { label: "خطاف ويب", labelHe: "Webhook", labelEn: "Webhook" }] }, sep(), { label: "متقدم...", labelHe: "מתקדם...", labelEn: "Advanced..." }] }, { label: "فريق جديد", labelHe: "צוות חדש", labelEn: "New Team", shortcut: "⌘+T" }, sep(),
    { type: "label", label: "عرض", labelHe: "תצוגה", labelEn: "View" }, { type: "checkbox", label: "شريط الحالة", labelHe: "שורת סטטוס", labelEn: "Status Bar", selected: true }, { type: "checkbox", label: "شريط النشاط", labelHe: "שורת פעילות", labelEn: "Activity Bar" }, { type: "checkbox", label: "اللوحة", labelHe: "לוח", labelEn: "Panel" }, sep(),
    { type: "label", label: "الموضع", labelHe: "מיקום", labelEn: "Position" }, { type: "radio", label: "أعلى", labelHe: "למעלה", labelEn: "Top", value: "top" }, { type: "radio", label: "أسفل", labelHe: "למטה", labelEn: "Bottom", value: "bottom", selected: true }, { type: "radio", label: "يمين", labelHe: "ימין", labelEn: "Right", value: "right" }, { type: "radio", label: "يسار", labelHe: "שמאל", labelEn: "Left", value: "left" }, sep(), { label: "تسجيل الخروج", labelHe: "התנתק", labelEn: "Log out", destructive: true },
  ]
  if (variant === "demo") return [...account, sep(), { label: "Team" }, { type: "submenu", label: "Invite users", children: [{ label: "Email" }, { label: "Message" }, sep(), { label: "More..." }] }, { label: "New Team", shortcut: "⌘+T" }, sep(), { label: "GitHub" }, { label: "Support" }, { label: "API", disabled: true }, sep(), { label: "Log out", shortcut: "⇧⌘Q" }]
  if (variant === "basic") return [label("My Account"), { label: "Profile" }, { label: "Billing" }, { label: "Settings" }, sep(), { label: "GitHub" }, { label: "Support" }, { label: "API", disabled: true }]
  if (variant === "submenu") return [{ label: "Team" }, { type: "submenu", label: "Invite users", children: [{ label: "Email" }, { label: "Message" }, { type: "submenu", label: "More options", children: [{ label: "Calendly" }, { label: "Slack" }, sep(), { label: "Webhook" }] }, sep(), { label: "Advanced..." }] }, { label: "New Team", shortcut: "⌘+T" }]
  if (variant === "shortcuts") return [...account, sep(), { label: "Log out", shortcut: "⇧⌘Q" }]
  if (variant === "icons") return [{ label: "Profile", icon: "user" }, { label: "Billing", icon: "card" }, { label: "Settings", icon: "settings" }, sep(), { label: "Log out", icon: "logout", destructive: true }]
  if (variant === "checkboxes") return [label("Appearance"), { type: "checkbox", label: "Status Bar", selected: true }, { type: "checkbox", label: "Activity Bar", disabled: true }, { type: "checkbox", label: "Panel" }]
  if (variant === "checkboxes-icons") return [label("Notification Preferences"), { type: "checkbox", label: "Email notifications", icon: "mail", selected: true }, { type: "checkbox", label: "SMS notifications", icon: "share" }, { type: "checkbox", label: "Push notifications", icon: "bell", selected: true }]
  if (variant === "radio-group") return [label("Panel Position"), { type: "radio", label: "Top", value: "top" }, { type: "radio", label: "Bottom", value: "bottom", selected: true }, { type: "radio", label: "Right", value: "right" }]
  if (variant === "radio-icons") return [label("Select Payment Method"), { type: "radio", label: "Credit Card", icon: "card", value: "card", selected: true }, { type: "radio", label: "PayPal", icon: "user", value: "paypal" }, { type: "radio", label: "Bank Transfer", icon: "settings", value: "bank" }]
  if (variant === "destructive") return [{ label: "Edit", icon: "edit" }, { label: "Share", icon: "share" }, sep(), { label: "Delete", icon: "trash", destructive: true }]
  if (variant === "avatar") return [{ label: "Account", icon: "user" }, { label: "Billing", icon: "card" }, { label: "Notifications", icon: "bell" }, sep(), { label: "Sign Out", icon: "logout" }]
  return [label("File"), { label: "New File", icon: "file", shortcut: "⌘N" }, { label: "New Folder", icon: "folder", shortcut: "⇧⌘N" }, { type: "submenu", label: "Open Recent", icon: "folder", children: [label("Recent Projects"), { label: "Project Alpha", icon: "file" }, { label: "Project Beta", icon: "file" }, { type: "submenu", label: "More Projects", children: [{ label: "Project Gamma" }, { label: "Project Delta" }] }, sep(), { label: "Browse...", icon: "folder" }] }, sep(), { label: "Save", icon: "file", shortcut: "⌘S" }, { label: "Export", icon: "share", shortcut: "⇧⌘E" }, sep(), label("View"), { type: "checkbox", label: "Show Sidebar", icon: "file", selected: true }, { type: "checkbox", label: "Show Status Bar", icon: "file" }, { type: "submenu", label: "Theme", icon: "settings", children: [label("Appearance"), { type: "radio", label: "Light", value: "light", selected: true }, { type: "radio", label: "Dark", value: "dark" }, { type: "radio", label: "System", value: "system" }] }, sep(), label("Account"), { label: "Profile", icon: "user", shortcut: "⇧⌘P" }, { label: "Billing", icon: "card" }, { type: "submenu", label: "Settings", icon: "settings", children: [label("Preferences"), { label: "Keyboard Shortcuts" }, { label: "Language" }, { type: "submenu", label: "Notifications", icon: "bell", children: [label("Notification Types"), { type: "checkbox", label: "Push Notifications", selected: true }, { type: "checkbox", label: "Email Notifications", selected: true }] }] }, sep(), { label: "Help & Support" }, { label: "Documentation" }, sep(), { label: "Sign Out", icon: "logout", shortcut: "⇧⌘Q", destructive: true }]
}

function DocDropdownMenuPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const variant = name.replace("dropdown-menu-", "")
  const rtl = variant === "rtl"
  const trigger = variant === "checkboxes-icons" ? "Notifications" : variant === "radio-icons" ? "Payment Method" : variant === "destructive" ? "Actions" : variant === "complex" ? "Complex Menu" : rtl ? "افتح القائمة" : "Open"
  const width = variant === "demo" || variant === "checkboxes" ? "is-160" : variant === "checkboxes-icons" ? "is-192" : variant === "radio-icons" ? "is-224" : variant === "complex" ? "is-176" : rtl ? "is-144" : "is-128"
  const menu = <span class="ui-menu doc-dropdown-menu" data-menu data-doc-dropdown-root data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}><button type="button" class={variant === "avatar" ? "doc-dropdown-avatar-trigger" : "doc-button is-outline"} data-menu-trigger aria-haspopup="menu" aria-expanded="false" aria-label={variant === "avatar" ? "Open account menu" : undefined}>{variant === "avatar" ? <img src="/avatars/shadcn.jpg" alt="shadcn" /> : <span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "افتح القائمة" : undefined} data-text-he={rtl ? "פתח תפריט" : undefined} data-text-en={rtl ? "Open" : undefined}>{trigger}</span>}</button><div class={`ui-menu-panel doc-dropdown-panel ${width}`} data-menu-panel data-menu-side="bottom" data-menu-align={rtl ? "end" : variant === "avatar" ? "end" : "start"} role="menu" data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"} hidden><DocDropdownEntries entries={getDocDropdownEntries(variant, rtl)} rtl={rtl} /></div></span>
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-dropdown-rtl-preview" dir="rtl" data-lang="ar">{menu}</div></div> : menu
}

const docDrawerBars = [400, 300, 200, 300, 200, 278, 189, 239, 300, 200, 278, 189, 349]
const docDrawerParagraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

function DocDrawerGoalContent(props: { name: string; rtl?: boolean }) {
  const rtl = untrack(() => !!props.rtl)
  return (
    <div class="doc-drawer-goal-shell">
      <header class="doc-drawer-header">
        <h3 id={`${props.name}-title`} data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "نقل الهدف" : undefined} data-text-he={rtl ? "הזז מטרה" : undefined} data-text-en={rtl ? "Move Goal" : undefined}>{rtl ? "نقل الهدف" : "Move Goal"}</h3>
        <p data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "حدد هدف نشاطك اليومي." : undefined} data-text-he={rtl ? "הגדר את יעד הפעילות היומי שלך." : undefined} data-text-en={rtl ? "Set your daily activity goal." : undefined}>{rtl ? "حدد هدف نشاطك اليومي." : "Set your daily activity goal."}</p>
      </header>
      <div class="doc-drawer-goal-body">
        <div class="doc-drawer-goal-controls">
          <button type="button" class="doc-drawer-round-button" data-doc-drawer-adjust="-10" data-doc-drawer-label={rtl ? "true" : undefined} data-label-ar={rtl ? "تقليل" : undefined} data-label-he={rtl ? "הקטן" : undefined} data-label-en={rtl ? "Decrease" : undefined} aria-label={rtl ? "تقليل" : "Decrease"}><MinusIcon /></button>
          <div class="doc-drawer-goal-value">
            <strong data-doc-drawer-goal>350</strong>
            <span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "سعرات حرارية/يوم" : undefined} data-text-he={rtl ? "קלוריות/יום" : undefined} data-text-en={rtl ? "Calories/day" : undefined}>{rtl ? "سعرات حرارية/يوم" : "Calories/day"}</span>
          </div>
          <button type="button" class="doc-drawer-round-button" data-doc-drawer-adjust="10" data-doc-drawer-label={rtl ? "true" : undefined} data-label-ar={rtl ? "زيادة" : undefined} data-label-he={rtl ? "הגדל" : undefined} data-label-en={rtl ? "Increase" : undefined} aria-label={rtl ? "زيادة" : "Increase"}><PlusIcon /></button>
        </div>
        <div class="doc-drawer-chart" aria-hidden="true">
          {docDrawerBars.map((value) => <span style={`height:${Math.round(value / 4)}%`}></span>)}
        </div>
      </div>
      <footer class="doc-drawer-footer">
        <button type="button" class="doc-button is-default"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "إرسال" : undefined} data-text-he={rtl ? "שלח" : undefined} data-text-en={rtl ? "Submit" : undefined}>{rtl ? "إرسال" : "Submit"}</span></button>
        <button type="button" class="doc-button is-outline" data-doc-drawer-close><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "إلغاء" : undefined} data-text-he={rtl ? "בטל" : undefined} data-text-en={rtl ? "Cancel" : undefined}>{rtl ? "إلغاء" : "Cancel"}</span></button>
      </footer>
    </div>
  )
}

function DocDrawerScrollableBody(props: { name: string }) {
  return (
    <>
      <header class="doc-drawer-header"><h3 id={`${props.name}-title`}>Move Goal</h3><p>Set your daily activity goal.</p></header>
      <div class="doc-drawer-scroll" data-doc-drawer-scroll>{Array.from({ length: 10 }, (_, index) => <p key={index}>{docDrawerParagraph}</p>)}</div>
      <footer class="doc-drawer-footer"><button type="button" class="doc-button is-default">Submit</button><button type="button" class="doc-button is-outline" data-doc-drawer-close>Cancel</button></footer>
    </>
  )
}

function DocDrawerPortal(props: { name: string; side: string; rtl?: boolean; responsive?: boolean; sides?: boolean }) {
  const rtl = untrack(() => !!props.rtl)
  const responsive = untrack(() => !!props.responsive)
  return (
    <div class="doc-drawer-portal" data-doc-drawer-portal hidden>
      <div class="doc-drawer-overlay" data-doc-drawer-overlay></div>
      <div class={`doc-drawer-content is-${props.side}${responsive ? " is-responsive" : ""}${props.sides ? " is-sides" : ""}`} data-doc-drawer-content data-doc-drawer-side={props.side} data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"} role="dialog" aria-modal="true" aria-labelledby={`${props.name}-title`}>
        <div class="doc-drawer-handle" aria-hidden="true"></div>
        {responsive ? (
          <div class="doc-drawer-profile">
            <button type="button" class="doc-dialog-x doc-drawer-responsive-x" aria-label="Close" data-doc-drawer-close>×</button>
            <header class="doc-drawer-header"><h3 id={`${props.name}-title`}>Edit profile</h3><p>Make changes to your profile here. Click save when you're done.</p></header>
            <form class="doc-drawer-profile-form"><label>Email<input type="email" value="shadcn@example.com" /></label><label>Username<input value="@shadcn" /></label><button type="submit" class="doc-button is-default">Save changes</button></form>
            <footer class="doc-drawer-footer doc-drawer-mobile-footer"><button type="button" class="doc-button is-outline" data-doc-drawer-close>Cancel</button></footer>
          </div>
        ) : props.side === "bottom" && (props.name === "drawer-demo" || rtl) ? (
          <DocDrawerGoalContent name={props.name} rtl={rtl} />
        ) : (
          <DocDrawerScrollableBody name={props.name} />
        )}
      </div>
    </div>
  )
}

function DocDrawerPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "drawer-rtl"

  if (name === "drawer-sides") {
    return (
      <div class="doc-drawer-sides">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <div data-doc-drawer-root>
            <button type="button" class="doc-button is-outline doc-drawer-side-trigger" data-doc-drawer-trigger aria-haspopup="dialog" aria-expanded="false">{side}</button>
            <DocDrawerPortal name={`drawer-${side}`} side={side} sides />
          </div>
        ))}
      </div>
    )
  }

  const side = name === "drawer-scrollable-content" ? "right" : "bottom"
  const responsive = name === "drawer-dialog"
  const trigger = responsive ? "Edit Profile" : name === "drawer-scrollable-content" ? "Scrollable Content" : rtl ? "فتح الدرج" : "Open Drawer"
  const drawer = (
    <div class="doc-drawer-preview" data-doc-drawer-root data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
      <button type="button" class="doc-button is-outline" data-doc-drawer-trigger aria-haspopup="dialog" aria-expanded="false"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "فتح الدرج" : undefined} data-text-he={rtl ? "פתח מגירה" : undefined} data-text-en={rtl ? "Open Drawer" : undefined}>{trigger}</span></button>
      <DocDrawerPortal name={name} side={side} rtl={rtl} responsive={responsive} />
    </div>
  )

  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-drawer-rtl-preview" dir="rtl" data-lang="ar">{drawer}</div></div> : drawer
}

function DocDialogPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const variant = name.replace("dialog-", "")
  const rtl = variant === "rtl"
  const trigger = variant === "demo" ? "Open Dialog" : variant === "close-button" ? "Share" : variant === "no-close-button" ? "No Close Button" : variant === "scrollable-content" ? "Scrollable Content" : variant === "sticky-footer" ? "Sticky Footer" : "فتح الحوار"
  const title = variant === "demo" || rtl ? (rtl ? "تعديل الملف الشخصي" : "Edit profile") : variant === "close-button" ? "Share link" : variant === "no-close-button" ? "No Close Button" : variant === "scrollable-content" ? "Scrollable Content" : "Sticky Footer"
  const description = variant === "demo" || rtl ? (rtl ? "قم بإجراء تغييرات على ملفك الشخصي هنا. انقر فوق حفظ عند الانتهاء." : "Make changes to your profile here. Click save when you're done.") : variant === "close-button" ? "Anyone who has this link will be able to view this." : variant === "no-close-button" ? "This dialog doesn't have a close button in the top-right corner." : variant === "scrollable-content" ? "This is a dialog with scrollable content." : "This dialog has a sticky footer that stays visible while the content scrolls."
  const dialog = <div class="doc-dialog-preview" data-doc-dialog-root data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}><button type="button" class="doc-button is-outline" data-doc-dialog-trigger aria-haspopup="dialog" aria-expanded="false"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "فتح الحوار" : undefined} data-text-he={rtl ? "פתח דיאלוג" : undefined} data-text-en={rtl ? "Open Dialog" : undefined}>{trigger}</span></button><div class="doc-dialog-portal" data-doc-dialog-portal hidden><div class="doc-dialog-overlay" data-doc-dialog-overlay></div><div class={`doc-dialog-content is-${variant}`} role="dialog" aria-modal="true" aria-labelledby={`${name}-title`} data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>{variant !== "no-close-button" ? <button type="button" class="doc-dialog-x" aria-label="Close" data-doc-dialog-close>×</button> : null}<header><h3 id={`${name}-title`} data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "تعديل الملف الشخصي" : undefined} data-text-he={rtl ? "ערוך פרופיל" : undefined} data-text-en={rtl ? "Edit profile" : undefined}>{title}</h3><p data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? description : undefined} data-text-he={rtl ? "בצע שינויים בפרופיל שלך כאן. לחץ על שמור כשתסיים." : undefined} data-text-en={rtl ? "Make changes to your profile here. Click save when you're done." : undefined}>{description}</p></header>{variant === "demo" || rtl ? <div class="doc-dialog-fields"><label><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "الاسم" : undefined} data-text-he={rtl ? "שם" : undefined} data-text-en={rtl ? "Name" : undefined}>{rtl ? "الاسم" : "Name"}</span><input value="Pedro Duarte" /></label><label><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "اسم المستخدم" : undefined} data-text-he={rtl ? "שם משתמש" : undefined} data-text-en={rtl ? "Username" : undefined}>{rtl ? "اسم المستخدم" : "Username"}</span><input value="@peduarte" /></label></div> : variant === "close-button" ? <label class="doc-dialog-share"><span class="sr-only">Link</span><input value="https://ui.shadcn.com/docs/installation" readonly /></label> : variant === "scrollable-content" || variant === "sticky-footer" ? <div class="doc-dialog-scroll" data-doc-dialog-scroll>{Array.from({ length: 10 }, (_, index) => <p key={index}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>)}</div> : null}{variant === "demo" || rtl ? <footer><button type="button" class="doc-button is-outline" data-doc-dialog-close><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "إلغاء" : undefined} data-text-he={rtl ? "בטל" : undefined} data-text-en={rtl ? "Cancel" : undefined}>{rtl ? "إلغاء" : "Cancel"}</span></button><button type="button" class="doc-button is-default" data-doc-dialog-close><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "حفظ التغييرات" : undefined} data-text-he={rtl ? "שמור שינויים" : undefined} data-text-en={rtl ? "Save changes" : undefined}>{rtl ? "حفظ التغييرات" : "Save changes"}</span></button></footer> : variant === "close-button" || variant === "sticky-footer" ? <footer><button type="button" class={`doc-button ${variant === "close-button" ? "is-default" : "is-outline"}`} data-doc-dialog-close>Close</button></footer> : null}</div></div></div>
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-dialog-rtl-preview" dir="rtl" data-lang="ar">{dialog}</div></div> : dialog
}

function DocDatePickerPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const rtl = name === "date-picker-rtl"
  const picker = <DocDatePicker variant={name.replace("date-picker-", "")} rtl={rtl} />
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-date-picker-rtl-preview" dir="rtl" data-lang="ar">{picker}</div></div> : picker
}

function DocDatePicker(props: { variant: string; rtl?: boolean }) {
  const variant = untrack(() => props.variant)
  const rtl = untrack(() => !!props.rtl)
  const year = new Date().getFullYear()
  const month = new Date().getMonth()
  const fieldLabel = variant === "basic" ? "Date" : variant === "range" ? "Date Picker Range" : variant === "dob" ? "Date of birth" : variant === "input" ? "Subscription Date" : variant === "natural-language" ? "Schedule Date" : ""
  const triggerLabel = rtl ? "اختر تاريخًا" : variant === "range" ? `Jan 20, ${year} - Feb 09, ${year}` : variant === "dob" || variant === "time" ? "Select date" : "Pick a date"
  const calendar = <DocCalendar variant={rtl ? "rtl" : variant === "range" ? "range" : "default"} year={variant === "range" ? year : variant === "input" ? 2025 : year} month={variant === "range" ? 0 : variant === "input" ? 5 : month} selectedDay={variant === "range" ? 20 : variant === "input" ? 1 : undefined} rangeEnd={variant === "range" ? 9 : undefined} months={variant === "range" ? 2 : 1} dropdown={variant === "dob" || variant === "natural-language"} />
  const popover = <div class={`doc-date-popover${variant === "range" ? " is-range" : ""}`} data-doc-date-popover hidden>{calendar}</div>
  if (variant === "input" || variant === "natural-language") {
    const natural = variant === "natural-language"
    return <div class={`doc-date-picker doc-date-input-picker${natural ? " is-natural" : ""}`} data-doc-date-picker data-date-picker-variant={variant}><label>{fieldLabel}<div class="doc-date-input-group"><input type="text" value={natural ? "In 2 days" : "June 01, 2025"} placeholder={natural ? "Tomorrow or next week" : "June 01, 2025"} data-doc-date-input /><button type="button" aria-label="Select date" data-doc-date-trigger aria-haspopup="dialog" aria-expanded="false">▣</button></div></label>{natural ? <p>Your post will be published on <strong data-doc-date-natural-output>August 27, 2026</strong>.</p> : null}{popover}</div>
  }
  if (variant === "time") {
    return <div class="doc-date-picker doc-date-time-picker" data-doc-date-picker data-date-picker-variant={variant}><label>Date<button type="button" class="doc-date-trigger is-time" data-doc-date-trigger aria-haspopup="dialog" aria-expanded="false"><span data-doc-date-label>{triggerLabel}</span><ChevronDownIcon /></button></label><label>Time<input type="time" step="1" value="10:30:00" /></label>{popover}</div>
  }
  return <div class={`doc-date-picker${variant === "demo" || rtl ? " is-standalone" : ""}${variant === "range" ? " is-range" : ""}`} data-doc-date-picker data-date-picker-variant={variant} data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>{variant !== "demo" && !rtl ? <label class="doc-date-field-label">{fieldLabel}</label> : null}<button type="button" class="doc-date-trigger" data-empty="true" data-doc-date-trigger aria-haspopup="dialog" aria-expanded="false"><span data-doc-date-label data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "اختر تاريخًا" : undefined} data-text-he={rtl ? "בחר תאריך" : undefined} data-text-en={rtl ? "Pick a date" : undefined}>{triggerLabel}</span>{variant === "demo" || rtl ? <ChevronDownIcon /> : variant === "range" ? renderDocButtonIcon("calendar") : null}</button>{popover}</div>
}

function DocDataTablePreview(props: { name: string }) {
  const rtl = untrack(() => props.name === "data-table-rtl")
  const table = <DocDataTable rtl={rtl} />
  return rtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-data-table-rtl-preview" dir="rtl" data-lang="ar">{table}</div></div> : table
}

function DocDataTable(props: { rtl?: boolean }) {
  const rtl = untrack(() => !!props.rtl)
  const rows = [
    ["m5gr84i9", "success", "ken99@example.com", "$316.00"],
    ["3u1reuv4", "success", "Abe45@example.com", "$242.00"],
    ["derv1ws0", "processing", "Monserrat44@example.com", "$837.00"],
    ["5kma53ae", "success", "Silas22@example.com", "$874.00"],
    ["bhqecj4p", "failed", "carmella@example.com", "$721.00"],
  ]
  const statusTranslations: Record<string, [string, string]> = { success: ["ناجح", "הצליח"], processing: ["قيد المعالجة", "מעבד"], failed: ["فشل", "נכשל"] }
  return <div class={`doc-data-table${rtl ? " is-rtl" : ""}`} data-doc-data-table data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
    <div class="doc-data-toolbar"><input type="text" class="doc-data-filter" aria-label="Filter emails" placeholder={rtl ? "تصفية البريد الإلكتروني..." : "Filter emails..."} data-doc-data-filter data-placeholder-ar={rtl ? "تصفية البريد الإلكتروني..." : undefined} data-placeholder-he={rtl ? "סנן אימיילים..." : undefined} data-placeholder-en={rtl ? "Filter emails..." : undefined} /><span class="ui-menu doc-data-menu" data-menu><button type="button" class="doc-button is-outline doc-data-columns-trigger" data-menu-trigger aria-haspopup="menu" aria-expanded="false"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "الأعمدة" : undefined} data-text-he={rtl ? "עמודות" : undefined} data-text-en={rtl ? "Columns" : undefined}>{rtl ? "الأعمدة" : "Columns"}</span><ChevronDownIcon /></button><div class="ui-menu-panel doc-data-columns-panel" data-menu-panel data-menu-side="bottom" data-menu-align="end" role="menu" hidden>{["status", "email", "amount"].map((column) => <button type="button" class="ui-menu-item doc-data-column-item" role="menuitemcheckbox" aria-checked="true" data-selected="true" data-menu-item data-menu-keep-open data-doc-data-column={column}><span>{column}</span><span aria-hidden="true">✓</span></button>)}</div></span></div>
    <div class="doc-data-table-frame"><table><thead><tr><th data-doc-data-col="select"><button type="button" class="doc-checkbox-control" role="checkbox" aria-label={rtl ? "تحديد الكل" : "Select all"} aria-checked="false" data-state="unchecked" data-doc-data-select-all><span aria-hidden="true">✓</span></button></th><th data-doc-data-col="status"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "الحالة" : undefined} data-text-he={rtl ? "סטטוס" : undefined} data-text-en={rtl ? "Status" : undefined}>{rtl ? "الحالة" : "Status"}</span></th><th data-doc-data-col="email"><button type="button" class="doc-data-sort" data-doc-data-sort><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "البريد الإلكتروني" : undefined} data-text-he={rtl ? "אימייל" : undefined} data-text-en={rtl ? "Email" : undefined}>{rtl ? "البريد الإلكتروني" : "Email"}</span><svg class="doc-data-sort-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /></svg></button></th><th data-doc-data-col="amount"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "المبلغ" : undefined} data-text-he={rtl ? "סכום" : undefined} data-text-en={rtl ? "Amount" : undefined}>{rtl ? "المبلغ" : "Amount"}</span></th><th data-doc-data-col="actions"><span class="sr-only">Actions</span></th></tr></thead><tbody>{rows.map((row, index) => <tr data-doc-data-row data-email={row[2].toLocaleLowerCase()} data-index={String(index)}><td data-doc-data-col="select"><button type="button" class="doc-checkbox-control" role="checkbox" aria-label={rtl ? "تحديد الصف" : "Select row"} aria-checked="false" data-state="unchecked" data-doc-data-select-row><span aria-hidden="true">✓</span></button></td><td data-doc-data-col="status"><span class="doc-data-status" data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? statusTranslations[row[1]][0] : undefined} data-text-he={rtl ? statusTranslations[row[1]][1] : undefined} data-text-en={rtl ? row[1][0].toUpperCase() + row[1].slice(1) : undefined}>{rtl ? statusTranslations[row[1]][0] : row[1]}</span></td><td data-doc-data-col="email"><div class="doc-data-email">{row[2]}</div></td><td data-doc-data-col="amount" class="doc-data-amount">{row[3]}</td><td data-doc-data-col="actions"><span class="ui-menu doc-data-menu" data-menu><button type="button" class="doc-data-action-trigger" aria-label={rtl ? "فتح القائمة" : "Open menu"} data-menu-trigger aria-haspopup="menu" aria-expanded="false"><svg class="doc-data-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg></button><div class="ui-menu-panel doc-data-action-panel" data-menu-panel data-menu-side="bottom" data-menu-align="end" role="menu" hidden><div class="doc-context-label"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "الإجراءات" : undefined} data-text-he={rtl ? "פעולות" : undefined} data-text-en={rtl ? "Actions" : undefined}>{rtl ? "الإجراءات" : "Actions"}</span></div><button type="button" class="ui-menu-item" data-menu-item role="menuitem"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "نسخ معرف الدفع" : undefined} data-text-he={rtl ? "העתק מזהה תשלום" : undefined} data-text-en={rtl ? "Copy payment ID" : undefined}>{rtl ? "نسخ معرف الدفع" : "Copy payment ID"}</span></button><div class="ui-menu-separator"></div><button type="button" class="ui-menu-item" data-menu-item role="menuitem"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "عرض العميل" : undefined} data-text-he={rtl ? "צפה בלקוח" : undefined} data-text-en={rtl ? "View customer" : undefined}>{rtl ? "عرض العميل" : "View customer"}</span></button><button type="button" class="ui-menu-item" data-menu-item role="menuitem"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "عرض تفاصيل الدفع" : undefined} data-text-he={rtl ? "צפה בפרטי תשלום" : undefined} data-text-en={rtl ? "View payment details" : undefined}>{rtl ? "عرض تفاصيل الدفع" : "View payment details"}</span></button></div></span></td></tr>)}<tr data-doc-data-empty hidden><td colSpan={5}><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "لا توجد نتائج." : undefined} data-text-he={rtl ? "אין תוצאות." : undefined} data-text-en={rtl ? "No results." : undefined}>{rtl ? "لا توجد نتائج." : "No results."}</span></td></tr></tbody></table></div>
    <div class="doc-data-footer"><span data-doc-data-summary><strong>0</strong> <span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "من" : undefined} data-text-he={rtl ? "מתוך" : undefined} data-text-en={rtl ? "of" : undefined}>{rtl ? "من" : "of"}</span> <strong>5</strong> <span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "صف(وف) محدد." : undefined} data-text-he={rtl ? "שורות נבחרו." : undefined} data-text-en={rtl ? "row(s) selected." : undefined}>{rtl ? "صف(وف) محدد." : "row(s) selected."}</span></span><div><button type="button" class="doc-button is-outline is-sm" disabled><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "السابق" : undefined} data-text-he={rtl ? "הקודם" : undefined} data-text-en={rtl ? "Previous" : undefined}>{rtl ? "السابق" : "Previous"}</span></button><button type="button" class="doc-button is-outline is-sm" disabled><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? "التالي" : undefined} data-text-he={rtl ? "הבא" : undefined} data-text-en={rtl ? "Next" : undefined}>{rtl ? "التالي" : "Next"}</span></button></div></div>
  </div>
}

type DocContextMenuItem = {
  kind?: "item" | "label" | "separator" | "checkbox" | "radio" | "sub"
  label?: string
  labelHe?: string
  labelEn?: string
  shortcut?: string
  disabled?: boolean
  destructive?: boolean
  checked?: boolean
  value?: string
  group?: string
  icon?: string
  children?: DocContextMenuItem[]
}

function DocContextMenuPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  if (name === "context-menu-sides") {
    return <div class="doc-context-sides">
      <DocContextMenuRoot variant="basic" label="Right click (top)" side="top" />
      <DocContextMenuRoot variant="basic" label="Right click (right)" side="right" />
      <DocContextMenuRoot variant="basic" label="Right click (bottom)" side="bottom" />
      <DocContextMenuRoot variant="basic" label="Right click (left)" side="left" />
    </div>
  }
  if (name === "context-menu-rtl") {
    return <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-context-rtl-preview" dir="rtl" data-lang="ar"><DocContextMenuRoot variant="rtl" label="انقر بزر الماوس الأيمن هنا" labelHe="לחץ לחיצה ימנית כאן" labelEn="Right click here" rtl /></div></div>
  }
  const variant = name.replace("context-menu-", "")
  return <DocContextMenuRoot variant={variant} label="Right click here" />
}

function DocContextMenuRoot(props: { variant: string; label: string; labelHe?: string; labelEn?: string; side?: string; rtl?: boolean }) {
  const variant = untrack(() => props.variant)
  const side = untrack(() => props.side || "right")
  const rtl = untrack(() => !!props.rtl)
  return <div class="doc-context-root" data-doc-context-root data-doc-context-side={side}>
    <div class="doc-context-trigger" data-slot="context-menu-trigger" data-doc-context-trigger tabIndex={0} aria-haspopup="menu"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? props.label : undefined} data-text-he={props.labelHe} data-text-en={props.labelEn}>{props.label}</span></div>
    <div class="doc-context-portal" data-doc-context-portal hidden><DocContextMenuPanel variant={variant} rtl={rtl} /></div>
  </div>
}

function DocContextMenuPanel(props: { variant: string; rtl?: boolean; submenu?: boolean; submenuKind?: string }) {
  const variant = untrack(() => props.variant)
  const rtl = untrack(() => !!props.rtl)
  const submenu = untrack(() => !!props.submenu)
  const submenuKind = untrack(() => props.submenuKind || "tools")
  const basic: DocContextMenuItem[] = [{ label: "Back" }, { label: "Forward", disabled: true }, { label: "Reload" }]
  const tools: DocContextMenuItem[] = [{ label: "Save Page...", labelHe: "שמור עמוד...", labelEn: "Save Page..." }, { label: "Create Shortcut...", labelHe: "צור קיצור דרך...", labelEn: "Create Shortcut..." }, { label: "Name Window...", labelHe: "שם חלון...", labelEn: "Name Window..." }, { kind: "separator" }, { label: "Developer Tools", labelHe: "כלי מפתח", labelEn: "Developer Tools" }, { kind: "separator" }, { label: "Delete", labelHe: "מחק", labelEn: "Delete", destructive: true }]
  const navigation: DocContextMenuItem[] = [{ label: "رجوع", labelHe: "חזור", labelEn: "Back", icon: "back", shortcut: "⌘[" }, { label: "تقدم", labelHe: "קדימה", labelEn: "Forward", icon: "forward", shortcut: "⌘]", disabled: true }, { label: "إعادة تحميل", labelHe: "רענן", labelEn: "Reload", icon: "reload", shortcut: "⌘R" }]
  const demo: DocContextMenuItem[] = [{ label: "Back", shortcut: "⌘[" }, { label: "Forward", shortcut: "⌘]", disabled: true }, { label: "Reload", shortcut: "⌘R" }, { kind: "sub", label: "More Tools", children: tools }, { kind: "separator" }, { kind: "checkbox", label: "Show Bookmarks", checked: true }, { kind: "checkbox", label: "Show Full URLs" }, { kind: "separator" }, { kind: "label", label: "People" }, { kind: "radio", label: "Pedro Duarte", value: "pedro", group: "people", checked: true }, { kind: "radio", label: "Colm Tuite", value: "colm", group: "people" }]
  const checkboxes: DocContextMenuItem[] = [{ kind: "checkbox", label: "Show Bookmarks Bar", checked: true }, { kind: "checkbox", label: "Show Full URLs" }, { kind: "checkbox", label: "Show Developer Tools", checked: true }]
  const destructive: DocContextMenuItem[] = [{ label: "Edit", icon: "edit" }, { label: "Share", icon: "share" }, { kind: "separator" }, { label: "Delete", icon: "delete", destructive: true }]
  const groups: DocContextMenuItem[] = [{ kind: "label", label: "File" }, { label: "New File", shortcut: "⌘N" }, { label: "Open File", shortcut: "⌘O" }, { label: "Save", shortcut: "⌘S" }, { kind: "separator" }, { kind: "label", label: "Edit" }, { label: "Undo", shortcut: "⌘Z" }, { label: "Redo", shortcut: "⇧⌘Z" }, { kind: "separator" }, { label: "Cut", shortcut: "⌘X" }, { label: "Copy", shortcut: "⌘C" }, { label: "Paste", shortcut: "⌘V" }, { kind: "separator" }, { label: "Delete", shortcut: "⌫", destructive: true }]
  const icons: DocContextMenuItem[] = [{ label: "Copy", icon: "copy" }, { label: "Cut", icon: "cut" }, { label: "Paste", icon: "paste" }, { kind: "separator" }, { label: "Delete", icon: "delete", destructive: true }]
  const radio: DocContextMenuItem[] = [{ kind: "label", label: "People" }, { kind: "radio", label: "Pedro Duarte", value: "pedro", group: "people", checked: true }, { kind: "radio", label: "Colm Tuite", value: "colm", group: "people" }, { kind: "separator" }, { kind: "label", label: "Theme" }, { kind: "radio", label: "Light", value: "light", group: "theme", checked: true }, { kind: "radio", label: "Dark", value: "dark", group: "theme" }, { kind: "radio", label: "System", value: "system", group: "theme" }]
  const shortcuts: DocContextMenuItem[] = [{ label: "Back", shortcut: "⌘[" }, { label: "Forward", shortcut: "⌘]", disabled: true }, { label: "Reload", shortcut: "⌘R" }, { kind: "separator" }, { label: "Save", shortcut: "⌘S" }, { label: "Save As...", shortcut: "⇧⌘S" }]
  const submenuItems: DocContextMenuItem[] = [{ label: "Copy", shortcut: "⌘C" }, { label: "Cut", shortcut: "⌘X" }, { kind: "sub", label: "More Tools", children: tools }]
  const rtlItems: DocContextMenuItem[] = [{ kind: "sub", label: "التنقل", labelHe: "ניווט", labelEn: "Navigation", children: navigation }, { kind: "sub", label: "المزيد من الأدوات", labelHe: "כלים נוספים", labelEn: "More Tools", children: tools }, { kind: "separator" }, { kind: "checkbox", label: "إظهار الإشارات المرجعية", labelHe: "הצג סימניות", labelEn: "Show Bookmarks", checked: true }, { kind: "checkbox", label: "إظهار عناوين URL الكاملة", labelHe: "הצג כתובות URL מלאות", labelEn: "Show Full URLs" }, { kind: "separator" }, { kind: "label", label: "الأشخاص", labelHe: "אנשים", labelEn: "People" }, { kind: "radio", label: "Pedro Duarte", labelHe: "Pedro Duarte", labelEn: "Pedro Duarte", value: "pedro", group: "people", checked: true }, { kind: "radio", label: "Colm Tuite", labelHe: "Colm Tuite", labelEn: "Colm Tuite", value: "colm", group: "people" }]
  const entries = submenu ? (submenuKind === "navigation" ? navigation : tools) : variant === "basic" || variant === "sides" ? basic : variant === "checkboxes" ? checkboxes : variant === "destructive" ? destructive : variant === "groups" ? groups : variant === "icons" ? icons : variant === "radio" ? radio : variant === "shortcuts" ? shortcuts : variant === "submenu" ? submenuItems : variant === "rtl" ? rtlItems : demo
  const wide = variant === "demo" || variant === "rtl"
  return <div class={`doc-context-menu-panel${wide ? " is-wide" : ""}${submenu ? " is-submenu" : ""}`} data-slot={submenu ? "context-menu-sub-content" : "context-menu-content"} data-doc-context-panel data-doc-context-submenu={submenu ? "true" : undefined} data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"} role="menu">
    {entries.map((entry) => entry.kind === "separator" ? <div class="doc-context-separator" role="separator"></div> : entry.kind === "label" ? <div class="doc-context-label" data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? entry.label : undefined} data-text-he={entry.labelHe} data-text-en={entry.labelEn}>{entry.label}</div> : entry.kind === "sub" ? <div class="doc-context-sub" data-doc-context-sub><button type="button" role="menuitem" class="doc-context-item" data-doc-context-item data-doc-context-sub-trigger aria-haspopup="menu" aria-expanded="false"><span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? entry.label : undefined} data-text-he={entry.labelHe} data-text-en={entry.labelEn}>{entry.label}</span><ChevronRightIcon /></button><div class="doc-context-sub-portal" data-doc-context-sub-portal hidden><DocContextMenuPanel variant={variant} rtl={rtl} submenu submenuKind={entry.children === navigation ? "navigation" : "tools"} /></div></div> : <button type="button" class={`doc-context-item${entry.destructive ? " is-destructive" : ""}`} data-doc-context-item data-doc-context-check={entry.kind === "checkbox" ? "true" : undefined} data-doc-context-radio={entry.kind === "radio" ? "true" : undefined} data-doc-context-group={entry.group} data-doc-context-value={entry.value} data-checked={entry.checked ? "true" : "false"} role={entry.kind === "checkbox" ? "menuitemcheckbox" : entry.kind === "radio" ? "menuitemradio" : "menuitem"} aria-checked={entry.kind === "checkbox" || entry.kind === "radio" ? !!entry.checked : undefined} disabled={entry.disabled}>{entry.kind === "checkbox" || entry.kind === "radio" ? <span class="doc-context-check" aria-hidden="true"><CheckIcon /></span> : entry.icon ? renderDocContextIcon(entry.icon) : null}<span data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? entry.label : undefined} data-text-he={entry.labelHe} data-text-en={entry.labelEn}>{entry.label}</span>{entry.shortcut ? <kbd>{entry.shortcut}</kbd> : null}</button>)}
  </div>
}

function renderDocContextIcon(kind: string) {
  return kind === "reload" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"></path><path d="M20 4v7h-7"></path></svg>
    : kind === "back" || kind === "forward" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={kind === "back" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}></path></svg>
      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5h14v14H5z"></path><path d="M8 9h8M8 13h6"></path></svg>
}

type DocCommandItem = { label: string; icon?: string; shortcut?: string; disabled?: boolean; labelHe?: string; labelEn?: string }
type DocCommandGroup = { heading: string; headingHe?: string; headingEn?: string; items: DocCommandItem[] }

function DocCommandPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "command-rtl"
  if (name === "command-demo" || isRtl) {
    const command = <DocCommandSurface variant="full" rtl={isRtl} />
    return isRtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-command-rtl-preview" dir="rtl" data-lang="ar">{command}</div></div> : command
  }

  const variant = name === "command-basic" ? "basic" : name === "command-shortcuts" ? "shortcuts" : name === "command-scrollable" ? "scrollable" : "full"
  const dialogId = `${name}-dialog`
  return <div class="doc-command-launch"><button type="button" class="doc-button is-outline" data-slot="button" data-variant="outline" data-size="default" data-doc-command-open aria-haspopup="dialog" aria-controls={dialogId}>Open Menu</button><div class="doc-command-portal" data-doc-command-portal hidden><div class="doc-command-overlay" data-doc-command-overlay></div><div id={dialogId} class={`doc-command-dialog is-${variant}`} role="dialog" aria-modal="true" aria-label="Command Palette"><DocCommandSurface variant={variant} dialog /></div></div></div>
}

function DocCommandSurface(props: { variant: string; rtl?: boolean; dialog?: boolean }) {
  const variant = untrack(() => props.variant)
  const rtl = untrack(() => !!props.rtl)
  const dialog = untrack(() => !!props.dialog)
  const fullGroups: DocCommandGroup[] = [
    { heading: rtl ? "اقتراحات" : "Suggestions", headingHe: rtl ? "הצעות" : undefined, headingEn: rtl ? "Suggestions" : undefined, items: [
      { label: rtl ? "التقويم" : "Calendar", labelHe: rtl ? "לוח שנה" : undefined, labelEn: rtl ? "Calendar" : undefined, icon: "calendar" },
      { label: rtl ? "البحث عن الرموز التعبيرية" : "Search Emoji", labelHe: rtl ? "חפש אמוג'י" : undefined, labelEn: rtl ? "Search Emoji" : undefined, icon: "smile" },
      { label: rtl ? "الآلة الحاسبة" : "Calculator", labelHe: rtl ? "מחשבון" : undefined, labelEn: rtl ? "Calculator" : undefined, icon: "calculator", disabled: !dialog },
    ] },
    { heading: rtl ? "الإعدادات" : "Settings", headingHe: rtl ? "הגדרות" : undefined, headingEn: rtl ? "Settings" : undefined, items: [
      { label: rtl ? "الملف الشخصي" : "Profile", labelHe: rtl ? "פרופיל" : undefined, labelEn: rtl ? "Profile" : undefined, icon: "user", shortcut: "⌘P" },
      { label: rtl ? "الفوترة" : "Billing", labelHe: rtl ? "חיוב" : undefined, labelEn: rtl ? "Billing" : undefined, icon: "card", shortcut: "⌘B" },
      { label: rtl ? "الإعدادات" : "Settings", labelHe: rtl ? "הגדרות" : undefined, labelEn: rtl ? "Settings" : undefined, icon: "settings", shortcut: "⌘S" },
    ] },
  ]
  const basicGroups: DocCommandGroup[] = [{ heading: "Suggestions", items: [{ label: "Calendar" }, { label: "Search Emoji" }, { label: "Calculator" }] }]
  const shortcutGroups: DocCommandGroup[] = [{ heading: "Settings", items: fullGroups[1].items }]
  const scrollGroups: DocCommandGroup[] = [
    { heading: "Navigation", items: [{ label: "Home", icon: "home", shortcut: "⌘H" }, { label: "Inbox", icon: "inbox", shortcut: "⌘I" }, { label: "Documents", icon: "file", shortcut: "⌘D" }, { label: "Folders", icon: "folder", shortcut: "⌘F" }] },
    { heading: "Actions", items: [{ label: "New File", icon: "plus", shortcut: "⌘N" }, { label: "New Folder", icon: "folder", shortcut: "⇧⌘N" }, { label: "Copy", icon: "copy", shortcut: "⌘C" }, { label: "Cut", icon: "cut", shortcut: "⌘X" }, { label: "Paste", icon: "paste", shortcut: "⌘V" }, { label: "Delete", icon: "trash", shortcut: "⌫" }] },
    { heading: "View", items: [{ label: "Grid View", icon: "grid" }, { label: "List View", icon: "list" }, { label: "Zoom In", icon: "plus", shortcut: "⌘+" }, { label: "Zoom Out", icon: "minus", shortcut: "⌘-" }] },
    { heading: "Account", items: [{ label: "Profile", icon: "user", shortcut: "⌘P" }, { label: "Billing", icon: "card", shortcut: "⌘B" }, { label: "Settings", icon: "settings", shortcut: "⌘S" }, { label: "Notifications", icon: "bell" }, { label: "Help & Support", icon: "help" }] },
    { heading: "Tools", items: [{ label: "Calculator", icon: "calculator" }, { label: "Calendar", icon: "calendar" }, { label: "Image Editor", icon: "image" }, { label: "Code Editor", icon: "code" }] },
  ]
  const groups = variant === "basic" ? basicGroups : variant === "shortcuts" ? shortcutGroups : variant === "scrollable" ? scrollGroups : fullGroups
  const placeholder = rtl ? "اكتب أمرًا أو ابحث..." : "Type a command or search..."
  return <div class={`doc-command-surface is-${variant}${dialog ? " is-dialog" : ""}${rtl ? " is-rtl" : ""}`} data-slot="command" data-doc-command data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}><label class="doc-command-input"><span>{renderDocCommandIcon("search")}</span><input aria-label="Command search" placeholder={placeholder} data-doc-command-input data-placeholder-ar={rtl ? placeholder : undefined} data-placeholder-he={rtl ? "הקלד פקודה או חפש..." : undefined} data-placeholder-en={rtl ? "Type a command or search..." : undefined} /></label><div class="doc-command-list" data-slot="command-list" data-doc-command-list role="listbox">{groups.map((group, groupIndex) => <section class="doc-command-group" data-doc-command-group><h5 data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? group.heading : undefined} data-text-he={group.headingHe} data-text-en={group.headingEn}>{group.heading}</h5>{group.items.map((item, itemIndex) => <button type="button" class="doc-command-item" role="option" aria-selected={groupIndex === 0 && itemIndex === 0 ? "true" : "false"} data-highlighted={groupIndex === 0 && itemIndex === 0 ? "" : undefined} data-doc-command-item disabled={item.disabled}>{item.icon ? renderDocCommandIcon(item.icon) : null}<span data-doc-command-label data-doc-rtl-text={rtl ? "true" : undefined} data-text-ar={rtl ? item.label : undefined} data-text-he={item.labelHe} data-text-en={item.labelEn}>{item.label}</span>{item.shortcut ? <kbd>{item.shortcut}</kbd> : null}</button>)}</section>)}<div class="doc-command-empty" data-doc-command-empty hidden>{rtl ? <span data-doc-rtl-text data-text-ar="لم يتم العثور على نتائج." data-text-he="לא נמצאו תוצאות." data-text-en="No results found.">لم يتم العثور على نتائج.</span> : "No results found."}</div></div></div>
}

function renderDocCommandIcon(kind: string) {
  return kind === "search" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>
    : kind === "calendar" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 11h18"></path></svg>
      : kind === "smile" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"></path></svg>
        : kind === "calculator" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"></path></svg>
          : kind === "user" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3"></circle><path d="M7 21v-2a5 5 0 0 1 10 0v2"></path></svg>
            : kind === "card" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M3 10h18"></path></svg>
              : kind === "settings" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1z"></path></svg>
                : kind === "plus" || kind === "minus" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={kind === "plus" ? "M12 5v14M5 12h14" : "M5 12h14"}></path></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M8 9h8M8 13h6M8 17h4"></path></svg>
}

type DocComboboxOption = { value: string; label: string; description?: string; group?: string; groupStart?: boolean; groupEnd?: boolean }

function DocComboboxPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const frameworks: DocComboboxOption[] = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"].map((label) => ({ value: label, label }))
  const timezoneGroups = [
    ["Americas", ["(GMT-5) New York", "(GMT-8) Los Angeles", "(GMT-6) Chicago", "(GMT-5) Toronto", "(GMT-8) Vancouver", "(GMT-3) São Paulo"]],
    ["Europe", ["(GMT+0) London", "(GMT+1) Paris", "(GMT+1) Berlin", "(GMT+1) Rome", "(GMT+1) Madrid", "(GMT+1) Amsterdam"]],
    ["Asia/Pacific", ["(GMT+9) Tokyo", "(GMT+8) Shanghai", "(GMT+8) Singapore", "(GMT+4) Dubai", "(GMT+11) Sydney", "(GMT+9) Seoul"]],
  ] as const
  const timezones: DocComboboxOption[] = timezoneGroups.flatMap(([group, values]) => values.map((label, index) => ({ value: label, label, group, groupStart: index === 0, groupEnd: group !== "Asia/Pacific" && index === values.length - 1 })))
  const countries: DocComboboxOption[] = [
    ["argentina", "Argentina", "South America (ar)"], ["australia", "Australia", "Oceania (au)"], ["brazil", "Brazil", "South America (br)"], ["canada", "Canada", "North America (ca)"], ["china", "China", "Asia (cn)"], ["colombia", "Colombia", "South America (co)"], ["egypt", "Egypt", "Africa (eg)"], ["france", "France", "Europe (fr)"], ["germany", "Germany", "Europe (de)"], ["italy", "Italy", "Europe (it)"], ["japan", "Japan", "Asia (jp)"], ["kenya", "Kenya", "Africa (ke)"], ["mexico", "Mexico", "North America (mx)"], ["new-zealand", "New Zealand", "Oceania (nz)"], ["nigeria", "Nigeria", "Africa (ng)"], ["south-africa", "South Africa", "Africa (za)"], ["south-korea", "South Korea", "Asia (kr)"], ["united-kingdom", "United Kingdom", "Europe (gb)"], ["united-states", "United States", "North America (us)"],
  ].map(([value, label, description]) => ({ value, label, description }))
  const popupCountries: DocComboboxOption[] = [{ value: "", label: "Select country" }, ...countries.map(({ value, label }) => ({ value, label }))]
  const rtlCategories: DocComboboxOption[] = [
    ["technology", "التكنولوجيا", "טכנולוגיה", "Technology"], ["design", "التصميم", "עיצוב", "Design"], ["business", "الأعمال", "עסקים", "Business"], ["marketing", "التسويق", "שיווק", "Marketing"], ["education", "التعليم", "חינוך", "Education"], ["health", "الصحة", "בריאות", "Health"],
  ].map(([value, label, he, en]) => ({ value, label, description: `${he}|${en}` }))

  const control = name === "combobox-multiple" ? (
    <DocComboboxControl id={name} options={frameworks} placeholder="" selected="Next.js" multiple chips autoHighlight />
  ) : name === "combobox-clear" ? (
    <DocComboboxControl id={name} options={frameworks} placeholder="Select a framework" selected="Next.js" clear autoHighlight />
  ) : name === "combobox-groups" ? (
    <DocComboboxControl id={name} options={timezones} placeholder="Select a timezone" grouped />
  ) : name === "combobox-custom" ? (
    <DocComboboxControl id={name} options={countries} placeholder="Search countries..." custom />
  ) : name === "combobox-invalid" ? (
    <DocComboboxControl id={name} options={frameworks} placeholder="Select a framework" invalid />
  ) : name === "combobox-disabled" ? (
    <DocComboboxControl id={name} options={frameworks} placeholder="Select a framework" disabled />
  ) : name === "combobox-auto-highlight" ? (
    <DocComboboxControl id={name} options={frameworks} placeholder="Select a framework" autoHighlight />
  ) : name === "combobox-popup" ? (
    <DocComboboxControl id={name} options={popupCountries} placeholder="Search" selected="" popup autoHighlight />
  ) : name === "combobox-input-group" ? (
    <DocComboboxControl id={name} options={timezones} placeholder="Select a timezone" grouped globe />
  ) : name === "combobox-rtl" ? (
    <div class="doc-combobox-rtl-field" data-doc-rtl-direction dir="rtl">
      <label data-doc-rtl-text data-text-ar="الفئات" data-text-he="קטגוריות" data-text-en="Categories">الفئات</label>
      <DocComboboxControl id={name} options={rtlCategories} placeholder="أضف فئات" placeholderHe="הוסף קטגוריות" placeholderEn="Add categories" selected="technology" multiple chips autoHighlight rtl />
    </div>
  ) : (
    <DocComboboxControl id={name} options={frameworks} placeholder="Select a framework" />
  )

  return name === "combobox-rtl" ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div>
      <div class="doc-rtl-preview doc-combobox-rtl-preview" dir="rtl" data-lang="ar">{control}</div>
    </div>
  ) : control
}

function DocComboboxControl(props: { id: string; options: DocComboboxOption[]; placeholder: string; placeholderHe?: string; placeholderEn?: string; selected?: string; multiple?: boolean; chips?: boolean; clear?: boolean; invalid?: boolean; disabled?: boolean; autoHighlight?: boolean; popup?: boolean; grouped?: boolean; custom?: boolean; globe?: boolean; rtl?: boolean }) {
  const id = untrack(() => props.id)
  const placeholder = untrack(() => props.placeholder)
  const selected = untrack(() => props.selected)
  const multiple = untrack(() => !!props.multiple)
  const chips = untrack(() => !!props.chips)
  const popup = untrack(() => !!props.popup)
  const rtl = untrack(() => !!props.rtl)
  const clear = untrack(() => !!props.clear)
  const invalid = untrack(() => !!props.invalid)
  const disabled = untrack(() => !!props.disabled)
  const autoHighlight = untrack(() => !!props.autoHighlight)
  const grouped = untrack(() => !!props.grouped)
  const custom = untrack(() => !!props.custom)
  const globe = untrack(() => !!props.globe)
  const placeholderHe = untrack(() => props.placeholderHe)
  const placeholderEn = untrack(() => props.placeholderEn)
  const entries = untrack(() => props.options)
  const selectedOption = entries.find((option) => option.value === selected)
  const selectedLabel = selectedOption?.label ?? (popup ? "Select country" : "")
  const panelId = `${id}-panel`
  const translatedOption = (option: DocComboboxOption) => {
    if (!rtl || !option.description) return option.label
    const [he, en] = option.description.split("|")
    return <span data-doc-combobox-option-text data-doc-rtl-text data-value={option.value} data-text-ar={option.label} data-text-he={he} data-text-en={en}>{option.label}</span>
  }
  return (
    <div id={`${id}-root`} class={`doc-combobox${globe ? " has-globe" : ""}${invalid ? " is-invalid" : ""}${disabled ? " is-disabled" : ""}${popup ? " is-popup" : ""}${chips ? " has-chips" : ""}${rtl ? " is-rtl" : ""}`} data-doc-combobox data-combobox-id={id} data-multiple={multiple ? "true" : "false"} data-auto-highlight={autoHighlight ? "true" : "false"} data-popup={popup ? "true" : "false"} data-rtl={rtl ? "true" : "false"} data-placeholder-ar={rtl ? placeholder : undefined} data-placeholder-he={rtl ? placeholderHe : undefined} data-placeholder-en={rtl ? placeholderEn : undefined} data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
      {popup ? (
        <button type="button" class="doc-combobox-popup-trigger" data-doc-combobox-trigger role="combobox" aria-expanded="false" aria-controls={panelId}><span data-doc-combobox-value>{selectedLabel}</span>{renderDocComboboxIcon("chevron")}</button>
      ) : chips ? (
        <div class="doc-combobox-chips" data-slot="combobox-chips" data-doc-combobox-trigger>
          {selectedOption ? <span class="doc-combobox-chip" data-doc-combobox-chip data-value={selectedOption.value}><span data-doc-combobox-chip-label>{translatedOption(selectedOption)}</span><button type="button" aria-label={`Remove ${selectedOption.label}`} data-doc-combobox-remove>{renderDocComboboxIcon("x")}</button></span> : null}
          <input role="combobox" aria-expanded="false" aria-controls={panelId} placeholder={placeholder} data-doc-combobox-input />
        </div>
      ) : (
        <div class="doc-combobox-input-group" data-slot="input-group" data-doc-combobox-trigger>
          {globe ? <span class="doc-combobox-globe">{renderDocComboboxIcon("globe")}</span> : null}
          <input role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls={panelId} aria-invalid={invalid ? "true" : undefined} placeholder={placeholder} value={selectedLabel} disabled={disabled} data-doc-combobox-input />
          {clear && selectedOption ? <button type="button" class="doc-combobox-clear" aria-label="Clear selection" data-doc-combobox-clear>{renderDocComboboxIcon("x")}</button> : null}
          <button type="button" class="doc-combobox-toggle" aria-label="Toggle options" tabIndex={-1} disabled={disabled} data-doc-combobox-toggle>{renderDocComboboxIcon("chevron")}</button>
        </div>
      )}
      <div id={panelId} class={`doc-combobox-panel${grouped ? " is-grouped" : ""}${custom ? " is-custom" : ""}${popup ? " is-popup" : ""}${globe ? " is-wide" : ""}${chips ? " is-chips" : ""}${rtl ? " is-rtl" : ""}`} data-slot="combobox-content" data-doc-combobox-panel role="presentation" hidden>
        {popup ? <div class="doc-combobox-popup-search"><input role="combobox" aria-label="Search countries" placeholder={placeholder} data-doc-combobox-popup-input /></div> : null}
        <div class="doc-combobox-list" role="listbox" aria-multiselectable={multiple ? "true" : undefined}>
          {entries.map((option) => <>{option.groupStart ? <div class="doc-combobox-group-label">{option.group}</div> : null}<button type="button" class="doc-combobox-item" role="option" aria-selected={option.value === selected ? "true" : "false"} data-value={option.value} data-label={option.label} data-doc-combobox-item><span class="doc-combobox-check">{renderDocComboboxIcon("check")}</span><span class="doc-combobox-item-copy"><strong>{translatedOption(option)}</strong>{custom && option.description ? <small>{option.description}</small> : null}</span></button>{option.groupEnd ? <span class="doc-combobox-separator"></span> : null}</>)}
          <div class="doc-combobox-empty" data-doc-combobox-empty hidden>{grouped || globe ? "No timezones found." : custom ? "No countries found." : rtl ? <span data-doc-rtl-text data-text-ar="لم يتم العثور على فئات." data-text-he="לא נמצאו קטגוריות." data-text-en="No categories found.">لم يتم العثور على فئات.</span> : "No items found."}</div>
        </div>
      </div>
    </div>
  )
}

function renderDocComboboxIcon(kind: "chevron" | "x" | "check" | "globe") {
  return kind === "chevron" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
    : kind === "x" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg>
      : kind === "check" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"></path></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"></path></svg>
}

function DocCollapsiblePreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "collapsible-rtl"
  const content = name === "collapsible-basic" ? (
    <article class="doc-collapsible-basic-card" data-slot="card">
      <div data-slot="card-content">
        <div class="doc-collapsible-basic" data-slot="collapsible" data-state="closed">
          <div id="collapsible-basic-content" data-slot="collapsible-content" data-state="closed" hidden></div>
        </div>
      </div>
    </article>
  ) : name === "collapsible-settings" ? (
    <article class="doc-collapsible-settings-card" data-slot="card">
      <header data-slot="card-header">
        <h4 data-slot="card-title">Radius</h4>
        <p data-slot="card-description">Set the corner radius of the element.</p>
      </header>
      <div data-slot="card-content">
        <div class="doc-collapsible-settings" data-slot="collapsible" data-state="closed" data-doc-collapsible>
          <div class="doc-collapsible-settings-fields">
            <label><span class="sr-only">Radius X</span><input aria-label="Radius X" value="0" /></label>
            <label><span class="sr-only">Radius Y</span><input aria-label="Radius Y" value="0" /></label>
            <div id="collapsible-settings-content" class="doc-collapsible-settings-content" data-slot="collapsible-content" data-state="closed" hidden>
              <label><span class="sr-only">Radius X</span><input aria-label="Radius X expanded" value="0" /></label>
              <label><span class="sr-only">Radius Y</span><input aria-label="Radius Y expanded" value="0" /></label>
            </div>
          </div>
          <button type="button" class="doc-collapsible-settings-trigger" data-slot="collapsible-trigger" data-doc-collapsible-trigger data-state="closed" aria-expanded="false" aria-controls="collapsible-settings-content" aria-label="Expand radius controls">
            <span data-doc-collapsible-closed-icon>{renderDocCollapsibleIcon("maximize")}</span>
            <span data-doc-collapsible-open-icon hidden>{renderDocCollapsibleIcon("minimize")}</span>
          </button>
        </div>
      </div>
    </article>
  ) : name === "collapsible-file-tree" ? (
    <article class="doc-collapsible-file-card" data-slot="card">
      <header data-slot="card-header">
        <div class="doc-collapsible-tabs" role="tablist" aria-label="File tree view">
          <button type="button" role="tab" aria-selected="true" data-state="active" data-doc-collapsible-tab>Explorer</button>
          <button type="button" role="tab" aria-selected="false" data-state="inactive" data-doc-collapsible-tab>Outline</button>
        </div>
      </header>
      <div class="doc-collapsible-file-list" data-slot="card-content">
        {["app.tsx", "layout.tsx", "globals.css", "package.json", "tsconfig.json", "README.md", ".gitignore"].map((file) => (
          <button type="button" class="doc-collapsible-file">{renderDocCollapsibleIcon("file")}<span>{file}</span></button>
        ))}
      </div>
    </article>
  ) : (
    <DocCollapsibleOrder rtl={isRtl} />
  )

  return isRtl ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr">
        <select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
        <button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button>
      </div>
      <div class="doc-rtl-preview doc-collapsible-rtl-preview" dir="rtl" data-lang="ar">{content}</div>
    </div>
  ) : content
}

function DocCollapsibleOrder(props: { rtl: boolean }) {
  const rtl = untrack(() => props.rtl)
  const translated = (arabic: string, hebrew: string, english: string) => rtl
    ? <span data-doc-rtl-text data-text-ar={arabic} data-text-he={hebrew} data-text-en={english}>{arabic}</span>
    : english
  const contentId = rtl ? "collapsible-rtl-content" : "collapsible-demo-content"
  return (
    <div class="doc-collapsible-order" data-slot="collapsible" data-state="closed" data-doc-collapsible data-doc-rtl-direction={rtl ? "true" : undefined} dir={rtl ? "rtl" : "ltr"}>
      <div class="doc-collapsible-order-header">
        <h4>{translated("الطلب #4189", "הזמנה #4189", "Order #4189")}</h4>
        <button type="button" class="doc-collapsible-order-trigger" data-slot="collapsible-trigger" data-doc-collapsible-trigger data-state="closed" aria-expanded="false" aria-controls={contentId}>
          {renderDocCollapsibleIcon("up-down")}<span class="sr-only">Toggle details</span>
        </button>
      </div>
      <div class="doc-collapsible-order-row"><span>{translated("الحالة", "סטטוס", "Status")}</span><strong>{translated("تم الشحن", "נשלח", "Shipped")}</strong></div>
      <div id={contentId} class="doc-collapsible-order-content" data-slot="collapsible-content" data-state="closed" hidden>
        <div class="doc-collapsible-order-detail"><strong>{translated("عنوان الشحن", "כתובת משלוח", "Shipping address")}</strong><span>{translated("100 Market St, San Francisco", "100 Market St, San Francisco", "100 Market St, San Francisco")}</span></div>
        <div class="doc-collapsible-order-detail"><strong>{translated("العناصر", "פריטים", "Items")}</strong><span>{translated("2x سماعات الاستوديو", "2x אוזניות סטודיו", "2x Studio Headphones")}</span></div>
      </div>
    </div>
  )
}

function renderDocCollapsibleIcon(kind: "up-down" | "maximize" | "minimize" | "file") {
  return kind === "up-down" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"></path></svg>
  ) : kind === "maximize" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>
  ) : kind === "minimize" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"></path></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6"></path></svg>
  )
}

function DocCheckboxPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "checkbox-rtl"
  const fields = <div class="doc-checkbox-fields" data-doc-rtl-direction={isRtl ? "true" : undefined} dir={isRtl ? "rtl" : "ltr"}>
    <DocCheckboxField id={`${name}-terms`} label={isRtl ? "قبول الشروط والأحكام" : "Accept terms and conditions"} labelHe={isRtl ? "קבל תנאים והגבלות" : undefined} labelEn={isRtl ? "Accept terms and conditions" : undefined} />
    <DocCheckboxField id={`${name}-terms-description`} checked label={isRtl ? "قبول الشروط والأحكام" : "Accept terms and conditions"} labelHe={isRtl ? "קבל תנאים והגבלות" : undefined} labelEn={isRtl ? "Accept terms and conditions" : undefined} description={isRtl ? "بالنقر على هذا المربع، فإنك توافق على الشروط." : "By clicking this checkbox, you agree to the terms."} descriptionHe={isRtl ? "על ידי לחיצה על תיבת הסימון הזו, אתה מסכים לתנאים." : undefined} descriptionEn={isRtl ? "By clicking this checkbox, you agree to the terms." : undefined} />
    <DocCheckboxField id={`${name}-disabled`} disabled label={isRtl ? "تفعيل الإشعارات" : "Enable notifications"} labelHe={isRtl ? "הפעל התראות" : undefined} labelEn={isRtl ? "Enable notifications" : undefined} />
    <DocCheckboxField id={`${name}-notifications`} label={isRtl ? "تفعيل الإشعارات" : "Enable notifications"} labelHe={isRtl ? "הפעל התראות" : undefined} labelEn={isRtl ? "Enable notifications" : undefined} description={isRtl ? "يمكنك تفعيل أو إلغاء تفعيل الإشعارات في أي وقت." : "You can enable or disable notifications at any time."} descriptionHe={isRtl ? "אתה יכול להפעיל או להשבית התראות בכל עת." : undefined} descriptionEn={isRtl ? "You can enable or disable notifications at any time." : undefined} wrapped />
  </div>
  const content = name === "checkbox-demo" || isRtl ? fields : name === "checkbox-invalid" ? <div class="doc-checkbox-fields is-narrow"><DocCheckboxField id="checkbox-invalid-control" label="Accept terms and conditions" invalid /></div> : name === "checkbox-basic" ? <div class="doc-checkbox-fields is-narrow"><DocCheckboxField id="checkbox-basic-control" label="Accept terms and conditions" /></div> : name === "checkbox-description" ? <div class="doc-checkbox-fields is-description"><DocCheckboxField id="checkbox-description-control" checked label="Accept terms and conditions" description="By clicking this checkbox, you agree to the terms and conditions." /></div> : name === "checkbox-disabled" ? <div class="doc-checkbox-fields is-narrow"><DocCheckboxField id="checkbox-disabled-control" disabled label="Enable notifications" /></div> : name === "checkbox-group" ? <fieldset class="doc-checkbox-group"><legend>Show these items on the desktop:</legend><p>Select the items you want to show on the desktop.</p>{[["hard-disks", "Hard disks", true], ["external-disks", "External disks", true], ["cds", "CDs, DVDs, and iPods", false], ["servers", "Connected servers", false]].map(([id, label, checked]) => <DocCheckboxField id={`checkbox-${id}`} label={label as string} checked={checked as boolean} />)}</fieldset> : <DocCheckboxTable />
  return isRtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-checkbox-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocCheckboxField(props: { id: string; label: string; labelHe?: string; labelEn?: string; checked?: boolean; disabled?: boolean; invalid?: boolean; description?: string; descriptionHe?: string; descriptionEn?: string; wrapped?: boolean }) {
  const id = untrack(() => props.id)
  const label = untrack(() => props.label)
  const labelHe = untrack(() => props.labelHe)
  const labelEn = untrack(() => props.labelEn)
  const checked = untrack(() => !!props.checked)
  const disabled = untrack(() => !!props.disabled)
  const invalid = untrack(() => !!props.invalid)
  const description = untrack(() => props.description)
  const descriptionHe = untrack(() => props.descriptionHe)
  const descriptionEn = untrack(() => props.descriptionEn)
  const wrapped = untrack(() => !!props.wrapped)
  const labelNode = labelHe && labelEn ? <span data-doc-rtl-text data-text-ar={label} data-text-he={labelHe} data-text-en={labelEn}>{label}</span> : label
  const descriptionNode = description && descriptionHe && descriptionEn ? <span data-doc-rtl-text data-text-ar={description} data-text-he={descriptionHe} data-text-en={descriptionEn}>{description}</span> : description
  return <label class={`doc-checkbox-field${disabled ? " is-disabled" : ""}${invalid ? " is-invalid" : ""}${wrapped ? " is-wrapped" : ""}`} for={id}><button id={id} type="button" role="checkbox" class="doc-checkbox-control" aria-checked={checked ? "true" : "false"} data-state={checked ? "checked" : "unchecked"} aria-invalid={invalid ? "true" : undefined} disabled={disabled} data-doc-checkbox><span aria-hidden="true">✓</span></button><span class="doc-checkbox-copy"><strong>{labelNode}</strong>{descriptionNode ? <small>{descriptionNode}</small> : null}</span></label>
}

function DocCheckboxTable() {
  const rows = [["Sarah Chen", "sarah.chen@example.com", "Admin"], ["Marcus Rodriguez", "marcus.rodriguez@example.com", "User"], ["Priya Patel", "priya.patel@example.com", "User"], ["David Kim", "david.kim@example.com", "Editor"]]
  return <div class="doc-checkbox-table" data-doc-checkbox-table><table><thead><tr><th><button type="button" role="checkbox" class="doc-checkbox-control" aria-label="Select all rows" aria-checked="false" data-state="unchecked" data-doc-checkbox data-doc-checkbox-select-all><span aria-hidden="true">✓</span></button></th><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>{rows.map((row, index) => <tr data-state={index === 0 ? "selected" : undefined}><td><button type="button" role="checkbox" class="doc-checkbox-control" aria-label={`Select ${row[0]}`} aria-checked={index === 0 ? "true" : "false"} data-state={index === 0 ? "checked" : "unchecked"} data-doc-checkbox data-doc-checkbox-row><span aria-hidden="true">✓</span></button></td><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></table></div>
}

function DocChartPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isDemo = name === "chart-demo"
  const isTooltipGuide = name === "chart-tooltip"
  const isRtl = name === "chart-rtl"
  const showGrid = !["chart-example"].includes(name)
  const showAxis = !["chart-example", "chart-example-grid"].includes(name)
  const showLegend = name === "chart-example-legend" || isRtl
  const values = [[186, 80], [305, 200], [237, 120], [73, 190], [209, 130], [214, 140]]
  // Recharts lays the plot out with a 5px margin and a "nice" y-domain of 320
  // for this data; the baseline moves up as the axis and legend claim space.
  // The RTL preview is rendered into a larger 558x314 box, so it carries its
  // own scaled-up geometry rather than being stretched from the 509x286 one.
  const baseline = isRtl ? 250.9 : showLegend ? 223 : showAxis ? 251 : 281
  const barScale = (baseline - 5) / 320
  const gridLines = isRtl
    ? [5, 66.5, 127.9, 189.4, 250.9]
    : showLegend
      ? [5, 59.5, 114, 168.5, 223]
      : showAxis
        ? [5, 66.5, 128, 189.5, 251]
        : [5, 74, 143, 212, 281]
  const barStart = isRtl ? 14.2 : 13.3
  const barStep = isRtl ? 91.3 : 83.167
  const barWidth = isRtl ? 34 : 31
  const mobileOffset = isRtl ? 38 : 35
  const gridEnd = isRtl ? 553 : 504

  const bars = isDemo ? [[222, 150], [97, 180], [167, 120], [242, 260], [373, 290], [301, 340], [245, 180], [409, 320], [59, 110], [261, 190], [327, 350], [292, 210], [342, 380], [137, 220], [120, 170], [138, 190], [446, 360], [364, 410], [243, 180], [89, 150], [137, 200], [224, 170], [138, 230], [387, 290], [215, 250], [75, 130], [383, 420], [122, 180], [315, 240], [454, 380]] : values
  const renderedBars = isRtl ? [...bars].reverse() : bars
  const chart = <div class={`doc-chart${isRtl ? " is-rtl" : ""}`} data-chart data-doc-chart dir={isRtl ? "rtl" : "ltr"} data-doc-rtl-direction={isRtl ? "true" : undefined}>
    <svg viewBox={`0 0 ${isDemo ? 590 : isRtl ? 558 : 509} ${isDemo ? 250 : isRtl ? 314 : 286}`} role="img" aria-label="Desktop and mobile visitors">
      <g class="doc-chart-grid">{showGrid ? (isDemo ? [0, 55, 110, 165, 220].map((y) => <line x1="12" x2="578" y1={y} y2={y}></line>) : gridLines.map((y) => <line x1="5" x2={gridEnd} y1={y} y2={y}></line>)) : null}</g>
      <g class="doc-chart-bars">{renderedBars.map((pair, index) => {
        const x = isDemo ? 13.9 + index * 18.85 : barStart + index * barStep
        const desktopHeight = isDemo ? pair[0] * 0.3666 : pair[0] * barScale
        const mobileHeight = isDemo ? pair[1] * 0.3666 : pair[1] * barScale
        return <g data-doc-chart-bar data-label={isDemo ? `Apr ${index + 1}` : ["January", "February", "March", "April", "May", "June"][index]} data-desktop={pair[0]} data-mobile={pair[1]}><rect class="is-desktop" data-doc-chart-value-desktop={desktopHeight} data-doc-chart-value-mobile={mobileHeight} x={x} y={isDemo ? 220 - desktopHeight : baseline - desktopHeight} width={isDemo ? 15 : barWidth} height={desktopHeight} rx={isDemo ? "0" : "4"}></rect>{isDemo ? null : <rect class="is-mobile" x={x + mobileOffset} y={baseline - mobileHeight} width={barWidth} height={mobileHeight} rx="4"></rect>}</g>
      })}</g>
      {isDemo ? <g class="doc-chart-axis">{[2, 6, 10, 14, 18, 22, 26, 30].map((day) => <text x={21.4 + (day - 1) * 18.85} y="242" text-anchor="middle">Apr {day}</text>)}</g> : showAxis ? <g class="doc-chart-axis">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, index) => {
        const sourceIndex = isRtl ? 5 - index : index
        const english = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][sourceIndex]
        const arabic = ["ينا", "فبر", "مار", "أبر", "ماي", "يون"][sourceIndex]
        const hebrew = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יונ"][sourceIndex]
        return <text x={barStart + (mobileOffset + barWidth) / 2 + index * barStep} y={baseline + 24} text-anchor="middle" data-doc-rtl-text={isRtl ? "true" : undefined} data-text-ar={isRtl ? arabic : undefined} data-text-he={isRtl ? hebrew : undefined} data-text-en={isRtl ? english : undefined}>{isRtl ? arabic : label}</text>
      })}</g> : null}
    </svg>
    {showLegend ? <div class="doc-chart-legend"><span><i class="is-desktop"></i><b data-doc-rtl-text={isRtl ? "true" : undefined} data-text-ar="سطح المكتب" data-text-he="שולחן עבודה" data-text-en="Desktop">{isRtl ? "سطح المكتب" : "Desktop"}</b></span><span><i class="is-mobile"></i><b data-doc-rtl-text={isRtl ? "true" : undefined} data-text-ar="الجوال" data-text-he="נייד" data-text-en="Mobile">{isRtl ? "الجوال" : "Mobile"}</b></span></div> : null}<div class="doc-chart-hover" role="tooltip" hidden></div>
  </div>
  const content = isTooltipGuide ? <div class="doc-chart-tooltip-guide"><div><strong>Page Views</strong><span>Desktop <b>186</b></span><span>Mobile <b>80</b></span></div><div><span>Chrome <b>1,286</b></span><span>Firefox <b>1,000</b></span></div><div><strong>Page Views</strong><span>Desktop <b>12,486</b></span></div><div><span>Chrome <b>1,286</b></span></div></div> : isDemo ? <article class="doc-chart-demo-card" data-slot="card"><header><div><h4>Bar Chart - Interactive</h4><p>Showing total visitors for the last 3 months</p></div><div><button type="button" data-doc-chart-series="desktop" aria-pressed="true"><span>Desktop</span><strong>7,324</strong></button><button type="button" data-doc-chart-series="mobile" aria-pressed="false"><span>Mobile</span><strong>7,250</strong></button></div></header>{chart}</article> : chart
  return isRtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-chart-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocCarouselPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "carousel-rtl"
  const variant = name.replace("carousel-", "")
  const carousel = (
    <div class={`doc-carousel is-${variant}`} data-slot="carousel" data-doc-carousel data-carousel-index="0" data-carousel-count="5" data-carousel-variant={variant} data-doc-rtl-direction={isRtl ? "true" : undefined} dir={isRtl ? "rtl" : "ltr"} role="region" aria-roledescription="carousel" tabIndex={0}>
      <div class="doc-carousel-content" data-slot="carousel-content"><div class="doc-carousel-track">
        {Array.from({ length: 5 }, (_, index) => <div class="doc-carousel-item" data-slot="carousel-item" role="group" aria-roledescription="slide" aria-label={`${index + 1} of 5`}><div class="doc-carousel-item-pad"><div class="doc-carousel-card" data-slot="card"><div class="doc-carousel-card-content" data-slot="card-content"><strong data-doc-rtl-text={isRtl ? "true" : undefined} data-text-ar={isRtl ? "٠١٢٣٤٥"[index + 1] : undefined} data-text-he={isRtl ? String(index + 1) : undefined} data-text-en={isRtl ? String(index + 1) : undefined}>{isRtl ? "٠١٢٣٤٥"[index + 1] : index + 1}</strong></div></div></div></div>)}
      </div></div>
      <button type="button" class="doc-carousel-previous" data-doc-carousel-previous aria-label="Previous slide" disabled>{renderDocButtonIcon(variant === "orientation" ? "arrow-up" : "arrow-left")}</button>
      <button type="button" class="doc-carousel-next" data-doc-carousel-next aria-label="Next slide">{renderDocButtonIcon(variant === "orientation" ? "arrow-down" : "arrow-right")}</button>
    </div>
  )
  const content = name === "carousel-api" ? <div class="doc-carousel-api-wrap">{carousel}<p data-doc-carousel-status>Slide 1 of 5</p></div> : carousel
  return isRtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-carousel-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocCardPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "card-rtl"
  const content = name === "card-small" ? (
    <article class="doc-card is-small" data-slot="card" data-size="sm">
      <header class="doc-card-header" data-slot="card-header"><h4 data-slot="card-title">Small Card</h4><p data-slot="card-description">This card uses the small size variant.</p></header>
      <div class="doc-card-content" data-slot="card-content"><p>The card component supports a size prop that can be set to &quot;sm&quot; for a more compact appearance.</p></div>
      <footer class="doc-card-footer" data-slot="card-footer"><button type="button" class="doc-button is-outline is-sm" data-slot="button">Action</button></footer>
    </article>
  ) : name === "card-image" ? (
    <article class="doc-card is-image" data-slot="card">
      <div class="doc-card-image-shade" aria-hidden="true"></div><img src="https://avatar.vercel.sh/shadcn1" alt="Event cover" />
      <header class="doc-card-header" data-slot="card-header"><div class="doc-card-action" data-slot="card-action"><span class="doc-badge is-secondary" data-slot="badge">Featured</span></div><h4 data-slot="card-title">Design systems meetup</h4><p data-slot="card-description">A practical talk on component APIs, accessibility, and shipping faster.</p></header>
      <footer class="doc-card-footer" data-slot="card-footer"><button type="button" class="doc-button is-default" data-slot="button">View Event</button></footer>
    </article>
  ) : (
    <DocLoginCard rtl={isRtl} />
  )

  return isRtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-card-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocLoginCard(props: { rtl: boolean }) {
  const rtl = untrack(() => props.rtl)
  const text = (ar: string, he: string, en: string) => rtl ? <span data-doc-rtl-text data-text-ar={ar} data-text-he={he} data-text-en={en}>{ar}</span> : en
  return (
    <article class="doc-card" data-slot="card" dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}>
      <header class="doc-card-header" data-slot="card-header">
        <h4 data-slot="card-title">{text("تسجيل الدخول إلى حسابك", "התחבר לחשבון שלך", "Login to your account")}</h4>
        <p data-slot="card-description">{text("أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك", "הזן את האימייל שלך למטה כדי להתחבר לחשבון שלך", "Enter your email below to login to your account")}</p>
        <div class="doc-card-action" data-slot="card-action"><button type="button" class="doc-button is-link" data-slot="button">{text("إنشاء حساب", "הירשם", "Sign Up")}</button></div>
      </header>
      <div class="doc-card-content" data-slot="card-content"><form><div class="doc-card-fields"><label>{text("البريد الإلكتروني", "אימייל", "Email")}<input type="email" placeholder="m@example.com" required /></label><label><span class="doc-card-password-label">{text("كلمة المرور", "סיסמה", "Password")}<a href="#">{text("نسيت كلمة المرور؟", "שכחת את הסיסמה?", "Forgot your password?")}</a></span><input type="password" required /></label></div></form></div>
      <footer class="doc-card-footer" data-slot="card-footer"><button type="button" class="doc-button is-default" data-slot="button">{text("تسجيل الدخول", "התחבר", "Login")}</button><button type="button" class="doc-button is-outline" data-slot="button">{text("تسجيل الدخول باستخدام Google", "התחבר עם Google", "Login with Google")}</button></footer>
    </article>
  )
}

function DocCalendarPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const year = new Date().getFullYear()
  const month = new Date().getMonth()
  const isRtl = name === "calendar-rtl"
  const calendar = name === "calendar-hijri" ? (
    <DocCalendar variant="hijri" year={2025} month={5} selectedDay={12} />
  ) : name === "calendar-range" ? (
    <DocCalendar variant="range" year={year} month={0} selectedDay={12} rangeEnd={11} months={2} />
  ) : name === "calendar-presets" ? (
    <div class="doc-calendar-card is-presets" data-slot="card"><DocCalendar variant="presets" year={year} month={month} /><div class="doc-calendar-presets">{["Today", "Tomorrow", "In 3 days", "In a week", "In 2 weeks"].map((label, index) => <button type="button" data-doc-calendar-preset={index === 0 ? "0" : index === 1 ? "1" : index === 2 ? "3" : index === 3 ? "7" : "14"}>{label}</button>)}</div></div>
  ) : name === "calendar-time" ? (
    <div class="doc-calendar-card is-time" data-slot="card"><DocCalendar variant="time" year={year} month={month} selectedDay={12} /><div class="doc-calendar-time-fields"><label>Start Time<div><span>◷</span><input type="time" step="1" value="10:30:00" /></div></label><label>End Time<div><span>◷</span><input type="time" step="1" value="12:30:00" /></div></label></div></div>
  ) : name === "calendar-booked-dates" ? (
    <div class="doc-calendar-card is-compact" data-slot="card"><DocCalendar variant="booked" year={year} month={1} selectedDay={3} /></div>
  ) : name === "calendar-custom-days" ? (
    <div class="doc-calendar-card is-custom" data-slot="card"><DocCalendar variant="custom" year={year} month={11} selectedDay={8} rangeEnd={18} dropdown /></div>
  ) : name === "calendar-week-numbers" ? (
    <div class="doc-calendar-card is-week" data-slot="card"><DocCalendar variant="week" year={year} month={1} selectedDay={3} showWeekNumbers /></div>
  ) : (
    <DocCalendar variant={isRtl ? "rtl" : "default"} year={year} month={month} selectedDay={name === "calendar-demo" || isRtl ? new Date().getDate() : undefined} dropdown={name === "calendar-demo" || name === "calendar-caption" || isRtl} />
  )

  return isRtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-calendar-rtl-preview" dir="rtl" data-lang="ar">{calendar}</div></div> : calendar
}

function DocCalendar(props: { variant: string; year: number; month: number; selectedDay?: number; rangeEnd?: number; months?: number; dropdown?: boolean; showWeekNumbers?: boolean }) {
  const variant = untrack(() => props.variant)
  const year = untrack(() => props.year)
  const month = untrack(() => props.month)
  const months = untrack(() => props.months || 1)
  const selectedDay = untrack(() => props.selectedDay)
  const rangeEnd = untrack(() => props.rangeEnd)
  const dropdown = untrack(() => props.dropdown)
  const showWeekNumbers = untrack(() => props.showWeekNumbers)
  const toDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  const rangeStart = selectedDay === undefined ? undefined : toDateKey(new Date(year, month, selectedDay))
  const rangeEndDate = rangeEnd === undefined ? undefined : toDateKey(new Date(year, month + (variant === "range" ? 1 : 0), rangeEnd))
  return (
    <div class={`doc-calendar is-${variant}`} data-slot="calendar" data-doc-calendar data-calendar-variant={variant} data-calendar-year={year} data-calendar-month={month} data-calendar-mode={variant === "range" || variant === "custom" ? "range" : "single"} data-selected-date={variant === "range" || variant === "custom" ? undefined : rangeStart} data-range-start={rangeStart} data-range-end={rangeEndDate} dir={variant === "rtl" || variant === "hijri" ? "rtl" : "ltr"} data-doc-rtl-direction={variant === "rtl" ? "true" : undefined}>
      {Array.from({ length: months }, (_, index) => <DocCalendarMonth variant={variant} year={year} month={month + index} selectedDay={selectedDay} rangeEnd={rangeEnd} dropdown={dropdown && index === 0} showWeekNumbers={showWeekNumbers} monthIndex={index} />)}
    </div>
  )
}

function DocCalendarMonth(props: { variant: string; year: number; month: number; selectedDay?: number; rangeEnd?: number; dropdown?: boolean; showWeekNumbers?: boolean; monthIndex: number }) {
  const variant = untrack(() => props.variant)
  const sourceYear = untrack(() => props.year)
  const sourceMonth = untrack(() => props.month)
  const selectedDay = untrack(() => props.selectedDay)
  const rangeEndValue = untrack(() => props.rangeEnd)
  const dropdown = untrack(() => props.dropdown)
  const showWeekNumbers = untrack(() => props.showWeekNumbers)
  const monthIndex = untrack(() => props.monthIndex)
  const normalized = new Date(sourceYear, sourceMonth, 1)
  const year = normalized.getFullYear()
  const month = normalized.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const previousDays = new Date(year, month, 0).getDate()
  const cellCount = variant === "hijri" ? 42 : Math.ceil((firstDay + daysInMonth) / 7) * 7
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const raw = index - firstDay + 1
    const date = new Date(year, month, raw)
    return raw < 1 ? { day: previousDays + raw, outside: true, date } : raw > daysInMonth ? { day: raw - daysInMonth, outside: true, date } : { day: raw, outside: false, date }
  })
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const isArabic = variant === "rtl"
  const isHijri = variant === "hijri"
  const weekdays = isArabic ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : isHijri ? ["ش", "۱ش", "۲ش", "۳ش", "۴ش", "۵ش", "ج"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
  return (
    <section class="doc-calendar-month" data-calendar-month-index={monthIndex}>
      <header class="doc-calendar-caption">
        <button type="button" aria-label="Go to the Previous Month" data-doc-calendar-nav="previous">{renderDocButtonIcon("arrow-left")}</button>
        {dropdown ? <div class="doc-calendar-dropdowns"><select aria-label="Choose the Month" value={String(month)} data-doc-calendar-month-select>{monthNames.map((label, value) => <option value={String(value)} selected={value === month} data-doc-rtl-text={isArabic ? "true" : undefined} data-text-ar={isArabic ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"][value] : undefined} data-text-he={isArabic ? ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"][value] : undefined} data-text-en={isArabic ? label.slice(0, 3) : undefined}>{isArabic ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"][value] : label.slice(0, variant === "custom" ? undefined : 3)}</option>)}</select><select aria-label="Choose the Year" value={String(year)} data-doc-calendar-year-select>{Array.from({ length: 201 }, (_, index) => year - 100 + index).map((value) => <option value={String(value)} selected={value === year}>{value}</option>)}</select></div> : <strong data-doc-calendar-caption>{isHijri ? "خرداد ۱۴۰۴" : `${monthNames[month]} ${year}`}</strong>}
        <button type="button" aria-label="Go to the Next Month" data-doc-calendar-nav="next">{renderDocButtonIcon("arrow-right")}</button>
      </header>
      <div class={`doc-calendar-grid${showWeekNumbers ? " has-week-numbers" : ""}`} role="grid">
        {showWeekNumbers ? <span class="doc-calendar-week-heading">#</span> : null}{weekdays.map((label, index) => <span class="doc-calendar-weekday" role="columnheader" data-doc-rtl-text={isArabic ? "true" : undefined} data-text-ar={isArabic ? label : undefined} data-text-he={isArabic ? ["א", "ב", "ג", "ד", "ה", "ו", "ש"][index] : undefined} data-text-en={isArabic ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][index] : undefined}>{label}</span>)}
        {cells.map((cell, index) => {
          const dateKey = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, "0")}-${String(cell.date.getDate()).padStart(2, "0")}`
          const startDate = selectedDay === undefined ? undefined : new Date(sourceYear, sourceMonth, selectedDay)
          const endDate = rangeEndValue === undefined ? undefined : new Date(sourceYear, sourceMonth + (variant === "range" ? 1 : 0), rangeEndValue)
          const rangeStart = startDate !== undefined && cell.date.getTime() === startDate.getTime()
          const rangeEnd = endDate !== undefined && cell.date.getTime() === endDate.getTime()
          const rangeMiddle = startDate !== undefined && endDate !== undefined && cell.date > startDate && cell.date < endDate
          const selected = endDate !== undefined ? rangeStart || rangeEnd || rangeMiddle : !cell.outside && cell.day === selectedDay
          const booked = variant === "booked" && !cell.outside && cell.day >= 12 && cell.day <= 26
          const today = !cell.outside && cell.date.toDateString() === new Date().toDateString()
          return <>{showWeekNumbers && index % 7 === 0 ? <span class="doc-calendar-week-number">{String(6 + index / 7).padStart(2, "0")}</span> : null}<button type="button" class={`doc-calendar-day${cell.outside ? " is-outside" : ""}${booked ? " is-booked" : ""}${today ? " is-today" : ""}${rangeStart ? " is-range-start" : ""}${rangeEnd ? " is-range-end" : ""}${rangeMiddle ? " is-range-middle" : ""}`} role="gridcell" data-doc-calendar-day data-day={cell.day} data-date={dateKey} data-outside={cell.outside ? "true" : undefined} aria-selected={selected ? "true" : "false"} disabled={booked}>{isHijri ? String(cell.day).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]) : cell.day}{variant === "custom" && !cell.outside ? <small>{new Date(year, month, cell.day).getDay() % 6 === 0 ? "$120" : "$100"}</small> : null}</button></>
        })}
      </div>
    </section>
  )
}

type DocButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
type DocButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"

function DocButtonPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "button-rtl"
  const simple: Record<string, { label: string; variant: DocButtonVariant }> = {
    "button-default": { label: "Button", variant: "default" },
    "button-outline": { label: "Outline", variant: "outline" },
    "button-secondary": { label: "Secondary", variant: "secondary" },
    "button-ghost": { label: "Ghost", variant: "ghost" },
    "button-destructive": { label: "Destructive", variant: "destructive" },
    "button-link": { label: "Link", variant: "link" },
  }
  const entry = simple[name]
  const content = name === "button-demo" ? (
    <div class="doc-button-row">
      <DocButton label="Button" variant="outline" />
      <DocButton label="" variant="outline" size="icon" icon="arrow-up" ariaLabel="Submit" />
    </div>
  ) : name === "button-size" ? (
    <div class="doc-button-size-row">
      <div><DocButton label="Extra Small" variant="outline" size="xs" /><DocButton label="" variant="outline" size="icon-xs" icon="arrow-up-right" ariaLabel="Submit" /></div>
      <div><DocButton label="Small" variant="outline" size="sm" /><DocButton label="" variant="outline" size="icon-sm" icon="arrow-up-right" ariaLabel="Submit" /></div>
      <div><DocButton label="Default" variant="outline" /><DocButton label="" variant="outline" size="icon" icon="arrow-up-right" ariaLabel="Submit" /></div>
      <div><DocButton label="Large" variant="outline" size="lg" /><DocButton label="" variant="outline" size="icon-lg" icon="arrow-up-right" ariaLabel="Submit" /></div>
    </div>
  ) : entry ? (
    <DocButton label={entry.label} variant={entry.variant} />
  ) : name === "button-icon" ? (
    <DocButton label="" variant="outline" size="icon" icon="circle-arrow" ariaLabel="Submit" />
  ) : name === "button-with-icon" ? (
    <DocButton label="New Branch" variant="outline" size="sm" icon="branch" />
  ) : name === "button-rounded" ? (
    <DocButton label="" variant="outline" size="icon" icon="arrow-up" rounded ariaLabel="Submit" />
  ) : name === "button-spinner" ? (
    <div class="doc-button-row">
      <DocButton label="Generating" variant="outline" icon="spinner" disabled />
      <DocButton label="Downloading" variant="secondary" endIcon="spinner" disabled />
    </div>
  ) : name === "button-group-demo" ? (
    <div class="doc-button-groups" data-slot="button-group">
      <div class="doc-button-group"><DocButton label="" variant="outline" size="icon" icon="arrow-left" ariaLabel="Go Back" /></div>
      <div class="doc-button-group"><DocButton label="Archive" variant="outline" /><DocButton label="Report" variant="outline" /></div>
      <div class="doc-button-group">
        <DocButton label="Snooze" variant="outline" />
        <span class="ui-menu doc-button-menu" data-menu>
          <button type="button" class="doc-button is-outline is-icon" data-slot="button" data-variant="outline" data-size="icon" data-menu-trigger aria-label="More Options" aria-haspopup="menu" aria-expanded="false">{renderDocButtonIcon("more")}</button>
          <div class="ui-menu-panel doc-button-menu-panel" data-menu-panel data-menu-side="bottom" data-menu-align="end" role="menu" hidden>
            <button type="button" class="ui-menu-item" data-menu-item role="menuitem">Mark as Read</button>
            <button type="button" class="ui-menu-item" data-menu-item role="menuitem">Archive</button>
            <span class="doc-avatar-menu-separator" role="separator"></span>
            <button type="button" class="ui-menu-item" data-menu-item role="menuitem">Snooze</button>
            <button type="button" class="ui-menu-item" data-menu-item role="menuitem">Add to Calendar</button>
            <button type="button" class="ui-menu-item" data-menu-item role="menuitem">Add to List</button>
            <button type="button" class="ui-menu-item" data-menu-item role="menuitem">Label As...</button>
            <span class="doc-avatar-menu-separator" role="separator"></span>
            <button type="button" class="ui-menu-item is-destructive" data-menu-item role="menuitem">Trash</button>
          </div>
        </span>
      </div>
    </div>
  ) : name === "button-aschild" ? (
    <DocButton label="Login" variant="default" asLink href="/login" />
  ) : (
    <div class="doc-button-row" dir="rtl" data-doc-rtl-direction>
      <DocButton label="زر" labelHe="כפתור" labelEn="Button" variant="outline" />
      <DocButton label="حذف" labelHe="מחק" labelEn="Delete" variant="destructive" />
      <DocButton label="إرسال" labelHe="שלח" labelEn="Submit" variant="outline" endIcon="arrow-right" />
      <DocButton label="" variant="outline" size="icon" icon="plus" ariaLabel="Add" />
      <DocButton label="جاري التحميل" labelHe="טוען" labelEn="Loading" variant="secondary" icon="spinner" disabled />
    </div>
  )

  return isRtl ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr">
        <select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
        <button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button>
      </div>
      <div class="doc-rtl-preview doc-button-rtl-preview" dir="rtl" data-lang="ar">{content}</div>
    </div>
  ) : content
}

function DocButtonGroupPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "button-group-rtl"
  const content = name === "button-group-orientation" ? (
    <div class="doc-button-group is-vertical" data-slot="button-group" data-orientation="vertical" role="group" aria-label="Media controls">
      <DocButton label="" variant="outline" size="icon" icon="plus" ariaLabel="Increase" />
      <DocButton label="" variant="outline" size="icon" icon="minus" ariaLabel="Decrease" />
    </div>
  ) : name === "button-group-size" ? (
    <div class="doc-button-group-size-stack">
      <div class="doc-button-group" data-slot="button-group" role="group"><DocButton label="Small" variant="outline" size="sm" /><DocButton label="Button" variant="outline" size="sm" /><DocButton label="Group" variant="outline" size="sm" /><DocButton label="" variant="outline" size="icon-sm" icon="plus" /></div>
      <div class="doc-button-group" data-slot="button-group" role="group"><DocButton label="Default" variant="outline" /><DocButton label="Button" variant="outline" /><DocButton label="Group" variant="outline" /><DocButton label="" variant="outline" size="icon" icon="plus" /></div>
      <div class="doc-button-group" data-slot="button-group" role="group"><DocButton label="Large" variant="outline" size="lg" /><DocButton label="Button" variant="outline" size="lg" /><DocButton label="Group" variant="outline" size="lg" /><DocButton label="" variant="outline" size="icon-lg" icon="plus" /></div>
    </div>
  ) : name === "button-group-nested" ? (
    <div class="doc-button-groups" data-slot="button-group" role="group">
      <div class="doc-button-group" data-slot="button-group"><DocButton label="" variant="outline" size="icon" icon="plus" /></div>
      <div class="doc-button-group" data-slot="button-group"><div class="doc-button-input-group"><input aria-label="Message" placeholder="Send a message..." /><button type="button" aria-label="Voice Mode">{renderDocButtonIcon("audio")}</button></div></div>
    </div>
  ) : name === "button-group-separator" ? (
    <div class="doc-button-group is-separator-group" data-slot="button-group" role="group"><DocButton label="Copy" variant="secondary" size="sm" /><span class="doc-button-group-separator" data-slot="button-group-separator"></span><DocButton label="Paste" variant="secondary" size="sm" /></div>
  ) : name === "button-group-split" ? (
    <div class="doc-button-group is-separator-group" data-slot="button-group" role="group"><DocButton label="Button" variant="secondary" /><span class="doc-button-group-separator" data-slot="button-group-separator"></span><DocButton label="" variant="secondary" size="icon" icon="plus" /></div>
  ) : name === "button-group-input" ? (
    <div class="doc-button-group doc-button-input-combo" data-slot="button-group" role="group"><input aria-label="Search" placeholder="Search..." /><DocButton label="" variant="outline" icon="search" ariaLabel="Search" /></div>
  ) : name === "button-group-input-group" ? (
    <div class="doc-button-groups is-pill" data-slot="button-group" role="group">
      <div class="doc-button-group" data-slot="button-group"><DocButton label="" variant="outline" size="icon" icon="plus" /></div>
      <div class="doc-button-group" data-slot="button-group"><div class="doc-button-input-group" data-doc-voice-group><input aria-label="Message" placeholder="Send a message..." /><button type="button" aria-label="Voice Mode" aria-pressed="false" data-doc-voice-toggle>{renderDocButtonIcon("audio")}</button></div></div>
    </div>
  ) : name === "button-group-dropdown" ? (
    <div class="doc-button-group" data-slot="button-group" role="group">
      <DocButton label="Follow" variant="outline" />
      <span class="ui-menu doc-button-menu" data-menu><button type="button" class="doc-button is-outline doc-button-dropdown-trigger" data-slot="button" data-variant="outline" data-size="default" data-menu-trigger aria-label="More follow options" aria-haspopup="menu" aria-expanded="false">{renderDocButtonIcon("chevron-down")}</button><div class="ui-menu-panel doc-button-dropdown-panel" data-menu-panel data-menu-side="bottom" data-menu-align="end" role="menu" hidden>{["Mute Conversation", "Mark as Read", "Report Conversation", "Block User", "Share Conversation", "Copy Conversation", "Delete Conversation"].map((label) => <button type="button" class="ui-menu-item" data-menu-item role="menuitem">{label}</button>)}</div></span>
    </div>
  ) : name === "button-group-select" ? (
    <div class="doc-button-groups" data-slot="button-group" role="group">
      <div class="doc-button-group doc-button-currency-group" data-slot="button-group"><select aria-label="Currency"><option value="$">$</option><option value="€">€</option><option value="£">£</option></select><input aria-label="Amount" placeholder="10.00" inputMode="numeric" /></div>
      <div class="doc-button-group" data-slot="button-group"><DocButton label="" variant="outline" size="icon" icon="arrow-right" ariaLabel="Send" /></div>
    </div>
  ) : name === "button-group-popover" ? (
    <div class="doc-button-group" data-slot="button-group" role="group">
      <DocButton label="Copilot" variant="outline" icon="bot" />
      <span class="ui-menu doc-button-menu" data-menu><button type="button" class="doc-button is-outline is-icon" data-slot="button" data-variant="outline" data-size="icon" data-menu-trigger aria-label="Open Popover" aria-haspopup="dialog" aria-expanded="false">{renderDocButtonIcon("chevron-down")}</button><div class="ui-menu-panel doc-button-popover-panel" data-menu-panel data-menu-side="bottom" data-menu-align="end" role="dialog" aria-label="Start a new task with Copilot" hidden><strong>Start a new task with Copilot</strong><p>Describe your task in natural language.</p><textarea aria-label="Task Description" placeholder="I need to..."></textarea><small>Copilot will open a pull request for review.</small></div></span>
    </div>
  ) : (
    <div class="doc-button-groups" dir="rtl" data-doc-rtl-direction data-slot="button-group" role="group">
      <div class="doc-button-group" data-slot="button-group"><DocButton label="" variant="outline" size="icon" icon="arrow-left" ariaLabel="Go Back" /></div>
      <div class="doc-button-group" data-slot="button-group"><DocButton label="أرشفة" labelHe="ארכיון" labelEn="Archive" variant="outline" /><DocButton label="تقرير" labelHe="דוח" labelEn="Report" variant="outline" /></div>
      <div class="doc-button-group" data-slot="button-group"><DocButton label="تأجيل" labelHe="דחה" labelEn="Snooze" variant="outline" /><span class="ui-menu doc-button-menu" data-menu><button type="button" class="doc-button is-outline is-icon" data-slot="button" data-variant="outline" data-size="icon" data-menu-trigger aria-label="More Options" aria-haspopup="menu" aria-expanded="false">{renderDocButtonIcon("more")}</button><div class="ui-menu-panel doc-button-menu-panel" data-menu-panel data-menu-side="bottom" data-menu-align="end" role="menu" hidden><button type="button" class="ui-menu-item" data-menu-item role="menuitem"><span data-doc-rtl-text data-text-ar="وضع علامة كمقروء" data-text-he="סמן כנקרא" data-text-en="Mark as Read">وضع علامة كمقروء</span></button><button type="button" class="ui-menu-item" data-menu-item role="menuitem"><span data-doc-rtl-text data-text-ar="أرشفة" data-text-he="ארכיון" data-text-en="Archive">أرشفة</span></button><button type="button" class="ui-menu-item is-destructive" data-menu-item role="menuitem"><span data-doc-rtl-text data-text-ar="سلة المهملات" data-text-he="פח" data-text-en="Trash">سلة المهملات</span></button></div></span></div>
    </div>
  )

  return isRtl ? <div class="doc-rtl-preview-shell"><div class="doc-rtl-preview-toolbar" dir="ltr"><select aria-label="Preview language" value="ar" data-doc-rtl-language><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><button type="button" class="doc-rtl-info-button" aria-label="Toggle language information"><RtlInfoIcon /></button></div><div class="doc-rtl-preview doc-button-group-rtl-preview" dir="rtl" data-lang="ar">{content}</div></div> : content
}

function DocButton(props: {
  label: string; labelHe?: string; labelEn?: string; variant: DocButtonVariant; size?: DocButtonSize
  icon?: string; endIcon?: string; ariaLabel?: string; disabled?: boolean; rounded?: boolean; asLink?: boolean; href?: string
}) {
  const size = props.size || "default"
  const icon = untrack(() => props.icon)
  const endIcon = untrack(() => props.endIcon)
  const compactStartIcon = icon === "spinner"
  const className = `doc-button is-${props.variant} is-${size}${props.rounded ? " is-rounded" : ""}${compactStartIcon ? " has-icon-start" : ""}${endIcon ? " has-icon-end" : ""}`
  const label = props.labelHe && props.labelEn
    ? <span data-doc-rtl-text data-text-ar={props.label} data-text-he={props.labelHe} data-text-en={props.labelEn}>{props.label}</span>
    : props.label
  return props.asLink ? (
    <a class={className} data-slot="button" data-variant={props.variant} data-size={size} href={props.href}>{label}</a>
  ) : (
    <button type="button" class={className} data-slot="button" data-variant={props.variant} data-size={size} aria-label={props.ariaLabel} disabled={props.disabled}>
      {icon ? renderDocButtonIcon(icon) : null}{label}{endIcon ? renderDocButtonIcon(endIcon) : null}
    </button>
  )
}

function renderDocButtonIcon(kind: string) {
  return kind === "spinner" ? (
    <svg class="doc-button-spinner" viewBox="0 0 24 24" fill="none" data-icon="inline-start" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3"></circle><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></svg>
  ) : kind === "plus" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
  ) : kind === "minus" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"></path></svg>
  ) : kind === "search" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20l-4-4"></path></svg>
  ) : kind === "audio" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"></path></svg>
  ) : kind === "bot" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="12" rx="2"></rect><path d="M12 3v4M8 12h.01M16 12h.01M9 16h6"></path></svg>
  ) : kind === "chevron-down" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9l6 6l6-6"></path></svg>
  ) : kind === "more" ? (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle></svg>
  ) : kind === "branch" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="6" r="2"></circle><circle cx="6" cy="18" r="2"></circle><circle cx="18" cy="6" r="2"></circle><path d="M6 8v8M8 6h8a2 2 0 0 1 2 2v2c0 4-3 6-7 6H8"></path></svg>
  ) : kind === "circle-arrow" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="m8 12l4-4l4 4M12 8v8"></path></svg>
  ) : (
    <svg class={kind === "arrow-right" ? "doc-button-rtl-arrow" : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={kind === "arrow-left" ? "M19 12H5m6-6l-6 6l6 6" : kind === "arrow-up-right" ? "M7 17L17 7M7 7h10v10" : kind === "arrow-right" ? "M5 12h14m-6-6l6 6l-6 6" : "M12 19V5m-6 6l6-6l6 6"}></path></svg>
  )
}

function DocBreadcrumbPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "breadcrumb-rtl"
  const mode = name === "breadcrumb-demo"
    ? "demo"
    : name === "breadcrumb-separator"
      ? "separator"
      : name === "breadcrumb-dropdown" || isRtl
        ? "dropdown"
        : name === "breadcrumb-ellipsis"
          ? "ellipsis"
          : "basic"

  const content = <DocBreadcrumbTrail mode={mode} rtl={isRtl} />
  return isRtl ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr">
        <select aria-label="Preview language" value="ar" data-doc-rtl-language>
          <option value="ar">Arabic (العربية)</option>
          <option value="he">Hebrew (עברית)</option>
          <option value="en">English</option>
        </select>
        <button type="button" class="doc-rtl-info-button" aria-label="Toggle language information">
          <RtlInfoIcon />
        </button>
      </div>
      <div class="doc-rtl-preview doc-breadcrumb-rtl-preview" dir="rtl" data-lang="ar">{content}</div>
    </div>
  ) : content
}

function DocBreadcrumbTrail(props: { mode: string; rtl: boolean }) {
  const mode = untrack(() => props.mode)
  const rtl = untrack(() => props.rtl)
  const dotSeparators = mode === "separator" || mode === "dropdown"
  const menu = mode === "demo" || mode === "dropdown"
  const ellipsis = mode === "ellipsis"
  const translated = (arabic: string, hebrew: string, english: string) => rtl ? (
    <span data-doc-rtl-text data-text-ar={arabic} data-text-he={hebrew} data-text-en={english}>{arabic}</span>
  ) : english
  const separator = () => (
    <li class="doc-breadcrumb-separator" data-slot="breadcrumb-separator" role="presentation" aria-hidden="true">
      {dotSeparators ? (
        <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2.5"></circle></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18l6-6l-6-6"></path></svg>
      )}
    </li>
  )

  return (
    <nav class="doc-breadcrumb" aria-label="breadcrumb" data-slot="breadcrumb" dir={rtl ? "rtl" : "ltr"} data-doc-rtl-direction={rtl ? "true" : undefined}>
      <ol class="doc-breadcrumb-list" data-slot="breadcrumb-list">
        <li class="doc-breadcrumb-item" data-slot="breadcrumb-item">
          <a class="doc-breadcrumb-link" data-slot="breadcrumb-link" href="#">{translated("الرئيسية", "בית", "Home")}</a>
        </li>
        {separator()}
        {menu ? (
          <li class="doc-breadcrumb-item" data-slot="breadcrumb-item">
            <span class="ui-menu doc-breadcrumb-menu" data-menu data-doc-breadcrumb-menu>
              <button
                type="button"
                class={mode === "demo" ? "doc-breadcrumb-ellipsis-trigger" : "doc-breadcrumb-dropdown-trigger"}
                data-menu-trigger
                aria-haspopup="menu"
                aria-expanded="false"
              >
                {mode === "demo" ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle></svg>
                    <span class="sr-only">Toggle menu</span>
                  </>
                ) : (
                  <>
                    {translated("المكونات", "רכיבים", "Components")}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9l6 6l6-6"></path></svg>
                  </>
                )}
              </button>
              <div class="ui-menu-panel doc-breadcrumb-menu-panel" data-menu-panel data-menu-side="bottom" data-menu-align="start" role="menu" hidden>
                <button type="button" class="ui-menu-item" data-menu-item role="menuitem">{translated("التوثيق", "תיעוד", "Documentation")}</button>
                <button type="button" class="ui-menu-item" data-menu-item role="menuitem">{translated("السمات", "ערכות נושא", "Themes")}</button>
                <button type="button" class="ui-menu-item" data-menu-item role="menuitem">{translated("جيت هاب", "גיטהאב", "GitHub")}</button>
              </div>
            </span>
          </li>
        ) : ellipsis ? (
          <li class="doc-breadcrumb-item" data-slot="breadcrumb-item">
            <span class="doc-breadcrumb-ellipsis" data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle></svg>
              <span class="sr-only">More</span>
            </span>
          </li>
        ) : (
          <li class="doc-breadcrumb-item" data-slot="breadcrumb-item">
            <a class="doc-breadcrumb-link" data-slot="breadcrumb-link" href="#">Components</a>
          </li>
        )}
        {separator()}
        {mode === "demo" || ellipsis ? (
          <>
            <li class="doc-breadcrumb-item" data-slot="breadcrumb-item">
              <a class="doc-breadcrumb-link" data-slot="breadcrumb-link" href="#">Components</a>
            </li>
            {separator()}
          </>
        ) : null}
        <li class="doc-breadcrumb-item" data-slot="breadcrumb-item">
          <span class="doc-breadcrumb-page" data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page">
            {translated("مسار التنقل", "פירורי לחם", "Breadcrumb")}
          </span>
        </li>
      </ol>
    </nav>
  )
}

type DocBadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost"

function DocBadgePreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "badge-rtl"

  const content = name === "badge-demo" ? (
    <div class="doc-badge-row is-centered">
      <DocBadge label="Badge" />
      <DocBadge label="Secondary" variant="secondary" />
      <DocBadge label="Destructive" variant="destructive" />
      <DocBadge label="Outline" variant="outline" />
    </div>
  ) : name === "badge-variants" ? (
    <div class="doc-badge-row">
      <DocBadge label="Default" />
      <DocBadge label="Secondary" variant="secondary" />
      <DocBadge label="Destructive" variant="destructive" />
      <DocBadge label="Outline" variant="outline" />
      <DocBadge label="Ghost" variant="ghost" />
    </div>
  ) : name === "badge-icon" ? (
    <div class="doc-badge-row">
      <DocBadge label="Verified" variant="secondary" startIcon="check" />
      <DocBadge label="Bookmark" variant="outline" endIcon="bookmark" />
    </div>
  ) : name === "badge-spinner" ? (
    <div class="doc-badge-row">
      <DocBadge label="Deleting" variant="destructive" startIcon="spinner" />
      <DocBadge label="Generating" variant="secondary" endIcon="spinner" />
    </div>
  ) : name === "badge-link" ? (
    <a class="doc-badge is-default has-icon-end" data-slot="badge" data-variant="default" href="#link">
      Open Link{renderDocBadgeIcon("external", "inline-end")}
    </a>
  ) : name === "badge-colors" ? (
    <div class="doc-badge-row">
      <DocBadge label="Blue" color="blue" />
      <DocBadge label="Green" color="green" />
      <DocBadge label="Sky" color="sky" />
      <DocBadge label="Purple" color="purple" />
      <DocBadge label="Red" color="red" />
    </div>
  ) : (
    <div class="doc-badge-row is-centered" dir="rtl" data-doc-rtl-direction>
      <DocBadge label="شارة" labelHe="תג" labelEn="Badge" />
      <DocBadge label="ثانوي" labelHe="משני" labelEn="Secondary" variant="secondary" />
      <DocBadge label="مدمر" labelHe="הרסני" labelEn="Destructive" variant="destructive" />
      <DocBadge label="مخطط" labelHe="קווי מתאר" labelEn="Outline" variant="outline" />
      <DocBadge label="متحقق" labelHe="מאומת" labelEn="Verified" variant="secondary" startIcon="check" />
      <DocBadge label="إشارة مرجعية" labelHe="סימנייה" labelEn="Bookmark" variant="outline" endIcon="bookmark" />
    </div>
  )

  return isRtl ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr">
        <select aria-label="Preview language" value="ar" data-doc-rtl-language>
          <option value="ar">Arabic (العربية)</option>
          <option value="he">Hebrew (עברית)</option>
          <option value="en">English</option>
        </select>
        <button type="button" class="doc-rtl-info-button" aria-label="Toggle language information">
          <RtlInfoIcon />
        </button>
      </div>
      <div class="doc-rtl-preview doc-badge-rtl-preview" dir="rtl" data-lang="ar">{content}</div>
    </div>
  ) : content
}

function DocBadge(props: {
  label: string
  labelHe?: string
  labelEn?: string
  variant?: DocBadgeVariant
  color?: "blue" | "green" | "sky" | "purple" | "red"
  startIcon?: "check" | "spinner"
  endIcon?: "bookmark" | "spinner"
}) {
  const variant = props.variant || "default"
  const colorClass = props.color ? ` is-${props.color}` : ""
  const iconClass = props.startIcon ? " has-icon-start" : props.endIcon ? " has-icon-end" : ""
  const startIcon = untrack(() => props.startIcon)
  const endIcon = untrack(() => props.endIcon)
  return (
    <span class={`doc-badge is-${variant}${colorClass}${iconClass}`} data-slot="badge" data-variant={variant}>
      {startIcon ? renderDocBadgeIcon(startIcon, "inline-start") : null}
      {props.labelHe && props.labelEn ? (
        <span data-doc-rtl-text data-text-ar={props.label} data-text-he={props.labelHe} data-text-en={props.labelEn}>{props.label}</span>
      ) : props.label}
      {endIcon ? renderDocBadgeIcon(endIcon, "inline-end") : null}
    </span>
  )
}

function renderDocBadgeIcon(kind: "check" | "bookmark" | "external" | "spinner", position: "inline-start" | "inline-end") {
  return kind === "spinner" ? (
    <svg class="doc-badge-spinner" viewBox="0 0 24 24" fill="none" data-icon={position} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3"></circle>
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
    </svg>
  ) : kind === "check" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-icon={position} aria-hidden="true">
      <path d="M12 3l2.1 2.1l3-.4l.4 3L19.7 10L18 12.5l.7 2.9l-2.9.7L14 18.5L12 17l-2 1.5l-1.8-2.4l-2.9-.7l.7-2.9L4.3 10l2.2-2.3l.4-3l3 .4z"></path>
      <path d="m9 12l2 2l4-4"></path>
    </svg>
  ) : kind === "bookmark" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-icon={position} aria-hidden="true">
      <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4l-6 4z"></path>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-icon={position} aria-hidden="true">
      <path d="M7 17L17 7M7 7h10v10"></path>
    </svg>
  )
}

interface DocAvatarProps {
  src: string
  alt: string
  fallback: string
  size?: "sm" | "lg"
  grayscale?: boolean
  badge?: "online" | "plus"
}

function DocAvatarPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "avatar-rtl"
  const basic = <DocAvatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" grayscale />
  const badge = <DocAvatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" badge="online" />
  const badgeIcon = <DocAvatar src="https://github.com/pranathip.png" alt="@pranathip" fallback="PP" grayscale badge="plus" />
  const group = <DocAvatarGroup />
  const groupCount = <DocAvatarGroup count="+3" />
  const groupCountIcon = <DocAvatarGroup countIcon />
  const layout = (
    <div class="doc-avatar-demo-layout" dir={isRtl ? "rtl" : "ltr"} data-doc-rtl-direction={isRtl ? "true" : undefined}>
      {basic}
      <DocAvatar src="https://github.com/evilrabbit.png" alt="@evilrabbit" fallback="ER" badge="online" />
      <DocAvatarGroup
        count={isRtl ? "+٣" : "+3"}
        rtlCount={isRtl}
      />
    </div>
  )

  const content =
    name === "avatar-demo" || isRtl
      ? layout
      : name === "avatar-basic"
        ? basic
        : name === "avatar-badge"
          ? badge
          : name === "avatar-badge-icon"
            ? badgeIcon
            : name === "avatar-group"
              ? group
              : name === "avatar-group-count"
                ? groupCount
                : name === "avatar-group-count-icon"
                  ? groupCountIcon
                  : name === "avatar-size"
                    ? (
                        <div class="doc-avatar-size-row">
                          <DocAvatar src="https://github.com/shadcn.png" alt="@shadcn small" fallback="CN" size="sm" grayscale />
                          <DocAvatar src="https://github.com/shadcn.png" alt="@shadcn default" fallback="CN" grayscale />
                          <DocAvatar src="https://github.com/shadcn.png" alt="@shadcn large" fallback="CN" size="lg" grayscale />
                        </div>
                      )
                    : (
                        <div class="doc-avatar-dropdown">
                          <button
                            type="button"
                            class="doc-avatar-dropdown-trigger"
                            aria-haspopup="menu"
                            aria-expanded="false"
                            aria-label="Open user menu"
                            data-doc-avatar-menu-trigger
                          >
                            <DocAvatar src="https://github.com/shadcn.png" alt="shadcn" fallback="CN" />
                          </button>
                          <div class="doc-avatar-menu" role="menu" data-doc-avatar-menu hidden>
                            <button type="button" role="menuitem">Profile</button>
                            <button type="button" role="menuitem">Billing</button>
                            <button type="button" role="menuitem">Settings</button>
                            <span class="doc-avatar-menu-separator" role="separator"></span>
                            <button type="button" role="menuitem" class="is-destructive">Log out</button>
                          </div>
                        </div>
                      )

  return isRtl ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr">
        <select aria-label="Preview language" value="ar" data-doc-rtl-language>
          <option value="ar">Arabic (العربية)</option>
          <option value="he">Hebrew (עברית)</option>
          <option value="en">English</option>
        </select>
        <button type="button" class="doc-rtl-info-button" aria-label="Toggle language information">
          <RtlInfoIcon />
        </button>
      </div>
      <div class="doc-rtl-preview doc-avatar-rtl-preview" dir="rtl">{content}</div>
    </div>
  ) : content
}

function DocAvatar(props: DocAvatarProps) {
  const sizeClass = props.size ? ` is-${props.size}` : ""
  return (
    <span class={`doc-avatar${sizeClass}${props.grayscale ? " is-grayscale" : ""}`} data-slot="avatar">
      <span class="doc-avatar-fallback" data-slot="avatar-fallback">{props.fallback}</span>
      <img class="doc-avatar-image" data-slot="avatar-image" src={props.src} alt={props.alt} />
      {props.badge ? (
        <span class={`doc-avatar-badge is-${props.badge}`} data-slot="avatar-badge" aria-hidden="true">
          {props.badge === "plus" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          ) : null}
        </span>
      ) : null}
    </span>
  )
}

function DocAvatarGroup(props: { count?: string; countIcon?: boolean; rtlCount?: boolean }) {
  return (
    <span class="doc-avatar-group" data-slot="avatar-group">
      <DocAvatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" />
      <DocAvatar src="https://github.com/maxleiter.png" alt="@maxleiter" fallback="LR" />
      <DocAvatar src="https://github.com/evilrabbit.png" alt="@evilrabbit" fallback="ER" />
      {props.count || props.countIcon ? (
        <span class="doc-avatar-group-count" data-slot="avatar-group-count">
          {props.countIcon ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          ) : props.rtlCount ? (
            <span data-doc-rtl-text data-text-ar="+٣" data-text-he="+3" data-text-en="+3">{props.count}</span>
          ) : (
            props.count
          )}
        </span>
      ) : null}
    </span>
  )
}

function DocAspectRatioPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "aspect-ratio-rtl"
  const ratioClass =
    name === "aspect-ratio-square"
      ? "is-square"
      : name === "aspect-ratio-portrait"
        ? "is-portrait"
        : "is-landscape"
  const media = (
    <figure class={`doc-aspect-ratio-figure ${ratioClass}`} dir={isRtl ? "rtl" : "ltr"} data-doc-rtl-direction={isRtl ? "true" : undefined}>
      <div class="doc-aspect-ratio" data-slot="aspect-ratio">
        <img src="https://avatar.vercel.sh/shadcn1" alt="Photo" />
      </div>
      {isRtl ? (
        <figcaption
          data-doc-rtl-text
          data-text-ar="منظر طبيعي جميل"
          data-text-he="נוף יפה"
          data-text-en="Beautiful landscape"
        >
          منظر طبيعي جميل
        </figcaption>
      ) : null}
    </figure>
  )

  return isRtl ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr">
        <select aria-label="Preview language" value="ar" data-doc-rtl-language>
          <option value="ar">Arabic (العربية)</option>
          <option value="he">Hebrew (עברית)</option>
          <option value="en">English</option>
        </select>
        <button type="button" class="doc-rtl-info-button" aria-label="Toggle language information">
          <RtlInfoIcon />
        </button>
      </div>
      <div class="doc-rtl-preview doc-aspect-ratio-rtl-preview" dir="rtl">{media}</div>
    </div>
  ) : media
}

interface DocAlertDialogEntry {
  trigger: string
  title: string
  description: string
  cancel: string
  action: string
  size?: "sm"
  media?: "share" | "bluetooth" | "trash"
  destructive?: boolean
}

const docAlertDialogTranslations: Record<"en" | "ar" | "he", DocAlertDialogEntry[]> = {
  en: [
    {
      trigger: "Show Dialog",
      title: "Are you absolutely sure?",
      description:
        "This action cannot be undone. This will permanently delete your account from our servers.",
      cancel: "Cancel",
      action: "Continue",
    },
    {
      trigger: "Show Dialog (sm)",
      title: "Allow accessory to connect?",
      description: "Do you want to allow the USB accessory to connect to this device?",
      cancel: "Don't allow",
      action: "Allow",
      size: "sm",
      media: "bluetooth",
    },
  ],
  ar: [
    {
      trigger: "إظهار الحوار",
      title: "هل أنت متأكد تمامًا؟",
      description: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك نهائيًا من خوادمنا.",
      cancel: "إلغاء",
      action: "متابعة",
    },
    {
      trigger: "إظهار الحوار (صغير)",
      title: "السماح للملحق بالاتصال؟",
      description: "هل تريد السماح لملحق USB بالاتصال بهذا الجهاز؟",
      cancel: "عدم السماح",
      action: "السماح",
      size: "sm",
      media: "bluetooth",
    },
  ],
  he: [
    {
      trigger: "הצג דיאלוג",
      title: "האם אתה בטוח לחלוטין?",
      description: "פעולה זו לא ניתנת לביטול. זה ימחק לצמיתות את החשבון שלך מהשרתים שלנו.",
      cancel: "ביטול",
      action: "המשך",
    },
    {
      trigger: "הצג דיאלוג (קטן)",
      title: "לאפשר להתקן להתחבר?",
      description: "האם אתה רוצה לאפשר להתקן USB להתחבר למכשיר זה?",
      cancel: "אל תאפשר",
      action: "אפשר",
      size: "sm",
      media: "bluetooth",
    },
  ],
}

function DocAlertDialogPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "alert-dialog-rtl"
  const entries: DocAlertDialogEntry[] = isRtl
    ? docAlertDialogTranslations.ar
    : name === "alert-dialog-small"
      ? [
          {
            trigger: "Show Dialog",
            title: "Allow accessory to connect?",
            description: "Do you want to allow the USB accessory to connect to this device?",
            cancel: "Don't allow",
            action: "Allow",
            size: "sm",
          },
        ]
      : name === "alert-dialog-media"
        ? [
            {
              trigger: "Share Project",
              title: "Share this project?",
              description: "Anyone with the link will be able to view and edit this project.",
              cancel: "Cancel",
              action: "Share",
              media: "share",
            },
          ]
        : name === "alert-dialog-small-media"
          ? [
              {
                trigger: "Show Dialog",
                title: "Allow accessory to connect?",
                description: "Do you want to allow the USB accessory to connect to this device?",
                cancel: "Don't allow",
                action: "Allow",
                size: "sm",
                media: "bluetooth",
              },
            ]
          : name === "alert-dialog-destructive"
            ? [
                {
                  trigger: "Delete Chat",
                  title: "Delete chat?",
                  description:
                    "This will permanently delete this chat conversation. View Settings delete any memories saved during this chat.",
                  cancel: "Cancel",
                  action: "Delete",
                  size: "sm",
                  media: "trash",
                  destructive: true,
                },
              ]
            : [docAlertDialogTranslations.en[0]]

  const dialogs = (
    <div class="doc-alert-dialog-preview" dir={isRtl ? "rtl" : "ltr"} data-doc-rtl-direction={isRtl ? "true" : undefined}>
      {entries.map((entry, index) => {
        const english = isRtl ? docAlertDialogTranslations.en[index] : undefined
        const hebrew = isRtl ? docAlertDialogTranslations.he[index] : undefined
        const dialogId = `doc-${name}-${index}`
        const titleId = `${dialogId}-title`
        const descriptionId = `${dialogId}-description`
        return (
          <div class="doc-alert-dialog-root" data-slot="alert-dialog" key={dialogId}>
            <button
              type="button"
              class={`doc-alert-dialog-trigger${entry.destructive ? " is-destructive" : ""}`}
              data-slot="alert-dialog-trigger"
              data-doc-alert-dialog-trigger={dialogId}
              data-doc-rtl-text={isRtl ? "true" : undefined}
              data-text-ar={isRtl ? entry.trigger : undefined}
              data-text-en={english?.trigger}
              data-text-he={hebrew?.trigger}
            >
              {entry.trigger}
            </button>
            <div class="doc-alert-dialog-portal" data-doc-alert-dialog={dialogId} hidden>
              <div class="doc-alert-dialog-overlay" data-slot="alert-dialog-overlay" data-state="closed"></div>
              <div
                class="doc-alert-dialog-content"
                data-slot="alert-dialog-content"
                data-size={entry.size || "default"}
                data-state="closed"
                data-doc-rtl-direction={isRtl ? "true" : undefined}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                dir={isRtl ? "rtl" : "ltr"}
              >
                <div class="doc-alert-dialog-header" data-slot="alert-dialog-header" data-has-media={entry.media ? "true" : "false"}>
                  {entry.media ? <DocAlertDialogMedia kind={entry.media} destructive={entry.destructive} /> : null}
                  <h2
                    id={titleId}
                    class="doc-alert-dialog-title"
                    data-slot="alert-dialog-title"
                    data-doc-rtl-text={isRtl ? "true" : undefined}
                    data-text-ar={isRtl ? entry.title : undefined}
                    data-text-en={english?.title}
                    data-text-he={hebrew?.title}
                  >
                    {entry.title}
                  </h2>
                  <p
                    id={descriptionId}
                    class="doc-alert-dialog-description"
                    data-slot="alert-dialog-description"
                    data-doc-rtl-text={isRtl ? "true" : undefined}
                    data-text-ar={isRtl ? entry.description : undefined}
                    data-text-en={english?.description}
                    data-text-he={hebrew?.description}
                  >
                    {entry.destructive ? (
                      <>
                        This will permanently delete this chat conversation. View <a href="#">Settings</a> delete any
                        memories saved during this chat.
                      </>
                    ) : (
                      entry.description
                    )}
                  </p>
                </div>
                <div class="doc-alert-dialog-footer" data-slot="alert-dialog-footer">
                  <button
                    type="button"
                    class="doc-alert-dialog-cancel"
                    data-slot="alert-dialog-cancel"
                    data-doc-alert-dialog-close
                    data-doc-rtl-text={isRtl ? "true" : undefined}
                    data-text-ar={isRtl ? entry.cancel : undefined}
                    data-text-en={english?.cancel}
                    data-text-he={hebrew?.cancel}
                  >
                    {entry.cancel}
                  </button>
                  <button
                    type="button"
                    class={`doc-alert-dialog-action${entry.destructive ? " is-destructive" : ""}`}
                    data-slot="alert-dialog-action"
                    data-doc-alert-dialog-close
                    data-doc-rtl-text={isRtl ? "true" : undefined}
                    data-text-ar={isRtl ? entry.action : undefined}
                    data-text-en={english?.action}
                    data-text-he={hebrew?.action}
                  >
                    {entry.action}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return isRtl ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr">
        <select aria-label="Preview language" value="ar" data-doc-rtl-language>
          <option value="ar">Arabic (العربية)</option>
          <option value="he">Hebrew (עברית)</option>
          <option value="en">English</option>
        </select>
        <button type="button" class="doc-rtl-info-button" aria-label="Toggle language information">
          <RtlInfoIcon />
        </button>
      </div>
      <div class="doc-rtl-preview doc-alert-dialog-rtl-preview" dir="rtl">{dialogs}</div>
    </div>
  ) : dialogs
}

function DocAlertDialogMedia(props: { kind: NonNullable<DocAlertDialogEntry["media"]>; destructive?: boolean }) {
  const kind = untrack(() => props.kind)
  return (
    <div
      class={`doc-alert-dialog-media${props.destructive ? " is-destructive" : ""}`}
      data-slot="alert-dialog-media"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {kind === "trash" ? (
          <>
            <path d="M4 7h16"></path>
            <path d="M10 11v6"></path>
            <path d="M14 11v6"></path>
            <path d="M5 7l1 14h12l1-14"></path>
            <path d="M9 7V4h6v3"></path>
          </>
        ) : kind === "bluetooth" ? (
          <>
            <path d="m7 7 10 10-5 4V3l5 4L7 17"></path>
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </>
        )}
      </svg>
    </div>
  )
}

interface DocAlertEntry {
  icon: "check" | "info" | "error" | "warning" | "none"
  title: string
  description: string
}

const docAlertTranslations = {
  en: [
    {
      icon: "check",
      title: "Payment successful",
      description:
        "Your payment of $29.99 has been processed. A receipt has been sent to your email address.",
    },
    {
      icon: "info",
      title: "New feature available",
      description: "We've added dark mode support. You can enable it in your account settings.",
    },
  ],
  ar: [
    {
      icon: "check",
      title: "تم الدفع بنجاح",
      description:
        "تمت معالجة دفعتك البالغة 29.99 دولارًا. تم إرسال إيصال إلى عنوان بريدك الإلكتروني.",
    },
    {
      icon: "info",
      title: "ميزة جديدة متاحة",
      description: "لقد أضفنا دعم الوضع الداكن. يمكنك تفعيله في إعدادات حسابك.",
    },
  ],
  he: [
    {
      icon: "check",
      title: "התשלום בוצע בהצלחה",
      description: "התשלום שלך בסך 29.99 דולר עובד. קבלה נשלחה לכתובת האימייל שלך.",
    },
    {
      icon: "info",
      title: "תכונה חדשה זמינה",
      description: "הוספנו תמיכה במצב כהה. אתה יכול להפעיל אותו בהגדרות החשבון שלך.",
    },
  ],
} satisfies Record<"en" | "ar" | "he", DocAlertEntry[]>

function DocAlertPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isRtl = name === "alert-rtl"
  const entries: DocAlertEntry[] =
    name === "alert-demo" || isRtl
      ? isRtl
        ? docAlertTranslations.ar
        : docAlertTranslations.en
      : name === "alert-basic"
        ? [
            {
              icon: "check",
              title: "Account updated successfully",
              description:
                "Your profile information has been saved. Changes will be reflected immediately.",
            },
          ]
        : name === "alert-destructive"
          ? [
              {
                icon: "error",
                title: "Payment failed",
                description:
                  "Your payment could not be processed. Please check your payment method and try again.",
              },
            ]
          : name === "alert-action"
            ? [
                {
                  icon: "none",
                  title: "Dark mode is now available",
                  description: "Enable it under your profile settings to get started.",
                },
              ]
            : [
                {
                  icon: "warning",
                  title: "Your subscription will expire in 3 days.",
                  description:
                    "Renew now to avoid service interruption or upgrade to a paid plan to continue using the service.",
                },
              ]

  const alerts = (
    <div class="doc-alert-stack" dir={isRtl ? "rtl" : "ltr"} data-doc-rtl-direction={isRtl ? "true" : undefined}>
      {entries.map((entry, index) => {
        const english = isRtl ? docAlertTranslations.en[index] : undefined
        const hebrew = isRtl ? docAlertTranslations.he[index] : undefined
        return (
          <div
            class={`doc-alert${name === "alert-destructive" ? " doc-alert-destructive" : ""}${name === "alert-colors" ? " doc-alert-warning" : ""}${entry.icon === "none" ? " doc-alert-no-icon" : ""}`}
            data-slot="alert"
            role="alert"
            key={`${name}-${index}`}
          >
            {entry.icon !== "none" ? <DocAlertIcon kind={entry.icon} /> : null}
            <h4
              class="doc-alert-title"
              data-doc-rtl-text={isRtl ? "true" : undefined}
              data-text-ar={isRtl ? entry.title : undefined}
              data-text-en={english?.title}
              data-text-he={hebrew?.title}
            >
              {entry.title}
            </h4>
            <p
              class="doc-alert-description"
              data-doc-rtl-text={isRtl ? "true" : undefined}
              data-text-ar={isRtl ? entry.description : undefined}
              data-text-en={english?.description}
              data-text-he={hebrew?.description}
            >
              {entry.description}
            </p>
            {name === "alert-action" ? <button type="button" class="doc-alert-action">Enable</button> : null}
          </div>
        )
      })}
    </div>
  )

  return isRtl ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr">
        <select aria-label="Preview language" value="ar" data-doc-rtl-language>
          <option value="ar">Arabic (العربية)</option>
          <option value="he">Hebrew (עברית)</option>
          <option value="en">English</option>
        </select>
        <button type="button" class="doc-rtl-info-button" aria-label="Toggle language information">
          <RtlInfoIcon />
        </button>
      </div>
      <div class="doc-rtl-preview doc-alert-rtl-preview" dir="rtl">{alerts}</div>
    </div>
  ) : alerts
}

function DocAlertIcon(props: { kind: DocAlertEntry["icon"] }) {
  const kind = untrack(() => props.kind)
  return (
    <svg
      class="doc-alert-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {kind === "check" ? (
        <>
          <circle cx="12" cy="12" r="9"></circle>
          <path d="m9 12 2 2 4-4"></path>
        </>
      ) : kind === "info" ? (
        <>
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 11v5"></path>
          <path d="M12 8h.01"></path>
        </>
      ) : kind === "warning" ? (
        <>
          <path d="M12 3 2.8 19h18.4L12 3Z"></path>
          <path d="M12 9v4"></path>
          <path d="M12 16h.01"></path>
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 8v4"></path>
          <path d="M12 16h.01"></path>
        </>
      )}
    </svg>
  )
}

interface DocAccordionItem {
  value: string
  trigger: string
  content: string
  disabled?: boolean
}

const docAccordionItems: Record<string, DocAccordionItem[]> = {
  "accordion-demo": [
    {
      value: "shipping",
      trigger: "What are your shipping options?",
      content:
        "We offer standard (5-7 days), express (2-3 days), and overnight shipping. Free shipping on international orders.",
    },
    {
      value: "returns",
      trigger: "What is your return policy?",
      content:
        "Returns accepted within 30 days. Items must be unused and in original packaging. Refunds processed within 5-7 business days.",
    },
    {
      value: "support",
      trigger: "How can I contact customer support?",
      content:
        "Reach us via email, live chat, or phone. We respond within 24 hours during business days.",
    },
  ],
  "accordion-basic": [
    {
      value: "item-1",
      trigger: "How do I reset my password?",
      content:
        "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a link to reset your password. The link will expire in 24 hours.",
    },
    {
      value: "item-2",
      trigger: "Can I change my subscription plan?",
      content:
        "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.",
    },
    {
      value: "item-3",
      trigger: "What payment methods do you accept?",
      content:
        "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners.",
    },
  ],
  "accordion-multiple": [
    {
      value: "notifications",
      trigger: "Notification Settings",
      content:
        "Manage how you receive notifications. You can enable email alerts for updates or push notifications for mobile devices.",
    },
    {
      value: "privacy",
      trigger: "Privacy & Security",
      content:
        "Control your privacy settings and security preferences. Enable two-factor authentication, manage connected devices, review active sessions, and configure data sharing preferences. You can also download your data or delete your account.",
    },
    {
      value: "billing",
      trigger: "Billing & Subscription",
      content:
        "View your current plan, payment history, and upcoming invoices. Update your payment method, change your subscription tier, or cancel your subscription.",
    },
  ],
  "accordion-disabled": [
    {
      value: "item-1",
      trigger: "Can I access my account history?",
      content:
        "Yes, you can view your complete account history including all transactions, plan changes, and support tickets in the Account History section of your dashboard.",
    },
    {
      value: "item-2",
      trigger: "Premium feature information",
      content:
        "This section contains information about premium features. Upgrade your plan to access this content.",
      disabled: true,
    },
    {
      value: "item-3",
      trigger: "How do I update my email address?",
      content:
        "You can update your email address in your account settings. You'll receive a verification email at your new address to confirm the change.",
    },
  ],
  "accordion-borders": [
    {
      value: "billing",
      trigger: "How does billing work?",
      content:
        "We offer monthly and annual subscription plans. Billing is charged at the beginning of each cycle, and you can cancel anytime. All plans include automatic backups, 24/7 support, and unlimited team members.",
    },
    {
      value: "security",
      trigger: "Is my data secure?",
      content:
        "Yes. We use end-to-end encryption, SOC 2 Type II compliance, and regular third-party security audits. All data is encrypted at rest and in transit using industry-standard protocols.",
    },
    {
      value: "integration",
      trigger: "What integrations do you support?",
      content:
        "We integrate with 500+ popular tools including Slack, Zapier, Salesforce, HubSpot, and more. You can also build custom integrations using our REST API and webhooks.",
    },
  ],
  "accordion-card": [
    {
      value: "plans",
      trigger: "What subscription plans do you offer?",
      content:
        "We offer three subscription tiers: Starter ($9/month), Professional ($29/month), and Enterprise ($99/month). Each plan includes increasing storage limits, API access, priority support, and team collaboration features.",
    },
    {
      value: "billing",
      trigger: "How does billing work?",
      content:
        "Billing occurs automatically at the start of each billing cycle. We accept all major credit cards, PayPal, and ACH transfers for enterprise customers. You'll receive an invoice via email after each payment.",
    },
    {
      value: "cancel",
      trigger: "How do I cancel my subscription?",
      content:
        "You can cancel your subscription anytime from your account settings. There are no cancellation fees or penalties. Your access will continue until the end of your current billing period.",
    },
  ],
}

const docAccordionRtlItems: Record<"en" | "ar" | "he", DocAccordionItem[]> = {
  en: docAccordionItems["accordion-basic"],
  ar: [
    {
      value: "item-1",
      trigger: "كيف يمكنني إعادة تعيين كلمة المرور؟",
      content:
        "انقر على 'نسيت كلمة المرور' في صفحة تسجيل الدخول، أدخل عنوان بريدك الإلكتروني، وسنرسل لك رابطًا لإعادة تعيين كلمة المرور. سينتهي صلاحية الرابط خلال 24 ساعة.",
    },
    {
      value: "item-2",
      trigger: "هل يمكنني تغيير خطة الاشتراك الخاصة بي؟",
      content:
        "نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت من إعدادات حسابك. ستظهر التغييرات في دورة الفوترة التالية.",
    },
    {
      value: "item-3",
      trigger: "ما هي طرق الدفع التي تقبلونها؟",
      content:
        "نقبل جميع بطاقات الائتمان الرئيسية و PayPal والتحويلات المصرفية. تتم معالجة جميع المدفوعات بأمان من خلال شركاء الدفع لدينا.",
    },
  ],
  he: [
    {
      value: "item-1",
      trigger: "איך אני מאפס את הסיסמה שלי?",
      content:
        "לחץ על 'שכחתי סיסמה' בעמוד ההתחברות, הזן את כתובת האימייל שלך, ונשלח לך קישור לאיפוס הסיסמה. הקישור יפוג תוך 24 שעות.",
    },
    {
      value: "item-2",
      trigger: "האם אני יכול לשנות את תוכנית המנוי שלי?",
      content:
        "כן, אתה יכול לשדרג או להוריד את התוכנית שלך בכל עת מההגדרות של החשבון שלך. השינויים יבואו לידי ביטוי במחזור החיוב הבא.",
    },
    {
      value: "item-3",
      trigger: "אילו אמצעי תשלום אתם מקבלים?",
      content: "אנו מקבלים כרטיסי אשראי, PayPal והעברות בנקאיות.",
    },
  ],
}

function DocAccordionPreview(props: { name: string }) {
  const name = untrack(() => props.name)
  const isMultiple = name === "accordion-multiple"
  const isRtl = name === "accordion-rtl"
  const initialValue =
    name === "accordion-demo"
      ? "shipping"
      : name === "accordion-multiple"
        ? "notifications"
        : name === "accordion-borders"
          ? "billing"
          : name === "accordion-card"
            ? "plans"
            : name === "accordion-disabled"
              ? ""
              : "item-1"
  const items = isRtl ? docAccordionRtlItems.ar : docAccordionItems[name] || docAccordionItems["accordion-basic"]

  const accordion = (
    <div
      class={`doc-accordion${name === "accordion-borders" ? " doc-accordion-bordered" : ""}`}
      data-slot="accordion"
      data-doc-accordion
      data-accordion-type={isMultiple ? "multiple" : "single"}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {items.map((item) => {
        const open = initialValue === item.value
        const triggerId = `doc-${name}-${item.value}-trigger`
        const contentId = `doc-${name}-${item.value}-content`
        const rtlIndex = isRtl ? docAccordionRtlItems.ar.findIndex((candidate) => candidate.value === item.value) : -1
        const englishItem = rtlIndex >= 0 ? docAccordionRtlItems.en[rtlIndex] : undefined
        const hebrewItem = rtlIndex >= 0 ? docAccordionRtlItems.he[rtlIndex] : undefined
        return (
          <div
            class="doc-accordion-item"
            data-slot="accordion-item"
            data-state={open ? "open" : "closed"}
            data-disabled={item.disabled ? "true" : undefined}
            key={item.value}
          >
            <h3 class="doc-accordion-heading">
              <button
                id={triggerId}
                type="button"
                class="doc-accordion-trigger"
                data-slot="accordion-trigger"
                aria-controls={contentId}
                aria-expanded={open ? "true" : "false"}
                data-state={open ? "open" : "closed"}
                data-doc-accordion-trigger
                disabled={item.disabled}
              >
                <span
                  data-doc-accordion-label
                  data-label-ar={isRtl ? item.trigger : undefined}
                  data-label-en={englishItem?.trigger}
                  data-label-he={hebrewItem?.trigger}
                >
                  {item.trigger}
                </span>
                <svg
                  class="doc-accordion-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path data-doc-accordion-chevron d={open ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}></path>
                </svg>
              </button>
            </h3>
            <div
              id={contentId}
              class="doc-accordion-content"
              data-slot="accordion-content"
              data-state={open ? "open" : "closed"}
              role="region"
              aria-labelledby={triggerId}
              hidden={!open}
            >
              <div
                class="doc-accordion-content-inner"
                data-doc-accordion-content
                data-content-ar={isRtl ? item.content : undefined}
                data-content-en={englishItem?.content}
                data-content-he={hebrewItem?.content}
              >
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return isRtl ? (
    <div class="doc-rtl-preview-shell">
      <div class="doc-rtl-preview-toolbar" dir="ltr">
        <select
          aria-label="Preview language"
          value="ar"
          data-doc-rtl-language
        >
          <option value="ar">Arabic (العربية)</option>
          <option value="he">Hebrew (עברית)</option>
          <option value="en">English</option>
        </select>
        <button type="button" class="doc-rtl-info-button" aria-label="Toggle language information">
          <RtlInfoIcon />
        </button>
      </div>
      <div class="doc-rtl-preview" dir="rtl">{accordion}</div>
    </div>
  ) : name === "accordion-card" ? (
    <div class="doc-accordion-card">
      <div class="doc-accordion-card-header">
        <h4>Subscription &amp; Billing</h4>
        <p>Common questions about your account, plans, payments and cancellations.</p>
      </div>
      <div class="doc-accordion-card-content">{accordion}</div>
    </div>
  ) : accordion
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
    "spinner",
    "popover",
    "progress",
    "slider",
    "sonner",
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
  let filtered = $state<string[]>(props.components)

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
    <section class="stack-gap container">
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

function ExamplesPage(props: { route: ResolvedRoute; activeThemeName: string; onThemeChange: (themeName: string) => void }) {
  const routeSnapshot = untrack(() => props.route)
  const activeShowcase = routeSnapshot.activeExample
  const routeThemeStyle = routeThemeStyleLookup[props.activeThemeName] ?? ""
  let query = $state("")
  let filtered = $state<string[]>(props.route.examples)

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
      <div class="route-page-header container examples-hero">
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

      <div class="route-nav-row container">
        <nav class="section-nav" aria-label="Examples navigation">
          <a class={props.route.exampleSlug === null ? "section-nav-link-active" : ""} href="/">
            Examples
          </a>
          {routeSnapshot.examplePages.map((showcase) => (
            <a
              key={showcase.slug}
              class={routeSnapshot.exampleSlug === showcase.slug ? "section-nav-link-active" : ""}
              href={`/examples/${showcase.slug}`}
            >
              {showcase.title}
              {showcase.slug === "rtl" ? <span class="section-nav-badge" title="New" aria-label="New"></span> : null}
            </a>
          ))}
        </nav>
        <ThemeSelectorControl themes={props.route.themes} activeThemeName={props.activeThemeName} onThemeSelect={props.onThemeChange} />
      </div>

      <div class="section-soft example-preview-section">
      <div class="container route-theme-container" data-theme-name={props.activeThemeName} style={routeThemeStyle}>
      {activeShowcase ? (
        <article class="example-detail-card">
          <div class="example-showcase-surface">
            <div class="example-mobile-gallery">
              <ColorModeImage
                className="example-mobile-image"
                lightSrc={activeShowcase.imageLight}
                darkSrc={activeShowcase.imageDark}
                alt={`${activeShowcase.title} preview`}
              />
            </div>

            <div class="example-live-stage">
              {activeShowcase.slug === "rtl" ? (
                <>
                  <ExamplesRootPreview rtl />
                  <template data-rtl-server-end />
                </>
              ) : <LiveExamplePage slug={activeShowcase.slug} />}
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
                  <p class="slug">Fict example · {getDocPreviewFamily(example)}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      </div>
      </div>
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
  const chartId = untrack(() => props.chartId)
  const interactive = chartId.endsWith("interactive")
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
          <div class="chart-bar-group" key={`${chartId}-${index}`}>
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

function ChartsPage(props: { route: ResolvedRoute; activeThemeName: string; onThemeChange: (themeName: string) => void }) {
  const chartTypes = props.route.chartTypes
  const activeType = props.route.activeChartType
  const routeThemeStyle = routeThemeStyleLookup[props.activeThemeName] ?? ""
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
    <section class="stack-gap container">
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
        <ThemeSelectorControl themes={props.route.themes} activeThemeName={props.activeThemeName} onThemeSelect={props.onThemeChange} />
      </div>

      <div class="route-theme-container" data-theme-name={props.activeThemeName} style={routeThemeStyle}>
      <div class="charts-grid" id="charts">
        {visibleCharts.map((chart) => (
          <article class="chart-display-card" data-full-width={chart.fullWidth ? "true" : "false"} key={chart.id}>
            <div class="chart-display-toolbar">
              <div class="chart-display-title">
                <ChartFamilyIcon chartId={chart.id} />
                <span>{getChartFamilyLabel(chart.id)}</span>
              </div>
              <div class="chart-display-actions">
                <button
                  type="button"
                  class="chart-display-copy"
                  aria-label="Copy chart path"
                  title="Copy chart path"
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

                    writeClipboardText(`npx @fictjs/shadcn@latest blocks add ${chartId}`, target)
                  }}
                >
                  <CopyIcon class="copy-icon-idle" />
                  <CheckIcon class="copy-icon-done" />
                </button>
                <span class="chart-display-divider" aria-hidden="true"></span>
                <button
                  type="button"
                  class="button button-outline chart-display-button"
                  data-chart-code-toggle
                  aria-expanded="false"
                >
                  View Code
                </button>
              </div>
            </div>
            <ChartPreviewSurface chartId={chart.id} />
            <div class="chart-code-view" data-chart-code data-chart-name={chart.id} hidden>
              <pre class="chart-code-source" data-chart-code-source>
                <code>Loading source...</code>
              </pre>
            </div>
          </article>
        ))}
        {emptySlots.map((slot) => (
          <div class="chart-empty-slot" key={`empty-${slot}`} />
        ))}
      </div>
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
      <ColorModeImage
        className="block-preview-image"
        lightSrc={`/r/styles/new-york-v4/${blockName}-light.png`}
        darkSrc={`/r/styles/new-york-v4/${blockName}-dark.png`}
        alt={formatDisplayLabel(blockName)}
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
  const activeBlockCategory = untrack(() => props.route.blockCategory)

  return (
    <section class="stack-gap container">
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
          <a class={activeBlockCategory === null ? "section-nav-link-active" : ""} href="/blocks">
            Featured
          </a>
          {categories.map((category) => (
            <a
              key={category}
              class={activeBlockCategory === category ? "section-nav-link-active" : ""}
              href={`/blocks/${category}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </a>
          ))}
        </nav>
        <a class="button button-secondary section-nav-action" href="/blocks/sidebar">
          Browse all blocks
        </a>
      </div>

      <div class="blocks-stack" id="blocks">
        {filteredBlocks.map((block) => (
          <article class="block-display-card" key={block.name}>
            <div class="block-display-toolbar">
              <div class="block-display-tabs" role="tablist" aria-label="Block view">
                <button
                  type="button"
                  class="block-display-tab is-active"
                  role="tab"
                  aria-selected="true"
                  data-block-view="preview"
                >
                  Preview
                </button>
                <button
                  type="button"
                  class="block-display-tab"
                  role="tab"
                  aria-selected="false"
                  data-block-view="code"
                >
                  Code
                </button>
              </div>
              <span class="block-display-divider" aria-hidden="true"></span>
              <a class="block-display-description" href={`#${block.name}`}>
                {block.description.replace(/\.$/, "")}
              </a>
              <div class="block-display-actions">
                <div class="block-viewport-group" role="group" aria-label="Preview width">
                  <button
                    type="button"
                    class="block-viewport-button is-active"
                    title="Desktop"
                    aria-label="Desktop"
                    data-block-viewport={block.name}
                    data-viewport-width="100"
                    onClick$={(event: MouseEvent) => setBlockViewport(event, "100")}
                  >
                    <MonitorIcon />
                  </button>
                  <button
                    type="button"
                    class="block-viewport-button"
                    title="Tablet"
                    aria-label="Tablet"
                    data-block-viewport={block.name}
                    data-viewport-width="60"
                    onClick$={(event: MouseEvent) => setBlockViewport(event, "60")}
                  >
                    <TabletIcon />
                  </button>
                  <button
                    type="button"
                    class="block-viewport-button"
                    title="Mobile"
                    aria-label="Mobile"
                    data-block-viewport={block.name}
                    data-viewport-width="30"
                    onClick$={(event: MouseEvent) => setBlockViewport(event, "30")}
                  >
                    <SmartphoneIcon />
                  </button>
                </div>
                <span class="block-display-divider" aria-hidden="true"></span>
                <button
                  type="button"
                  class="button button-outline block-display-button"
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

                    writeClipboardText(`npx @fictjs/shadcn@latest add ${blockName}`, target)
                  }}
                >
                  <TerminalIcon class="copy-icon-idle" />
                  <CheckIcon class="copy-icon-done" />
                  <span>npx fictcn add {block.name}</span>
                </button>
                <span class="block-display-divider" aria-hidden="true"></span>
                <a class="button block-display-open" href="/docs/blocks">
                  Open in Docs
                </a>
              </div>
            </div>
            <BlockPreviewSurface block={block} />
            <div class="block-code-view" data-block-code data-block-name={block.name} hidden>
              <div class="block-code-files" data-block-code-files role="tablist" aria-label="Block files"></div>
              <pre class="block-code-source" data-block-code-source>
                <code>Loading source...</code>
              </pre>
            </div>
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

function ThemeCardsDemo(props: { themeName: string }) {
  const themeLabel =
    props.themeName === "neutral"
      ? "Default"
      : props.themeName.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()

  return (
    <div class="theme-cards-demo">
      <div class="theme-cards-column">
        <article class="theme-demo-card theme-demo-card-stat">
          <div class="theme-demo-card-head">
            <div>
              <p class="eyebrow">Total Revenue</p>
              <h3>$15,231.89</h3>
              <p class="theme-demo-muted">+20.1% from last month</p>
            </div>
            <span class="theme-demo-chip">{themeLabel}</span>
          </div>
          <div class="theme-demo-chart" aria-hidden="true">
            {[42, 68, 58, 92, 74, 108, 88].map((height, index) => (
              <span class="theme-demo-chart-bar" style={`height:${height}px`} key={`bar-${index}`}></span>
            ))}
          </div>
        </article>

        <article class="theme-demo-card">
          <div class="theme-demo-card-head">
            <div>
              <p class="eyebrow">Team Members</p>
              <h3>Project access</h3>
            </div>
          </div>
          <div class="theme-demo-list">
            {[
              ["OM", "Olivia Martin", "Owner"],
              ["IN", "Isabella Nguyen", "Can edit"],
              ["SD", "Sofia Davis", "Can view"],
            ].map((member) => (
              <div class="theme-demo-member-row" key={member[1]}>
                <span class="theme-demo-avatar" aria-hidden="true">{member[0]}</span>
                <div>
                  <strong>{member[1]}</strong>
                  <p class="theme-demo-muted">{member[2]}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div class="theme-cards-column theme-cards-column-wide">
        <article class="theme-demo-card theme-demo-card-payments">
          <div class="theme-demo-card-head">
            <div>
              <p class="eyebrow">Payments</p>
              <h3>Manage your payments</h3>
            </div>
            <button type="button" class="theme-demo-button">Add Payment</button>
          </div>
          <div class="theme-demo-table">
            {[
              ["success", "ken99@example.com", "$316.00"],
              ["processing", "monserrat44@example.com", "$837.00"],
              ["pending", "jason78@example.com", "$450.00"],
            ].map((row) => (
              <div class="theme-demo-table-row" key={row[1]}>
                <span class={`theme-demo-status status-${row[0]}`}>{row[0]}</span>
                <span class="theme-demo-email">{row[1]}</span>
                <strong>{row[2]}</strong>
              </div>
            ))}
          </div>
        </article>

        <article class="theme-demo-card">
          <div class="theme-demo-card-head">
            <div>
              <p class="eyebrow">Share this document</p>
              <h3>Anyone with the link can view</h3>
            </div>
          </div>
          <div class="theme-demo-share-row">
            <div class="theme-demo-input">http://example.com/link/to/document</div>
            <button type="button" class="theme-demo-button theme-demo-button-ghost">Copy Link</button>
          </div>
          <div class="theme-demo-access-list">
            {[
              ["Olivia Martin", "Can edit"],
              ["Isabella Nguyen", "Can edit"],
              ["Sofia Davis", "Can view"],
            ].map((person) => (
              <div class="theme-demo-access-row" key={person[0]}>
                <span>{person[0]}</span>
                <span class="theme-demo-muted">{person[1]}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}

function ThemesPage(props: { themes: ThemeEntry[]; activeThemeName: string; onThemeChange: (themeName: string) => void }) {
  const activeSwatches = themeSwatchLookup[props.activeThemeName] || defaultThemeSwatches

  return (
    <section class="stack-gap container themes-route">
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

      <div class="container theme-customizer-shell" id="themes">
          <div class="theme-customizer-bar">
            <div class="theme-customizer-scroll" aria-label="Theme customizer">
              <div class="theme-customizer-scroll-inner">
                {createVisibleThemes.map((theme) => (
                  <button
                    type="button"
                    key={theme.name}
                    data-theme-name={theme.name}
                    data-active={props.activeThemeName === theme.name}
                    class="theme-customizer-pill"
                    onClick={(event: MouseEvent) => {
                      const target = event.currentTarget
                      if (!(target instanceof HTMLButtonElement)) {
                        return
                      }

                      const themeName = target.dataset.themeName
                      if (!themeName) {
                        return
                      }

                      const nextTheme = createVisibleThemes.find((entry) => entry.name === themeName)
                      if (!nextTheme) {
                        return
                      }

                      props.onThemeChange(nextTheme.name)
                    }}
                  >
                    {theme.name === "neutral" ? "Default" : theme.name}
                  </button>
                ))}
              </div>
            </div>

            <div class="theme-customizer-mobile">
              <UiSelectControl
                id="themes-route-selector"
                ariaLabel="Theme selector"
                value={props.activeThemeName}
                prefix="Theme:"
                groupLabel="Theme"
                triggerClass="theme-route-trigger"
                options={createVisibleThemes.map((theme) => ({
                  value: theme.name,
                  label: theme.name === "neutral" ? "Default" : theme.name,
                }))}
                onSelect={(themeName: string) => props.onThemeChange(themeName)}
              />
            </div>

            <ThemeCodeControl
              themeName={props.activeThemeName}
              triggerClass="button button-secondary theme-copy-button"
            />
          </div>
      </div>

      <div class="theme-preview-section section-soft">
        <div class="container theme-preview-shell">
          <div
            class="theme-preview-stage"
            data-theme-name={props.activeThemeName}
            style={`--theme-accent-strong:${activeSwatches[0] || "#0f172a"}; --theme-accent:${activeSwatches[1] || activeSwatches[0] || "#334155"}; --theme-accent-soft:${activeSwatches[2] || activeSwatches[1] || "#64748b"}; --theme-accent-muted:${activeSwatches[3] || activeSwatches[2] || "#94a3b8"}; --theme-muted:${activeSwatches[4] || activeSwatches[0] || "#e2e8f0"}`}
          >
            <ThemeCardsDemo themeName={props.activeThemeName} />
          </div>
        </div>
      </div>
    </section>
  )
}

function ColorsPage() {
  return (
    <section class="stack-gap container colors-route">
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

      <div class="colors-route-grid" id="colors" data-color-format="hex">
        {colorPalettes.map((palette) => (
          <section class="color-palette" key={palette.name} id={palette.name}>
            <div class="color-palette-head">
              <h2>{palette.name}</h2>
              <UiSelectControl
                ariaLabel={`Color format for ${palette.name}`}
                value="hex"
                prefix="Format:"
                monoValue
                contentAlign="end"
                shellClass="color-format-field"
                triggerClass="color-format-trigger"
                contentClass="color-format-content"
                options={[
                  { value: "hex", label: "hex" },
                  { value: "rgb", label: "rgb" },
                  { value: "hsl", label: "hsl" },
                  { value: "oklch", label: "oklch" },
                ]}
              />
            </div>
            <div class="color-scales">
              {palette.scales.map((entry) => (
                <button
                  type="button"
                  class="color-scale"
                  key={`${palette.name}-${entry.scale}`}
                  title={`Copy ${palette.name}-${entry.scale}`}
                  data-color-hex={entry.hex}
                  data-color-rgb={entry.rgb}
                  data-color-hsl={entry.hsl}
                  data-color-oklch={entry.oklch}
                  style={`--swatch:${entry.hex};--swatch-foreground:${entry.scale >= 500 ? "#fff" : "#000"}`}
                  onClick$={(event: MouseEvent) => copyColorValue(event)}
                >
                  <span class="color-swatch"></span>
                  <span class="color-scale-label">
                    {palette.name}-{entry.scale}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function buildThemeCode(themeName: string, format: ThemeCodeFormat): string {
  const normalizedThemeName = themeName === "default" ? "neutral" : themeName
  const legacyTheme = baseColors.find((theme) => theme.name === normalizedThemeName)
    ?? baseColors.find((theme) => theme.name === "neutral")
  const oklchThemes = baseColorsOKLCH as unknown as Record<string, ThemeCodePalette>
  const oklchTheme = oklchThemes[normalizedThemeName] ?? oklchThemes.default

  if (format === "v4-oklch") {
    return buildThemeVariableCode(oklchTheme, "0.65rem", (value) => value)
  }

  const hslTheme = legacyTheme?.cssVars as unknown as ThemeCodePalette | undefined
  if (!hslTheme) {
    return ""
  }

  if (format === "v4-hsl") {
    return buildThemeVariableCode(hslTheme, "0.65rem", (value) => `hsl(${value})`)
  }

  return buildTailwindV3ThemeCode(hslTheme)
}

function resolveThemeCodeFormat(value: string | undefined): ThemeCodeFormat | null {
  return value === "v4-oklch" || value === "v4-hsl" || value === "v3" ? value : null
}

function buildThemeVariableCode(
  palette: ThemeCodePalette | undefined,
  radius: string,
  formatValue: (value: string) => string,
): string {
  if (!palette) {
    return ""
  }

  const formatSection = (selector: string, values: Record<string, string>) => {
    const lines = Object.entries(values)
      .filter(([key]) => key !== "radius")
      .map(([key, value]) => `  --${key}: ${formatValue(value)};`)
      .join("\n")

    return `${selector} {\n  --radius: ${radius};\n${lines}\n}`
  }

  return `${formatSection(":root", palette.light)}\n\n${formatSection(".dark", palette.dark)}\n`
}

function buildTailwindV3ThemeCode(palette: ThemeCodePalette): string {
  const formatSection = (selector: string, values: Record<string, string>, includeRadius: boolean) => {
    const lines = Object.entries(values)
      .filter(([key]) => key !== "radius")
      .map(([key, value]) => `    --${key}: ${value};`)

    if (includeRadius) {
      lines.push("    --radius: 0.5rem;")
    }

    return `  ${selector} {\n${lines.join("\n")}\n  }`
  }

  return `@layer base {\n${formatSection(":root", palette.light, true)}\n\n${formatSection(".dark", palette.dark, false)}\n}\n`
}

function writeClipboardText(value: string, source?: EventTarget | null): void {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return
  }

  const button = source instanceof HTMLElement ? source : null

  navigator.clipboard.writeText(value).then(
    () => {
      if (!button) {
        return
      }

      button.dataset.copied = "true"
      window.setTimeout(() => {
        button.dataset.copied = "false"
      }, 2000)
    },
    () => {
      // Clipboard access can be denied; keep the interaction silent.
    },
  )
}

function copyColorValue(event: MouseEvent) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return
  }

  const target = event.currentTarget
  if (!(target instanceof HTMLButtonElement)) {
    return
  }

  const grid = target.closest(".colors-route-grid")
  const format = (grid instanceof HTMLElement ? grid.dataset.colorFormat : "hex") || "hex"
  const value = target.dataset[`color${format.charAt(0).toUpperCase()}${format.slice(1)}`]
  if (!value) {
    return
  }

  writeClipboardText(value, target)
}

function NotFoundPage(props: { pathname: string }) {
  return (
    <section class="stack-gap container not-found">
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

function buildThemeSwatchLookup(): Record<string, string[]> {
  const lookup: Record<string, string[]> = {}
  const preferredScales = [950, 700, 500, 300, 100]

  for (const palette of colorPalettes) {
    const swatches: string[] = []
    for (const scale of preferredScales) {
      const match = palette.scales.find((entry) => entry.scale === scale)
      if (match) {
        swatches.push(match.hex)
      }
    }

    lookup[palette.name] = swatches.length > 0 ? swatches : palette.scales.slice(0, 5).map((entry) => entry.hex)
  }

  if (!lookup.neutral) {
    lookup.neutral = defaultThemeSwatches
  }

  return lookup
}

function buildRouteThemeStyleLookup(): Record<string, string> {
  const lookup: Record<string, string> = {}

  for (const [themeName, swatches] of Object.entries(themeSwatchLookup)) {
    lookup[themeName] = buildRouteThemeStyleValue(swatches)
  }

  lookup.neutral = ""
  lookup.default = ""

  return lookup
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
