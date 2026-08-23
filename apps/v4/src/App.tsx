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
    description: "registry/new-york-v4/ui/button.tsx",
    kind: "component",
  },
  {
    key: "component:input",
    id: "input",
    title: "Input",
    description: "registry/new-york-v4/ui/input.tsx",
    kind: "component",
  },
  {
    key: "component:dialog",
    id: "dialog",
    title: "Dialog",
    description: "registry/new-york-v4/ui/dialog.tsx",
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
    key: "block:sidebar-07",
    id: "sidebar-07",
    title: "Sidebar 07",
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
  "block:sidebar-07": createBlockItems[1],
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

  const createInstallCommand =
    `pnpm dlx @fictjs/shadcn@latest init --template ${starterTemplate} --base ${base}` +
    `\npnpm dlx @fictjs/shadcn@latest theme apply ${theme}` +
    `\npnpm dlx @fictjs/shadcn@latest add ${activeItem.kind === "example" ? `registry/new-york-v4/examples/${activeItem.id}` : activeItem.id} --font ${font}`

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
      <DocComponentPreviewSurface family={props.itemId} />
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
            <img src="/avatars/01.png" alt="@shadcn" />
          </span>
          <span class="ui-avatar">
            <img src="/avatars/02.png" alt="@maxleiter" />
          </span>
          <span class="ui-avatar">
            <img src="/avatars/03.png" alt="@evilrabbit" />
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
          <span class="ui-input-group-addon-end">52% used</span>
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
      <a class="ui-item" href="#">
        <span class="ui-item-media">
          <BadgeCheckIcon />
        </span>
        <div class="ui-item-content">
          <p class="ui-item-title">Your profile has been verified.</p>
        </div>
        <span class="ui-item-actions">
          <ChevronRightIcon />
        </span>
      </a>
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

function UiSwitch(props: { id?: string; checked?: boolean }) {
  return (
    <button
      id={props.id}
      type="button"
      class="ui-switch"
      role="switch"
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

function RootPromptPreview() {
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
                <div class="root-command-list" data-mention-list>
                  <p class="root-command-empty" data-mention-empty hidden>
                    No pages found
                  </p>
                  <div class="root-command-group" data-mention-group="page">
                    <p class="root-command-heading">Pages</p>
                    {mentionPages.map((item) => (
                      <button
                        class="root-command-item"
                        type="button"
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
                  data-menu-side="right"
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
                    <div class="root-command-list" data-mention-list>
                      <p class="root-command-empty" data-mention-empty hidden>
                        No knowledge found
                      </p>
                      <div class="root-command-group" data-mention-group="user">
                        {mentionUsers.map((user) => (
                          <button
                            class="root-command-item"
                            type="button"
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

function RootButtonGroupDemoPreview() {
  return (
    <div class="ui-button-group">
      <button class="ui-icon-button ui-icon-button-sm" type="button" aria-label="Go Back">
        <ArrowLeftGlyph />
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
              <div class="ui-menu-panel" data-menu-panel data-menu-side="right" role="menu" hidden>
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
            <ArrowLeftGlyph />
          </button>
          <button class="ui-icon-button ui-icon-button-sm" type="button" aria-label="Next">
            <ArrowRightGlyph />
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

function ArrowLeftGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

function ArrowRightGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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

              {entry === "notion-prompt" ? <RootPromptPreview /> : null}

              {entry === "button-group-demo" ? <RootButtonGroupDemoPreview /> : null}

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
    <section class="docs-layout" data-slot="docs">
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

      <article class="doc-main">
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
                  <p class="slug">registry/new-york-v4/examples/{example}.tsx</p>
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

                    writeClipboardText(`registry/new-york-v4/charts/${chartId}.tsx`, target)
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
