import { $state, untrack } from "fict"

import {
  TablerChartBarIcon,
  TablerChevronDownIcon,
  TablerChevronLeftIcon,
  TablerChevronRightIcon,
  TablerChevronsLeftIcon,
  TablerChevronsRightIcon,
  TablerCircleCheckFilledIcon,
  TablerCreditCardIcon,
  TablerDashboardIcon,
  TablerDatabaseIcon,
  TablerDotsIcon,
  TablerDotsVerticalIcon,
  TablerFileWordIcon,
  TablerFolderIcon,
  TablerGripVerticalIcon,
  TablerHelpIcon,
  TablerLayoutColumnsIcon,
  TablerInnerShadowTopIcon,
  TablerListDetailsIcon,
  TablerLoaderIcon,
  TablerLogoutIcon,
  TablerPlusIcon,
  TablerNotificationIcon,
  TablerReportIcon,
  TablerSearchIcon,
  TablerShare3Icon,
  TablerSettingsIcon,
  TablerTrendingDownIcon,
  TablerTrendingUpIcon,
  TablerTrashIcon,
  TablerUserCircleIcon,
  TablerUsersIcon,
  LucideArrowDownIcon,
  LucideArrowRightIcon,
  LucideArrowUpIcon,
  LucideChevronLeftIcon,
  LucideChevronRightIcon,
  LucideChevronsLeftIcon,
  LucideChevronsRightIcon,
  LucideChevronsUpDownIcon,
  LucideCircleCheckBigIcon,
  LucideCircleHelpIcon,
  LucideCircleIcon,
  LucideCircleOffIcon,
  LucideCirclePlusIcon,
  LucideCheckIcon,
  LucideCopyIcon,
  LucideEllipsisIcon,
  LucideEyeOffIcon,
  LucideRotateCcwIcon,
  LucideSettings2Icon,
  LucideTimerIcon,
  LucideXIcon,
} from "./example-icons"
import { dashboardTableRows, taskRows, visitorChartData } from "./example-data"

interface LiveExamplePageProps {
  slug: string
}

type DashboardRange = "90d" | "30d" | "7d"
type DashboardView = "outline" | "past-performance" | "key-personnel" | "focus-documents"
type DashboardPageSize = 10 | 20 | 30 | 40 | 50
type DirectionMode = "rtl" | "ltr"

const dashboardStats = [
  {
    label: "Total Revenue",
    value: "$1,250.00",
    delta: "+12.5%",
    trend: "Trending up this month",
    detail: "Visitors for the last 6 months",
  },
  {
    label: "New Customers",
    value: "1,234",
    delta: "-20%",
    trend: "Down 20% this period",
    detail: "Acquisition needs attention",
  },
  {
    label: "Active Accounts",
    value: "45,678",
    delta: "+12.5%",
    trend: "Strong user retention",
    detail: "Engagement exceed targets",
  },
  {
    label: "Growth Rate",
    value: "4.5%",
    delta: "+4.5%",
    trend: "Steady performance increase",
    detail: "Meets growth projections",
  },
] as const

const DASHBOARD_PAGE_SIZE = 10
const TASKS_PAGE_SIZE = 25
const dashboardNavItems = ["Dashboard", "Lifecycle", "Analytics", "Projects", "Team"] as const
const dashboardDocumentItems = ["Data Library", "Reports", "Word Assistant"] as const
const dashboardSecondaryItems = ["Settings", "Get Help", "Search"] as const
const dashboardViewTabs = ["Outline", "Past Performance", "Key Personnel", "Focus Documents"] as const
const playgroundPresets = [
  "Grammatical Standard English",
  "Summarize for a 2nd grader",
  "Text to command",
  "Q&A",
  "English to other languages",
  "Parse unstructured data",
  "Classification",
  "Natural language to Python",
  "Explain code",
  "Chat",
] as const
const playgroundSliders = [
  { label: "Temperature", name: "temperature", min: 0, max: 1, step: 0.1, value: 0.56 },
  { label: "Maximum Length", name: "max-length", min: 0, max: 4000, step: 10, value: 256 },
  { label: "Top P", name: "top-p", min: 0, max: 1, step: 0.1, value: 0.9 },
] as const
const playgroundModels = [
  {
    name: "text-davinci-003",
    type: "GPT-3",
    description: "Most capable GPT-3 model. Can do any task the other models can do, often with higher quality, longer output and better instruction-following. Also supports inserting completions within text.",
    strengths: "Complex intent, cause and effect, creative generation, search, summarization for audience",
  },
  {
    name: "text-curie-001",
    type: "GPT-3",
    description: "Very capable, but faster and lower cost than Davinci.",
    strengths: "Language translation, complex classification, sentiment, summarization",
  },
  {
    name: "text-babbage-001",
    type: "GPT-3",
    description: "Capable of straightforward tasks, very fast, and lower cost.",
    strengths: "Moderate classification, semantic search",
  },
  {
    name: "text-ada-001",
    type: "GPT-3",
    description: "Capable of very simple tasks, usually the fastest model in the GPT-3 series, and lowest cost.",
    strengths: "Parsing text, simple classification, address correction, keywords",
  },
  {
    name: "code-davinci-002",
    type: "Codex",
    description: "Most capable Codex model. Particularly good at translating natural language to code. In addition to completing code, also supports inserting completions within code.",
    strengths: "",
  },
  {
    name: "code-cushman-001",
    type: "Codex",
    description: "Almost as capable as Davinci Codex, but slightly faster. This speed advantage may make it preferable for real-time applications.",
    strengths: "Real-time application where low-latency is preferable",
  },
] as const

const rtlSampleRows = [
  { title: "تحسين تجربة تسجيل الدخول", owner: "فريق المنتج", state: "قيد التنفيذ" },
  { title: "مراجعة أنماط الجداول", owner: "فريق التصميم", state: "جاهز" },
  { title: "تحديث شريط التنقل", owner: "فريق الواجهة", state: "جديد" },
] as const

function formatTaskLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatTaskStatus(value: string): string {
  return value === "in progress" ? "In Progress" : formatTaskLabel(value)
}

function TaskStatusIcon(props: { status: string }) {
  const status = props.status

  return status === "backlog" ? <LucideCircleHelpIcon class="tasks-meta-icon" />
    : status === "todo" ? <LucideCircleIcon class="tasks-meta-icon" />
    : status === "in progress" ? <LucideTimerIcon class="tasks-meta-icon" />
    : status === "done" ? <LucideCircleCheckBigIcon class="tasks-meta-icon" />
    : <LucideCircleOffIcon class="tasks-meta-icon" />
}

function TaskPriorityIcon(props: { priority: string }) {
  const priority = props.priority

  return priority === "low" ? <LucideArrowDownIcon class="tasks-meta-icon" />
    : priority === "high" ? <LucideArrowUpIcon class="tasks-meta-icon" />
    : <LucideArrowRightIcon class="tasks-meta-icon" />
}

function resolveDashboardRange(value: string | undefined): DashboardRange | null {
  return value === "90d" || value === "30d" || value === "7d" ? value : null
}

function resolveDashboardView(value: string | undefined): DashboardView | null {
  return value === "outline" || value === "past-performance" || value === "key-personnel" || value === "focus-documents"
    ? value
    : null
}

function resolveDashboardPageSize(value: string | undefined): DashboardPageSize | null {
  const parsed = Number(value)
  return parsed === 10 || parsed === 20 || parsed === 30 || parsed === 40 || parsed === 50
    ? parsed
    : null
}

function updateDashboardSelection(selectedRows: string, rowId: string, selected: boolean): string {
  const token = `|${rowId}|`
  if (selected) {
    return selectedRows.includes(token) ? selectedRows : `${selectedRows}${rowId}|`
  }

  return selectedRows.replace(token, "|")
}

function countDashboardSelection(selectedRows: string): number {
  let separators = 0
  for (const character of selectedRows) {
    if (character === "|") {
      separators += 1
    }
  }

  return Math.max(0, separators - 1)
}

function syncDashboardTableSelectionScope(scope: HTMLElement): void {
  const dashboard = scope.closest<HTMLElement>(".dashboard-example")
  const selectedRows = dashboard?.dataset.dashboardSelectedRows
    || scope.dataset.dashboardSelectedRows
    || "|"
  scope.dataset.dashboardSelectedRows = selectedRows
  if (dashboard) {
    dashboard.dataset.dashboardSelectedRows = selectedRows
  }
  const rowCheckboxes = scope.querySelectorAll<HTMLInputElement>("[data-dashboard-row-id]")
  let selectedPageRows = 0

  for (const checkbox of rowCheckboxes) {
    const rowId = checkbox.dataset.dashboardRowId
    const selected = Boolean(rowId && selectedRows.includes(`|${rowId}|`))
    checkbox.checked = selected
    checkbox.closest("tr")?.toggleAttribute("data-state", selected)
    if (selected) {
      checkbox.closest("tr")?.setAttribute("data-state", "selected")
      selectedPageRows += 1
    }
  }

  const selectAll = scope.querySelector<HTMLInputElement>("[data-dashboard-select-all]")
  if (selectAll) {
    const allSelected = rowCheckboxes.length > 0 && selectedPageRows === rowCheckboxes.length
    selectAll.checked = allSelected
    selectAll.indeterminate = selectedPageRows > 0 && !allSelected
    selectAll.setAttribute("aria-checked", selectAll.indeterminate ? "mixed" : String(allSelected))
  }
  const selectionLabel = scope
    .closest<HTMLElement>(".dashboard-table-block")
    ?.querySelector<HTMLElement>("[data-dashboard-total-rows]")
  if (selectionLabel) {
    const totalRows = selectionLabel.dataset.dashboardTotalRows || "0"
    selectionLabel.textContent = `${countDashboardSelection(selectedRows)} of ${totalRows} row(s) selected.`
  }
}

function syncDashboardTableColumns(scope: HTMLElement): void {
  const hiddenColumns = scope.dataset.dashboardHiddenColumns || "|"
  scope.querySelectorAll<HTMLElement>("[data-dashboard-column]").forEach((cell) => {
    const column = cell.dataset.dashboardColumn
    cell.hidden = Boolean(column && hiddenColumns.includes(`|${column}|`))
  })

  scope
    .closest<HTMLElement>(".dashboard-table-block")
    ?.querySelectorAll<HTMLElement>("[data-dashboard-column-toggle]")
    .forEach((item) => {
      const column = item.dataset.dashboardColumnToggle
      const isVisible = Boolean(column && !hiddenColumns.includes(`|${column}|`))
      item.setAttribute("aria-checked", String(isVisible))
      item.dataset.selected = String(isVisible)
    })
}

function syncDashboardTableRowOrder(scope: HTMLElement): void {
  const dashboard = scope.closest<HTMLElement>(".dashboard-example")
  const storedOrder = document.documentElement.dataset.dashboardRowOrder
    || dashboard?.dataset.dashboardRowOrder
    || ""
  if (dashboard) {
    dashboard.dataset.dashboardRowOrder = storedOrder
  }
  const order = storedOrder
    .split(",")
    .filter(Boolean)
  if (order.length === 0) {
    return
  }

  const indexes = new Map(order.map((rowId, index) => [rowId, index]))
  const body = scope.querySelector<HTMLTableSectionElement>("tbody")
  if (!body) {
    return
  }

  const rows = Array.from(body.querySelectorAll<HTMLTableRowElement>("[data-dashboard-order-row]"))
  rows.sort((left, right) => {
    const leftIndex = indexes.get(left.dataset.dashboardOrderRow ?? "") ?? Number.MAX_SAFE_INTEGER
    const rightIndex = indexes.get(right.dataset.dashboardOrderRow ?? "") ?? Number.MAX_SAFE_INTEGER
    return leftIndex - rightIndex
  })
  body.append(...rows)
}

function syncDashboardTableSelections(): void {
  document.querySelectorAll<HTMLElement>(".dashboard-table-selection-scope").forEach((scope) => {
    syncDashboardTableRowOrder(scope)
    syncDashboardTableSelectionScope(scope)
    syncDashboardTableColumns(scope)
  })
}

function resolveDirectionMode(value: string | undefined): DirectionMode | null {
  return value === "rtl" || value === "ltr" ? value : null
}

export function LiveExamplePage(props: LiveExamplePageProps) {
  return props.slug === "dashboard" ? <DashboardExample />
    : props.slug === "tasks" ? <TasksExample />
    : props.slug === "playground" ? <PlaygroundExample />
    : props.slug === "authentication" ? <AuthenticationExample />
    : props.slug === "rtl" ? <RTLExample />
    : <ExampleFallback slug={props.slug} />
}

const CHART_VIEW_WIDTH = 980
const CHART_VIEW_HEIGHT = 250
const CHART_PLOT_LEFT = 5
const CHART_PLOT_RIGHT = 975
const CHART_PLOT_TOP = 5
const CHART_PLOT_BOTTOM = 215
const CHART_TICK_BASELINE = 229
const CHART_TICK_GAP = 32
const CHART_TICK_CHAR_WIDTH = 6.6
const CHART_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const CHART_NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10]

/** Matches the y-axis domain recharts derives for a 5-tick axis starting at zero. */
function niceChartMax(max: number): number {
  if (max <= 0) {
    return 1
  }

  const magnitude = Math.pow(10, Math.floor(Math.log10(max)) - 1)
  for (const scale of CHART_NICE_STEPS) {
    const step = scale * magnitude
    if (step * 4 >= max) {
      return step * 4
    }
  }

  return max
}

/**
 * Natural cubic spline control points, matching d3-shape's curveNatural — the
 * curve recharts renders for `type="natural"`.
 */
function naturalControlPoints(values: number[]): number[][] {
  const n = values.length - 1
  const a: number[] = new Array(n)
  const b: number[] = new Array(n)
  const r: number[] = new Array(n)

  a[0] = 0
  b[0] = 2
  r[0] = values[0] + 2 * values[1]

  for (let i = 1; i < n - 1; i += 1) {
    a[i] = 1
    b[i] = 4
    r[i] = 4 * values[i] + 2 * values[i + 1]
  }

  a[n - 1] = 2
  b[n - 1] = 7
  r[n - 1] = 8 * values[n - 1] + values[n]

  for (let i = 1; i < n; i += 1) {
    const m = a[i] / b[i - 1]
    b[i] -= m
    r[i] -= m * r[i - 1]
  }

  a[n - 1] = r[n - 1] / b[n - 1]
  for (let i = n - 2; i >= 0; i -= 1) {
    a[i] = (r[i] - a[i + 1]) / b[i]
  }

  b[n - 1] = (values[n] + a[n - 1]) / 2
  for (let i = 0; i < n - 1; i += 1) {
    b[i] = 2 * values[i + 1] - a[i + 1]
  }

  return [a, b]
}

/** Just the cubic segments, so a curve can be appended to an open subpath. */
function naturalSplineCurves(xs: number[], ys: number[]): string {
  if (xs.length < 2) {
    return ""
  }

  const cx = naturalControlPoints(xs)
  const cy = naturalControlPoints(ys)
  let curves = ""

  for (let i = 0; i < xs.length - 1; i += 1) {
    curves += `C${cx[0][i]},${cy[0][i]},${cx[1][i]},${cy[1][i]},${xs[i + 1]},${ys[i + 1]}`
  }

  return curves
}

function naturalSplinePath(xs: number[], ys: number[]): string {
  if (xs.length === 0) {
    return ""
  }

  return `M${xs[0]},${ys[0]}${naturalSplineCurves(xs, ys)}`
}

function formatChartTick(date: string): string {
  const month = CHART_MONTHS[Number(date.slice(5, 7)) - 1]
  return `${month} ${Number(date.slice(8, 10))}`
}

interface ChartTick {
  x: number
  label: string
}

/** Mirrors the recharts `minTickGap` pass, including the clamped trailing tick. */
function buildChartTicks(dates: string[], xs: number[]): ChartTick[] {
  const lastIndex = dates.length - 1
  const lastLabel = formatChartTick(dates[lastIndex])
  const lastHalf = (lastLabel.length * CHART_TICK_CHAR_WIDTH) / 2
  const lastX = Math.min(xs[lastIndex], CHART_VIEW_WIDTH - lastHalf)
  const ticks: ChartTick[] = []
  let previousRight = Number.NEGATIVE_INFINITY

  for (let i = 0; i < lastIndex; i += 1) {
    const label = formatChartTick(dates[i])
    const half = (label.length * CHART_TICK_CHAR_WIDTH) / 2
    const left = xs[i] - half
    const right = xs[i] + half

    if (left < 0 || left - previousRight < CHART_TICK_GAP) {
      continue
    }

    if (right + CHART_TICK_GAP > lastX - lastHalf) {
      continue
    }

    ticks.push({ x: xs[i], label })
    previousRight = right
  }

  ticks.push({ x: lastX, label: lastLabel })
  return ticks
}

interface VisitorChartModel {
  mobileLine: string
  mobileArea: string
  stackedLine: string
  stackedArea: string
  gridYs: number[]
  ticks: ChartTick[]
}

/**
 * All chart geometry is derived here, outside any reactive scope: the compiler
 * flags dynamic array indexing inside a component body (FICT-H).
 */
function buildVisitorChart(days: number): VisitorChartModel {
  const points = visitorChartData.slice(-(days + 1))
  const span = points.length - 1
  const plotWidth = CHART_PLOT_RIGHT - CHART_PLOT_LEFT
  const plotHeight = CHART_PLOT_BOTTOM - CHART_PLOT_TOP

  const xs = points.map((_, index) => CHART_PLOT_LEFT + (index * plotWidth) / span)
  const domainMax = niceChartMax(points.reduce((max, point) => Math.max(max, point.desktop + point.mobile), 0))
  const scaleY = (value: number) => CHART_PLOT_BOTTOM - (value / domainMax) * plotHeight

  const mobileYs = points.map((point) => scaleY(point.mobile))
  const stackedYs = points.map((point) => scaleY(point.mobile + point.desktop))

  const mobileLine = naturalSplinePath(xs, mobileYs)
  const stackedLine = naturalSplinePath(xs, stackedYs)
  const firstX = xs[0]
  const lastX = xs[span]

  // The stacked band is closed along the mobile curve walked back right-to-left.
  const mobileReturn = naturalSplineCurves(xs.slice().reverse(), mobileYs.slice().reverse())

  return {
    mobileLine,
    mobileArea: `${mobileLine}L${lastX},${CHART_PLOT_BOTTOM}L${firstX},${CHART_PLOT_BOTTOM}Z`,
    stackedLine,
    stackedArea: `${stackedLine}L${lastX},${mobileYs[span]}${mobileReturn}Z`,
    gridYs: [0, 1, 2, 3, 4].map((index) => CHART_PLOT_BOTTOM - (index * plotHeight) / 4),
    ticks: buildChartTicks(points.map((point) => point.date), xs),
  }
}

function VisitorsAreaChart(props: { range: DashboardRange }) {
  const range = props.range
  const chart = buildVisitorChart(range === "90d" ? 90 : range === "30d" ? 30 : 7)

  return (
    <svg
      class="dashboard-chart"
      viewBox={`0 0 ${CHART_VIEW_WIDTH} ${CHART_VIEW_HEIGHT}`}
      role="img"
      aria-label="Total visitors chart"
    >
      <defs>
        <linearGradient id="dashboardFillDesktop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stop-color="var(--primary)" stop-opacity="1" />
          <stop offset="95%" stop-color="var(--primary)" stop-opacity="0.1" />
        </linearGradient>
        <linearGradient id="dashboardFillMobile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stop-color="var(--primary)" stop-opacity="0.8" />
          <stop offset="95%" stop-color="var(--primary)" stop-opacity="0.1" />
        </linearGradient>
      </defs>

      <g class="dashboard-chart-grid">
        {chart.gridYs.map((y) => (
          <line key={y} x1={CHART_PLOT_LEFT} y1={y} x2={CHART_PLOT_RIGHT} y2={y} />
        ))}
      </g>

      <path d={chart.mobileArea} fill="url(#dashboardFillMobile)" stroke="none" />
      <path d={chart.mobileLine} fill="none" stroke="var(--primary)" stroke-width="1" />
      <path d={chart.stackedArea} fill="url(#dashboardFillDesktop)" stroke="none" />
      <path d={chart.stackedLine} fill="none" stroke="var(--primary)" stroke-width="1" />

      <g class="dashboard-chart-ticks">
        {chart.ticks.map((tick) => (
          <text key={tick.label} x={tick.x} y={CHART_TICK_BASELINE} text-anchor="middle">
            {tick.label}
          </text>
        ))}
      </g>
    </svg>
  )
}

function DashboardTabBadge(props: { tab: string }) {
  const tab = props.tab

  return tab === "Past Performance" ? <span class="dashboard-tab-badge">3</span>
    : tab === "Key Personnel" ? <span class="dashboard-tab-badge">2</span>
    : null
}

function DashboardStatusIcon(props: { status: string }) {
  return props.status === "Done"
    ? <TablerCircleCheckFilledIcon class="dashboard-status-done" />
    : <TablerLoaderIcon />
}

function DashboardReviewerCell(props: { reviewer: string; header: string }) {
  return props.reviewer === "Assign reviewer" ? (
    <label class="dashboard-select-trigger dashboard-select-trigger-reviewer">
      <select class="dashboard-reviewer-select" aria-label={`Reviewer for ${props.header}`}>
        <option value="">Assign reviewer</option>
        <option value="Eddie Lake">Eddie Lake</option>
        <option value="Jamik Tashpulatov">Jamik Tashpulatov</option>
      </select>
      <TablerChevronDownIcon class="dashboard-select-chevron" />
    </label>
  ) : (
    props.reviewer
  )
}

function DashboardRowDrawer() {
  return (
    <div class="dashboard-row-drawer-overlay" data-dashboard-drawer role="presentation" hidden>
      <aside
        class="dashboard-row-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-row-drawer-title"
        aria-describedby="dashboard-row-drawer-description"
      >
        <div class="dashboard-row-drawer-handle" aria-hidden="true"></div>
        <header class="dashboard-row-drawer-header">
          <h2 id="dashboard-row-drawer-title" data-dashboard-drawer-title>Section</h2>
          <p id="dashboard-row-drawer-description">Showing total visitors for the last 6 months</p>
        </header>

        <div class="dashboard-row-drawer-body">
          <section class="dashboard-row-drawer-insight" aria-label="Visitor trend">
            <svg
              class="dashboard-row-drawer-chart"
              viewBox="0 0 320 176"
              role="img"
              aria-label="Desktop and mobile visitors from January to June"
            >
              <defs>
                <linearGradient id="dashboardDrawerDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="var(--primary)" stop-opacity="0.65" />
                  <stop offset="95%" stop-color="var(--primary)" stop-opacity="0.08" />
                </linearGradient>
                <linearGradient id="dashboardDrawerMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="var(--primary)" stop-opacity="0.4" />
                  <stop offset="95%" stop-color="var(--primary)" stop-opacity="0.04" />
                </linearGradient>
              </defs>
              <g class="dashboard-row-drawer-grid">
                <line x1="8" y1="32" x2="312" y2="32" />
                <line x1="8" y1="76" x2="312" y2="76" />
                <line x1="8" y1="120" x2="312" y2="120" />
                <line x1="8" y1="164" x2="312" y2="164" />
              </g>
              <path
                d="M8 131 C36 117 56 121 77 101 C101 79 118 91 136 76 C157 58 179 68 196 48 C219 23 239 42 256 29 C278 13 294 22 312 15 L312 164 L8 164 Z"
                fill="url(#dashboardDrawerDesktop)"
              />
              <path
                d="M8 145 C35 134 55 142 77 125 C96 111 117 119 136 103 C158 84 179 98 197 80 C219 57 239 73 257 59 C278 43 295 49 312 38 L312 164 L8 164 Z"
                fill="url(#dashboardDrawerMobile)"
              />
              <path
                d="M8 131 C36 117 56 121 77 101 C101 79 118 91 136 76 C157 58 179 68 196 48 C219 23 239 42 256 29 C278 13 294 22 312 15"
                fill="none"
                stroke="var(--primary)"
                stroke-width="1.5"
              />
              <path
                d="M8 145 C35 134 55 142 77 125 C96 111 117 119 136 103 C158 84 179 98 197 80 C219 57 239 73 257 59 C278 43 295 49 312 38"
                fill="none"
                stroke="var(--primary)"
                stroke-opacity="0.65"
                stroke-width="1.5"
              />
            </svg>
            <div class="dashboard-row-drawer-separator"></div>
            <div class="dashboard-row-drawer-trend">
              <strong>Trending up by 5.2% this month <TablerTrendingUpIcon /></strong>
              <p>
                Showing total visitors for the last 6 months. This is just some random text to test the layout. It
                spans multiple lines and should wrap around.
              </p>
            </div>
            <div class="dashboard-row-drawer-separator"></div>
          </section>

          <form class="dashboard-row-drawer-form">
            <label class="dashboard-row-drawer-field" for="dashboard-drawer-header">
              <span>Header</span>
              <input id="dashboard-drawer-header" data-dashboard-drawer-field="header" />
            </label>
            <div class="dashboard-row-drawer-grid-fields">
              <label class="dashboard-row-drawer-field" for="dashboard-drawer-type">
                <span>Type</span>
                <span class="dashboard-row-drawer-select-shell">
                  <select id="dashboard-drawer-type" data-dashboard-drawer-field="type">
                    <option>Table of Contents</option>
                    <option>Executive Summary</option>
                    <option>Technical Approach</option>
                    <option>Design</option>
                    <option>Capabilities</option>
                    <option>Focus Documents</option>
                    <option>Narrative</option>
                    <option>Cover Page</option>
                  </select>
                  <TablerChevronDownIcon />
                </span>
              </label>
              <label class="dashboard-row-drawer-field" for="dashboard-drawer-status">
                <span>Status</span>
                <span class="dashboard-row-drawer-select-shell">
                  <select id="dashboard-drawer-status" data-dashboard-drawer-field="status">
                    <option>Done</option>
                    <option>In Progress</option>
                    <option>Not Started</option>
                  </select>
                  <TablerChevronDownIcon />
                </span>
              </label>
            </div>
            <div class="dashboard-row-drawer-grid-fields">
              <label class="dashboard-row-drawer-field" for="dashboard-drawer-target">
                <span>Target</span>
                <input id="dashboard-drawer-target" data-dashboard-drawer-field="target" />
              </label>
              <label class="dashboard-row-drawer-field" for="dashboard-drawer-limit">
                <span>Limit</span>
                <input id="dashboard-drawer-limit" data-dashboard-drawer-field="limit" />
              </label>
            </div>
            <label class="dashboard-row-drawer-field" for="dashboard-drawer-reviewer">
              <span>Reviewer</span>
              <span class="dashboard-row-drawer-select-shell">
                <select id="dashboard-drawer-reviewer" data-dashboard-drawer-field="reviewer">
                  <option value="">Select a reviewer</option>
                  <option>Eddie Lake</option>
                  <option>Jamik Tashpulatov</option>
                  <option>Emily Whalen</option>
                </select>
                <TablerChevronDownIcon />
              </span>
            </label>
          </form>
        </div>

        <footer class="dashboard-row-drawer-footer">
          <button type="button" class="dashboard-row-drawer-submit">Submit</button>
          <button type="button" class="dashboard-row-drawer-done" data-dashboard-drawer-close>Done</button>
        </footer>
      </aside>
    </div>
  )
}

function DashboardTrendIcon(props: { down: boolean }) {
  return props.down ? <TablerTrendingDownIcon /> : <TablerTrendingUpIcon />
}

function DashboardNavIcon(props: { name: string }) {
  const name = props.name

  return name === "Dashboard" ? <TablerDashboardIcon />
    : name === "Lifecycle" ? <TablerListDetailsIcon />
    : name === "Analytics" ? <TablerChartBarIcon />
    : name === "Projects" ? <TablerFolderIcon />
    : name === "Team" ? <TablerUsersIcon />
    : name === "Data Library" ? <TablerDatabaseIcon />
    : name === "Reports" ? <TablerReportIcon />
    : name === "Word Assistant" ? <TablerFileWordIcon />
    : name === "Settings" ? <TablerSettingsIcon />
    : name === "Get Help" ? <TablerHelpIcon />
    : <TablerSearchIcon />
}

function DashboardExample() {
  let timeRange = $state<DashboardRange>("7d")
  let activeView = $state<DashboardView>("outline")
  let dashboardPageIndex = $state(0)
  let dashboardPageSize = $state<DashboardPageSize>(DASHBOARD_PAGE_SIZE)
  let hiddenDashboardColumns = $state("|")

  const activeViewLabel = activeView === "past-performance"
    ? "past performance"
    : activeView === "key-personnel"
      ? "key personnel"
      : activeView === "focus-documents"
        ? "focus documents"
        : "outline"

  return (
    <div
      class="live-example dashboard-example"
      data-dashboard-row-order={dashboardTableRows.map((row) => row.id).join(",")}
    >
      <aside class="dashboard-sidebar">
        <div class="dashboard-sidebar-header">
          <a class="dashboard-menu-button dashboard-brand-button" href="#acme-inc">
            <TablerInnerShadowTopIcon class="dashboard-brand-icon" />
            <span class="dashboard-brand-title">Acme Inc.</span>
          </a>
        </div>

        <div class="dashboard-sidebar-content">
          <section class="dashboard-sidebar-group">
            <p class="dashboard-sidebar-group-label">Home</p>
            <nav class="dashboard-sidebar-menu" aria-label="Dashboard sidebar">
              {dashboardNavItems.map((item, index) => (
                <a
                  class={index === 0 ? "dashboard-menu-button dashboard-menu-button-active" : "dashboard-menu-button"}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  key={item}
                >
                  <DashboardNavIcon name={item} />
                  <span>{item}</span>
                </a>
              ))}
            </nav>
          </section>

          <section class="dashboard-sidebar-group">
            <p class="dashboard-sidebar-group-label">Documents</p>
            <nav class="dashboard-sidebar-menu" aria-label="Dashboard documents">
              {dashboardDocumentItems.map((item) => (
                <div class="dashboard-menu-item ui-menu" data-menu key={item}>
                  <a class="dashboard-menu-button" href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}>
                    <DashboardNavIcon name={item} />
                    <span>{item}</span>
                  </a>
                  <button
                    class="dashboard-menu-action"
                    type="button"
                    aria-label={`More options for ${item}`}
                    data-menu-trigger
                    aria-haspopup="menu"
                    aria-expanded="false"
                  >
                    <TablerDotsIcon />
                  </button>
                  <div
                    class="ui-menu-panel dashboard-document-menu"
                    data-menu-panel
                    data-menu-side="right"
                    data-menu-align="start"
                    role="menu"
                    aria-label={`${item} actions`}
                    hidden
                  >
                    <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
                      <TablerFolderIcon />
                      <span>Open</span>
                    </button>
                    <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
                      <TablerShare3Icon />
                      <span>Share</span>
                    </button>
                    <span class="ui-menu-separator" role="separator"></span>
                    <button type="button" class="ui-menu-item" role="menuitem" data-menu-item data-destructive="true">
                      <TablerTrashIcon />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
              <button class="dashboard-menu-button dashboard-menu-button-muted" type="button">
                <TablerDotsIcon />
                <span>More</span>
              </button>
            </nav>
          </section>

          <section class="dashboard-sidebar-group dashboard-sidebar-group-end">
            <nav class="dashboard-sidebar-menu" aria-label="Dashboard utilities">
              {dashboardSecondaryItems.map((item) => (
                <a class="dashboard-menu-button" href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} key={item}>
                  <DashboardNavIcon name={item} />
                  <span>{item}</span>
                </a>
              ))}
            </nav>
          </section>
        </div>

        <div class="dashboard-sidebar-footer">
          <span class="ui-menu dashboard-user-menu" data-menu>
            <button
              class="dashboard-menu-button dashboard-menu-button-lg"
              type="button"
              data-menu-trigger
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="Open user menu"
            >
              <img class="dashboard-user-avatar" src="/avatars/shadcn.jpg" alt="shadcn" width="32" height="32" />
              <span class="dashboard-user-meta">
                <span class="dashboard-user-name">shadcn</span>
                <span class="dashboard-user-email">m@example.com</span>
              </span>
              <TablerDotsVerticalIcon class="dashboard-user-more" />
            </button>
            <div
              class="ui-menu-panel dashboard-user-menu-panel"
              data-menu-panel
              data-menu-side="right"
              data-menu-align="end"
              role="menu"
              aria-label="User menu"
              hidden
            >
              <div class="dashboard-user-menu-label">
                <img class="dashboard-user-avatar" src="/avatars/shadcn.jpg" alt="" width="32" height="32" />
                <span class="dashboard-user-meta">
                  <span class="dashboard-user-name">shadcn</span>
                  <span class="dashboard-user-email">m@example.com</span>
                </span>
              </div>
              <span class="ui-menu-separator" role="separator"></span>
              <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
                <TablerUserCircleIcon />
                <span>Account</span>
              </button>
              <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
                <TablerCreditCardIcon />
                <span>Billing</span>
              </button>
              <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
                <TablerNotificationIcon />
                <span>Notifications</span>
              </button>
              <span class="ui-menu-separator" role="separator"></span>
              <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
                <TablerLogoutIcon />
                <span>Log out</span>
              </button>
            </div>
          </span>
        </div>
      </aside>

      <div class="dashboard-main">
        <header class="dashboard-site-header">
          <h3>Documents</h3>
          <button class="dashboard-quick-create" type="button">Quick Create</button>
        </header>

        <section class="dashboard-stats-grid">
          {dashboardStats.map((stat) => (
            <article class="dashboard-stat-card" key={stat.label}>
              <div class="dashboard-stat-head">
                <p class="dashboard-stat-label">{stat.label}</p>
                <p class="dashboard-stat-value">{stat.value}</p>
                <span class="dashboard-stat-badge">
                  <DashboardTrendIcon down={stat.delta.startsWith("-")} />
                  {stat.delta}
                </span>
              </div>
              <div class="dashboard-stat-foot">
                <p class="dashboard-stat-trend">
                  {stat.trend}
                  <DashboardTrendIcon down={stat.delta.startsWith("-")} />
                </p>
                <p class="dashboard-stat-copy">{stat.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <article class="dashboard-chart-card">
          <div class="dashboard-chart-head">
            <div>
              <p class="dashboard-chart-title">Total Visitors</p>
              <p class="dashboard-chart-description">Total for the last 3 months</p>
            </div>
            <div
              class="dashboard-range-group"
              role="group"
              aria-label="Dashboard chart range"
              onClick$={(event: MouseEvent) => {
                const target = event.target
                if (!(target instanceof Element)) {
                  return
                }

                const owner = target.closest("[data-range]")
                if (!(owner instanceof HTMLElement)) {
                  return
                }

                const nextRange = resolveDashboardRange(owner.dataset.range)
                if (nextRange) {
                  timeRange = nextRange
                }
              }}
            >
              {[
                ["90d", "Last 3 months"],
                ["30d", "Last 30 days"],
                ["7d", "Last 7 days"],
              ].map((entry) => (
                <button
                  type="button"
                  key={entry[0]}
                  data-range={entry[0]}
                  data-state={timeRange === entry[0] ? "on" : "off"}
                  aria-pressed={timeRange === entry[0]}
                  class="dashboard-range-item"
                >
                  {entry[1]}
                </button>
              ))}
            </div>
          </div>
          <div class="dashboard-chart-body">
            <VisitorsAreaChart range={timeRange} />
          </div>
        </article>

        <section class="dashboard-table-block">
          <div class="dashboard-table-toolbar">
            <label class="dashboard-view-selector" for="dashboard-view-selector">
              <span class="sr-only">View</span>
              <select
                id="dashboard-view-selector"
                aria-label="View"
                value={activeView}
                onInput$={(event: Event) => {
                  const target = event.currentTarget
                  if (!(target instanceof HTMLSelectElement)) {
                    return
                  }

                  const nextView = resolveDashboardView(target.value)
                  if (nextView) {
                    activeView = nextView
                  }
                }}
              >
                <option value="outline">Outline</option>
                <option value="past-performance">Past Performance</option>
                <option value="key-personnel">Key Personnel</option>
                <option value="focus-documents">Focus Documents</option>
              </select>
              <TablerChevronDownIcon />
            </label>
            <div
              class="dashboard-tabs-list"
              role="tablist"
              aria-label="Dashboard views"
              onClick$={(event: MouseEvent) => {
                const target = event.target
                if (!(target instanceof Element)) {
                  return
                }

                const owner = target.closest("[data-view]")
                if (!(owner instanceof HTMLElement)) {
                  return
                }

                const nextView = resolveDashboardView(owner.dataset.view)
                if (nextView) {
                  activeView = nextView
                }
              }}
            >
              {dashboardViewTabs.map((tab, index) => {
                const value = index === 0
                  ? "outline"
                  : index === 1
                    ? "past-performance"
                    : index === 2
                      ? "key-personnel"
                      : "focus-documents"

                return (
                  <button
                    type="button"
                    key={tab}
                    role="tab"
                    data-view={value}
                    data-state={activeView === value ? "active" : "inactive"}
                    aria-selected={activeView === value}
                    class="dashboard-tabs-trigger"
                  >
                    {tab}
                    <DashboardTabBadge tab={tab} />
                  </button>
                )
              })}
            </div>

            <div class="dashboard-table-actions">
              <span class="ui-menu dashboard-columns-menu" data-menu>
                <button
                  type="button"
                  class="dashboard-outline-button"
                  data-menu-trigger
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  <TablerLayoutColumnsIcon />
                  <span class="dashboard-columns-label-wide">Customize Columns</span>
                  <span class="dashboard-columns-label-compact">Columns</span>
                  <TablerChevronDownIcon />
                </button>
                <div
                  class="ui-menu-panel dashboard-columns-panel"
                  data-menu-panel
                  data-menu-side="bottom"
                  data-menu-align="end"
                  role="menu"
                  aria-label="Customize columns"
                  hidden
                  onClick$={(event: MouseEvent) => {
                    const target = event.target
                    if (!(target instanceof Element)) {
                      return
                    }

                    const item = target.closest<HTMLElement>("[data-dashboard-column-toggle]")
                    const column = item?.dataset.dashboardColumnToggle
                    if (!item || !column) {
                      return
                    }

                    const isVisible = item.getAttribute("aria-checked") !== "false"
                    const selectionScope = item
                      .closest<HTMLElement>(".dashboard-table-block")
                      ?.querySelector<HTMLElement>(".dashboard-table-selection-scope")
                    const nextHiddenColumns = updateDashboardSelection(
                      selectionScope?.dataset.dashboardHiddenColumns || "|",
                      column,
                      isVisible,
                    )
                    hiddenDashboardColumns = nextHiddenColumns
                    item.setAttribute("aria-checked", isVisible ? "false" : "true")
                    item.dataset.selected = isVisible ? "false" : "true"
                    window.requestAnimationFrame(syncDashboardTableSelections)
                  }}
                >
                  {["type", "status", "target", "limit", "reviewer"].map((column) => (
                    <button
                      key={column}
                      type="button"
                      class="ui-menu-item dashboard-column-item"
                      role="menuitemcheckbox"
                      aria-checked="true"
                      data-selected="true"
                      data-menu-item
                      data-menu-keep-open
                      data-dashboard-column-toggle={column}
                    >
                      <span>{column}</span>
                      <span class="dashboard-column-check" aria-hidden="true">✓</span>
                    </button>
                  ))}
                </div>
              </span>
              <button type="button" class="dashboard-outline-button" aria-label="Add Section">
                <TablerPlusIcon />
                <span class="dashboard-add-section-label">Add Section</span>
              </button>
            </div>
          </div>

          {activeView === "outline" ? (
            <div class="dashboard-table-panel">
              <div class="dashboard-table-frame">
                <div
                  class="dashboard-table-selection-scope"
                  data-dashboard-selected-rows="|"
                  data-dashboard-hidden-columns={hiddenDashboardColumns}
                >
                  <DashboardTablePage
                    pageIndex={dashboardPageIndex}
                    pageSize={dashboardPageSize}
                  />
                </div>
              </div>

              <div class="dashboard-table-footer">
                <p class="dashboard-table-selection" data-dashboard-total-rows={dashboardTableRows.length}>0 of {dashboardTableRows.length} row(s) selected.</p>
                <div class="dashboard-table-pagination">
                  <div class="dashboard-rows-per-page">
                    <span class="dashboard-pagination-label">Rows per page</span>
                    <label class="dashboard-select-trigger dashboard-select-trigger-narrow">
                      <select
                        class="dashboard-page-size-select"
                        aria-label="Rows per page"
                        value={dashboardPageSize}
                        onInput$={(event: Event) => {
                          const target = event.currentTarget
                          if (!(target instanceof HTMLSelectElement)) {
                            return
                          }

                          const nextPageSize = resolveDashboardPageSize(target.value)
                          if (nextPageSize) {
                            dashboardPageSize = nextPageSize
                            dashboardPageIndex = 0
                            window.requestAnimationFrame(syncDashboardTableSelections)
                          }
                        }}
                      >
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                          <option key={pageSize} value={pageSize}>{pageSize}</option>
                        ))}
                      </select>
                      <TablerChevronDownIcon class="dashboard-select-chevron" />
                    </label>
                  </div>
                  <DashboardPaginationLabel pageIndex={dashboardPageIndex} pageSize={dashboardPageSize} />
                  <div class="dashboard-pagination-buttons">
                    <button
                      type="button"
                      class="dashboard-pagination-button dashboard-pagination-boundary"
                      aria-label="Go to first page"
                      disabled={dashboardPageIndex === 0}
                      onClick$={() => {
                        dashboardPageIndex = 0
                        window.requestAnimationFrame(syncDashboardTableSelections)
                      }}
                    >
                      <TablerChevronsLeftIcon />
                    </button>
                    <button
                      type="button"
                      class="dashboard-pagination-button"
                      aria-label="Go to previous page"
                      disabled={dashboardPageIndex === 0}
                      onClick$={() => {
                        dashboardPageIndex = Math.max(0, untrack(() => dashboardPageIndex) - 1)
                        window.requestAnimationFrame(syncDashboardTableSelections)
                      }}
                    >
                      <TablerChevronLeftIcon />
                    </button>
                    <button
                      type="button"
                      class="dashboard-pagination-button"
                      aria-label="Go to next page"
                      disabled={dashboardPageIndex >= Math.ceil(dashboardTableRows.length / dashboardPageSize) - 1}
                      onClick$={() => {
                        const lastPage = Math.ceil(dashboardTableRows.length / untrack(() => dashboardPageSize)) - 1
                        dashboardPageIndex = Math.min(lastPage, untrack(() => dashboardPageIndex) + 1)
                        window.requestAnimationFrame(syncDashboardTableSelections)
                      }}
                    >
                      <TablerChevronRightIcon />
                    </button>
                    <button
                      type="button"
                      class="dashboard-pagination-button dashboard-pagination-boundary"
                      aria-label="Go to last page"
                      disabled={dashboardPageIndex >= Math.ceil(dashboardTableRows.length / dashboardPageSize) - 1}
                      onClick$={() => {
                        dashboardPageIndex = Math.ceil(
                          dashboardTableRows.length / untrack(() => dashboardPageSize),
                        ) - 1
                        window.requestAnimationFrame(syncDashboardTableSelections)
                      }}
                    >
                      <TablerChevronsRightIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div class="dashboard-table-panel">
              <div class="dashboard-outline-placeholder" aria-label={activeViewLabel}></div>
            </div>
          )}
        </section>
      </div>
      <DashboardRowDrawer />
      <div class="dashboard-toast-region" data-dashboard-toast-region role="status" aria-live="polite"></div>
      <div class="sr-only" data-dashboard-reorder-status aria-live="assertive"></div>
    </div>
  )
}

function DashboardTablePage(props: {
  pageIndex: number
  pageSize: DashboardPageSize
}) {
  const pageIndex = untrack(() => props.pageIndex)
  const pageSize = untrack(() => props.pageSize)
  const start = pageIndex * pageSize
  const rows = dashboardTableRows.slice(start, start + pageSize)

  return (
    <table class="dashboard-data-table">
      <thead>
        <tr>
          <th class="dashboard-cell-drag"></th>
          <th class="dashboard-cell-select">
            <input
              type="checkbox"
              class="dashboard-checkbox"
              data-dashboard-select-all="true"
              aria-checked="false"
              aria-label="Select all"
            />
          </th>
          <th>Header</th>
          <th data-dashboard-column="type">Section Type</th>
          <th data-dashboard-column="status">Status</th>
          <th class="dashboard-cell-number" data-dashboard-column="target">Target</th>
          <th class="dashboard-cell-number" data-dashboard-column="limit">Limit</th>
          <th data-dashboard-column="reviewer">Reviewer</th>
          <th class="dashboard-cell-actions"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} data-dashboard-order-row={row.id}>
            <td class="dashboard-cell-drag">
              <button
                type="button"
                class="dashboard-icon-button dashboard-drag-handle"
                aria-label="Drag to reorder"
                aria-grabbed="false"
                data-dashboard-drag-handle
              >
                <TablerGripVerticalIcon class="dashboard-grip-icon" />
              </button>
            </td>
            <td class="dashboard-cell-select">
              <input
                type="checkbox"
                class="dashboard-checkbox"
                data-dashboard-row-id={row.id}
                aria-label={`Select ${row.header}`}
              />
            </td>
            <td>
              <button
                type="button"
                class="dashboard-cell-link"
                data-dashboard-drawer-trigger
                data-dashboard-drawer-header={row.header}
                data-dashboard-drawer-type={row.type}
                data-dashboard-drawer-status={row.status}
                data-dashboard-drawer-target={row.target}
                data-dashboard-drawer-limit={row.limit}
                data-dashboard-drawer-reviewer={row.reviewer}
                aria-haspopup="dialog"
                aria-expanded="false"
              >
                {row.header}
              </button>
            </td>
            <td data-dashboard-column="type">
              <span class="dashboard-cell-badge">{row.type}</span>
            </td>
            <td data-dashboard-column="status">
              <span class="dashboard-cell-badge">
                <DashboardStatusIcon status={row.status} />
                {row.status}
              </span>
            </td>
            <td class="dashboard-cell-number" data-dashboard-column="target">
              <form class="dashboard-cell-value-form" data-dashboard-value-form data-dashboard-row-header={row.header}>
                <input class="dashboard-cell-input" value={row.target} aria-label={`Target for ${row.header}`} />
              </form>
            </td>
            <td class="dashboard-cell-number" data-dashboard-column="limit">
              <form class="dashboard-cell-value-form" data-dashboard-value-form data-dashboard-row-header={row.header}>
                <input class="dashboard-cell-input" value={row.limit} aria-label={`Limit for ${row.header}`} />
              </form>
            </td>
            <td data-dashboard-column="reviewer">
              <DashboardReviewerCell reviewer={row.reviewer} header={row.header} />
            </td>
            <td class="dashboard-cell-actions">
              <span class="ui-menu dashboard-row-menu" data-menu>
                <button
                  type="button"
                  class="dashboard-icon-button"
                  aria-label={`Open menu for ${row.header}`}
                  data-menu-trigger
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  <TablerDotsVerticalIcon />
                </button>
                <div
                  class="ui-menu-panel dashboard-row-menu-panel"
                  data-menu-panel
                  data-menu-side="bottom"
                  data-menu-align="end"
                  role="menu"
                  aria-label={`${row.header} actions`}
                  hidden
                >
                  <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>Edit</button>
                  <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>Make a copy</button>
                  <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>Favorite</button>
                  <span class="ui-menu-separator" role="separator"></span>
                  <button type="button" class="ui-menu-item" role="menuitem" data-menu-item data-destructive="true">Delete</button>
                </div>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DashboardPaginationLabel(props: { pageIndex: number; pageSize: DashboardPageSize }) {
  const pageIndex = untrack(() => props.pageIndex)
  const pageSize = untrack(() => props.pageSize)

  return (
    <p class="dashboard-pagination-label">
      Page {pageIndex + 1} of {Math.ceil(dashboardTableRows.length / pageSize)}
    </p>
  )
}

const taskStatusValues = ["backlog", "todo", "in progress", "done", "canceled"] as const
const taskPriorityValues = ["low", "medium", "high"] as const

function TaskFacetMenu(props: {
  kind: "status" | "priority"
  title: string
  values: readonly string[]
}) {
  const kind = untrack(() => props.kind)
  const title = untrack(() => props.title)
  const values = untrack(() => props.values)

  return (
    <span class="ui-menu tasks-facet-menu" data-menu data-task-facet={kind}>
      <button
        type="button"
        class="tasks-facet-button"
        data-menu-trigger
        aria-haspopup="dialog"
        aria-expanded="false"
      >
        <LucideCirclePlusIcon />
        <span>{title}</span>
        <span class="tasks-facet-summary" data-task-facet-summary hidden>
          <span class="tasks-facet-summary-separator" aria-hidden="true"></span>
          <span class="tasks-facet-summary-compact" data-task-facet-summary-compact></span>
          <span class="tasks-facet-summary-wide" data-task-facet-summary-wide></span>
        </span>
      </button>
      <div
        class="ui-menu-panel tasks-facet-panel"
        data-menu-panel
        data-menu-side="bottom"
        data-menu-align="start"
        role="dialog"
        aria-label={`${title} filters`}
        hidden
      >
        <div class="tasks-facet-search-shell">
          <input
            class="tasks-facet-search"
            type="search"
            placeholder={title}
            aria-label={`Search ${title.toLowerCase()}`}
            data-task-facet-search
          />
        </div>
        <div class="tasks-facet-options" role="listbox" aria-label={title} aria-multiselectable="true">
          {values.map((value) => {
            const count = taskRows.filter((task) => task[kind] === value).length
            return (
              <button
                type="button"
                class="tasks-facet-option"
                key={value}
                role="option"
                aria-selected="false"
                data-menu-item
                data-menu-keep-open
                data-task-facet-option={value}
                data-selected="false"
              >
                <span class="tasks-facet-checkbox" aria-hidden="true"><LucideCheckIcon /></span>
                {kind === "status"
                  ? <TaskStatusIcon status={value} />
                  : <TaskPriorityIcon priority={value} />}
                <span>{kind === "status" ? formatTaskStatus(value) : formatTaskLabel(value)}</span>
                <span class="tasks-facet-count" data-task-facet-count>{count}</span>
              </button>
            )
          })}
          <p class="tasks-facet-empty" data-task-facet-empty hidden>No results found.</p>
        </div>
        <div class="tasks-facet-clear-wrap" data-task-facet-clear-wrap hidden>
          <button type="button" class="tasks-facet-clear" data-task-facet-clear>Clear filters</button>
        </div>
      </div>
    </span>
  )
}

function TaskRowActions(props: { task: (typeof taskRows)[number] }) {
  const task = untrack(() => props.task)

  return (
    <span class="ui-menu tasks-row-menu" data-menu data-task-row-menu>
      <button
        type="button"
        class="tasks-row-action"
        aria-label={`Open menu for ${task.id}`}
        data-menu-trigger
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <LucideEllipsisIcon />
      </button>
      <div
        class="ui-menu-panel tasks-row-menu-panel"
        data-menu-panel
        data-menu-side="bottom"
        data-menu-align="end"
        role="menu"
        aria-label={`${task.id} actions`}
        hidden
      >
        <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>Edit</button>
        <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>Make a copy</button>
        <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>Favorite</button>
        <span class="ui-menu-separator" role="separator"></span>
        <span class="ui-menu-sub tasks-label-submenu">
          <button
            type="button"
            class="ui-menu-item tasks-label-sub-trigger"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded="false"
            data-menu-item
            data-menu-keep-open
            data-task-label-trigger
          >
            <span>Labels</span>
            <LucideChevronRightIcon />
          </button>
          <div
            class="ui-menu-panel tasks-label-panel"
            data-task-label-panel
            data-menu-side="right"
            data-menu-align="start"
            role="menu"
            aria-label={`Labels for ${task.id}`}
            hidden
          >
            {(["bug", "feature", "documentation"] as const).map((label) => (
              <button
                type="button"
                class="ui-menu-item tasks-label-option"
                key={label}
                role="menuitemradio"
                aria-checked={task.label === label}
                data-menu-item
                data-task-label-value={label}
                data-selected={task.label === label}
              >
                <span class="tasks-label-radio" aria-hidden="true"><LucideCircleIcon /></span>
                <span>{formatTaskLabel(label)}</span>
              </button>
            ))}
          </div>
        </span>
        <span class="ui-menu-separator" role="separator"></span>
        <button type="button" class="ui-menu-item" role="menuitem" data-menu-item data-destructive="true">
          <span>Delete</span>
          <span class="tasks-menu-shortcut">⌘⌫</span>
        </button>
      </div>
    </span>
  )
}

function renderTaskTableRow(task: (typeof taskRows)[number], index: number) {
  return (
    <tr
      key={task.id}
      data-task-row
      data-task-index={index}
      data-task-id={task.id}
      data-task-title={task.title.toLowerCase()}
      data-task-title-text={task.title}
      data-task-status={task.status}
      data-task-priority={task.priority}
      data-task-label={task.label}
    >
      <td class="tasks-cell-select">
        <input
          type="checkbox"
          class="tasks-checkbox"
          aria-label={`Select ${task.id}`}
          data-task-row-select
        />
      </td>
      <td class="tasks-cell-id">{task.id}</td>
      <td data-task-column="title">
        <div class="tasks-title-cell">
          <span class="tasks-label-badge">{formatTaskLabel(task.label)}</span>
          <span class="tasks-title-text">{task.title}</span>
        </div>
      </td>
      <td data-task-column="status">
        <div class="tasks-meta-cell tasks-status-cell">
          <TaskStatusIcon status={task.status} />
          <span>{formatTaskStatus(task.status)}</span>
        </div>
      </td>
      <td data-task-column="priority">
        <div class="tasks-meta-cell">
          <TaskPriorityIcon priority={task.priority} />
          <span>{formatTaskLabel(task.priority)}</span>
        </div>
      </td>
      <td class="tasks-cell-actions">
        <TaskRowActions task={task} />
      </td>
    </tr>
  )
}

function TaskSortHeader(props: { column: "title" | "status" | "priority"; title: string }) {
  const column = untrack(() => props.column)
  const title = untrack(() => props.title)

  return (
    <span class="ui-menu tasks-sort-menu" data-menu data-task-sort-menu={column}>
      <button
        type="button"
        class="tasks-sort-button"
        data-menu-trigger
        data-task-sort-trigger={column}
        data-sort-direction="none"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span>{title}</span>
        <span class="tasks-sort-icon" data-task-sort-icon="none"><LucideChevronsUpDownIcon /></span>
        <span class="tasks-sort-icon" data-task-sort-icon="asc"><LucideArrowUpIcon /></span>
        <span class="tasks-sort-icon" data-task-sort-icon="desc"><LucideArrowDownIcon /></span>
      </button>
      <div
        class="ui-menu-panel tasks-sort-panel"
        data-menu-panel
        data-menu-side="bottom"
        data-menu-align="start"
        role="menu"
        aria-label={`${title} column options`}
        hidden
      >
        <button type="button" class="ui-menu-item" role="menuitem" data-menu-item data-task-sort-action="asc">
          <LucideArrowUpIcon />
          <span>Asc</span>
        </button>
        <button type="button" class="ui-menu-item" role="menuitem" data-menu-item data-task-sort-action="desc">
          <LucideArrowDownIcon />
          <span>Desc</span>
        </button>
        <span class="ui-menu-separator" role="separator"></span>
        <button type="button" class="ui-menu-item" role="menuitem" data-menu-item data-task-sort-action="hide">
          <LucideEyeOffIcon />
          <span>Hide</span>
        </button>
      </div>
    </span>
  )
}

function TasksExample() {
  const pageRows = taskRows.slice(0, TASKS_PAGE_SIZE)

  return (
    <div
      class="live-example tasks-example"
      data-tasks-query=""
      data-tasks-status-values="|"
      data-tasks-priority-values="|"
      data-tasks-page-index="0"
      data-tasks-page-size={TASKS_PAGE_SIZE}
      data-tasks-selected-values="|"
      data-tasks-sort-column=""
      data-tasks-sort-direction=""
      data-tasks-hidden-columns="|"
    >
      <header class="tasks-header">
        <div class="tasks-heading">
          <h2>Welcome back!</h2>
          <p class="tasks-copy">Here&apos;s a list of your tasks for this month.</p>
        </div>
        <span class="ui-menu tasks-user-menu" data-menu>
          <button
            type="button"
            class="tasks-user-nav"
            aria-label="Open user menu"
            data-menu-trigger
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <img class="tasks-user-avatar" src="/avatars/03.png" alt="@shadcn" width="36" height="36" />
          </button>
          <div
            class="ui-menu-panel tasks-user-menu-panel"
            data-menu-panel
            data-menu-side="bottom"
            data-menu-align="end"
            role="menu"
            aria-label="User menu"
            hidden
          >
            <div class="tasks-user-menu-label">
              <span class="tasks-user-menu-name">shadcn</span>
              <span class="tasks-user-menu-email">m@example.com</span>
            </div>
            <span class="ui-menu-separator" role="separator"></span>
            <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
              <span>Profile</span>
              <span class="tasks-menu-shortcut">⇧⌘P</span>
            </button>
            <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
              <span>Billing</span>
              <span class="tasks-menu-shortcut">⌘B</span>
            </button>
            <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
              <span>Settings</span>
              <span class="tasks-menu-shortcut">⌘S</span>
            </button>
            <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>New Team</button>
            <span class="ui-menu-separator" role="separator"></span>
            <button type="button" class="ui-menu-item" role="menuitem" data-menu-item>
              <span>Log out</span>
              <span class="tasks-menu-shortcut">⇧⌘Q</span>
            </button>
          </div>
        </span>
      </header>

      <div class="tasks-table-block">
        <div class="tasks-toolbar">
          <div class="tasks-toolbar-filters">
            <input
              id="tasks-filter"
              class="tasks-filter-input"
              type="text"
              placeholder="Filter tasks..."
              aria-label="Filter tasks"
              data-tasks-filter
            />
            <TaskFacetMenu kind="status" title="Status" values={taskStatusValues} />
            <TaskFacetMenu kind="priority" title="Priority" values={taskPriorityValues} />
            <button type="button" class="tasks-reset-button" data-tasks-reset hidden>
              <span>Reset</span>
              <LucideXIcon />
            </button>
          </div>
          <div class="tasks-toolbar-actions">
            <span class="ui-menu tasks-view-menu" data-menu data-task-view-menu>
              <button
                type="button"
                class="tasks-outline-button"
                data-menu-trigger
                aria-haspopup="menu"
                aria-expanded="false"
              >
                <LucideSettings2Icon />
                <span>View</span>
              </button>
              <div
                class="ui-menu-panel tasks-view-panel"
                data-menu-panel
                data-menu-side="bottom"
                data-menu-align="end"
                role="menu"
                aria-label="Toggle columns"
                hidden
              >
                <span class="ui-menu-label tasks-view-label">Toggle columns</span>
                <span class="ui-menu-separator" role="separator"></span>
                {(["title", "status", "priority"] as const).map((column) => (
                  <button
                    type="button"
                    class="ui-menu-item tasks-view-option"
                    key={column}
                    role="menuitemcheckbox"
                    aria-checked="true"
                    data-menu-item
                    data-menu-keep-open
                    data-task-column-toggle={column}
                    data-selected="true"
                  >
                    <span class="tasks-view-check" aria-hidden="true"><LucideCheckIcon /></span>
                    <span>{column}</span>
                  </button>
                ))}
              </div>
            </span>
            <button type="button" class="tasks-primary-button">Add Task</button>
          </div>
        </div>

        <div class="tasks-table-frame">
          <table class="tasks-data-table">
            <thead>
              <tr>
                <th class="tasks-cell-select">
                  <input
                    type="checkbox"
                    class="tasks-checkbox"
                    aria-label="Select all"
                    aria-checked="false"
                    data-tasks-select-all
                  />
                </th>
                <th>
                  <span class="tasks-column-header">Task</span>
                </th>
                <th data-task-column="title">
                  <TaskSortHeader column="title" title="Title" />
                </th>
                <th data-task-column="status">
                  <TaskSortHeader column="status" title="Status" />
                </th>
                <th data-task-column="priority">
                  <TaskSortHeader column="priority" title="Priority" />
                </th>
                <th class="tasks-cell-actions"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((task, index) => renderTaskTableRow(task, index))}
            </tbody>
          </table>
        </div>

        <div data-tasks-row-bank hidden>
          {taskRows.slice(TASKS_PAGE_SIZE).map((task, index) => (
            <span
              key={task.id}
              data-task-record
              data-task-index={index + TASKS_PAGE_SIZE}
              data-task-id={task.id}
              data-task-title={task.title.toLowerCase()}
              data-task-title-text={task.title}
              data-task-status={task.status}
              data-task-priority={task.priority}
              data-task-label={task.label}
            ></span>
          ))}
        </div>

        <div class="tasks-pagination">
          <p class="tasks-selection" data-tasks-selection>0 of {taskRows.length} row(s) selected.</p>
          <div class="tasks-pagination-controls">
            <div class="tasks-rows-per-page">
              <span class="tasks-pagination-label">Rows per page</span>
              <label class="tasks-select-trigger">
                <select
                  class="tasks-page-size-select"
                  aria-label="Rows per page"
                  data-tasks-page-size-select
                  value={TASKS_PAGE_SIZE}
                >
                  {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>{pageSize}</option>
                  ))}
                </select>
                <LucideChevronsUpDownIcon class="tasks-select-chevron" />
              </label>
            </div>
            <p class="tasks-pagination-label" data-tasks-page-label>
              Page 1 of {Math.ceil(taskRows.length / TASKS_PAGE_SIZE)}
            </p>
            <div class="tasks-pagination-buttons">
              <button type="button" class="tasks-pagination-button" aria-label="Go to first page" data-tasks-page-action="first" disabled>
                <LucideChevronsLeftIcon />
              </button>
              <button type="button" class="tasks-pagination-button" aria-label="Go to previous page" data-tasks-page-action="previous" disabled>
                <LucideChevronLeftIcon />
              </button>
              <button type="button" class="tasks-pagination-button" aria-label="Go to next page" data-tasks-page-action="next">
                <LucideChevronRightIcon />
              </button>
              <button type="button" class="tasks-pagination-button" aria-label="Go to last page" data-tasks-page-action="last">
                <LucideChevronsRightIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaygroundExample() {
  return (
    <div class="live-example playground-example">
      <header class="playground-header">
        <h3>Playground</h3>
        <div class="playground-top-actions">
          <span class="ui-menu playground-preset-menu" data-menu>
            <button
              class="playground-header-button playground-header-button-wide"
              type="button"
              role="combobox"
              aria-label="Load a preset..."
              aria-haspopup="dialog"
              aria-expanded="false"
              data-menu-trigger
            >
              <span class="playground-header-button-value" data-menu-label-target>Load a preset...</span>
              <LucideChevronsUpDownIcon class="playground-model-chevron" />
            </button>
            <div
              class="ui-menu-panel playground-preset-panel"
              data-menu-panel
              data-menu-side="bottom"
              data-menu-align="start"
              role="dialog"
              aria-label="Preset selector"
              hidden
            >
              <div class="playground-command-search-shell">
                <input
                  class="playground-command-search"
                  type="search"
                  placeholder="Search presets..."
                  aria-label="Search presets"
                  data-playground-preset-search
                />
              </div>
              <div class="playground-command-list">
                <p class="playground-command-empty" data-playground-preset-empty hidden>No presets found.</p>
                <p class="playground-command-heading">Examples</p>
                {playgroundPresets.map((preset) => (
                  <button
                    type="button"
                    class="ui-menu-item playground-command-item"
                    key={preset}
                    role="option"
                    aria-selected="false"
                    data-menu-item
                    data-menu-value={preset}
                    data-playground-preset-option
                    data-selected="false"
                  >
                    <span>{preset}</span>
                    <LucideCheckIcon class="ui-menu-item-check" />
                  </button>
                ))}
                <span class="ui-menu-separator" role="separator"></span>
                <button type="button" class="ui-menu-item playground-command-item" data-menu-item>
                  More examples
                </button>
              </div>
            </div>
          </span>
          <button
            class="playground-header-button"
            type="button"
            data-playground-dialog-trigger="save"
            aria-haspopup="dialog"
            aria-expanded="false"
          >
            Save
          </button>
          <button
            class="playground-header-button"
            type="button"
            data-playground-dialog-trigger="code"
            aria-haspopup="dialog"
            aria-expanded="false"
          >
            View code
          </button>
          <span class="ui-menu playground-share-menu" data-menu>
            <button
              class="playground-header-button"
              type="button"
              data-menu-trigger
              aria-haspopup="dialog"
              aria-expanded="false"
            >
              Share
            </button>
            <div
              class="ui-menu-panel playground-share-panel"
              data-menu-panel
              data-menu-side="bottom"
              data-menu-align="end"
              role="dialog"
              aria-labelledby="playground-share-title"
              hidden
            >
              <header class="playground-share-header">
                <h3 id="playground-share-title">Share preset</h3>
                <p>Anyone who has this link and an OpenAI account will be able to view this.</p>
              </header>
              <div class="playground-share-field">
                <label class="sr-only" for="playground-share-link">Link</label>
                <input
                  id="playground-share-link"
                  class="playground-dialog-input"
                  type="text"
                  value="https://platform.openai.com/playground/p/7bbKYQvsVkNmVb8NGcdUOLae?model=text-davinci-003"
                  readonly
                />
                <button
                  type="button"
                  class="playground-share-copy"
                  aria-label="Copy"
                  data-playground-share-copy
                >
                  <LucideCopyIcon />
                </button>
              </div>
            </div>
          </span>
          <span class="ui-menu playground-actions-menu" data-menu>
            <button
              class="playground-header-button playground-header-button-icon"
              type="button"
              aria-label="Actions"
              data-menu-trigger
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <LucideEllipsisIcon />
            </button>
            <div
              class="ui-menu-panel playground-actions-panel"
              data-menu-panel
              data-menu-side="bottom"
              data-menu-align="end"
              role="menu"
              aria-label="Preset actions"
              hidden
            >
              <button
                type="button"
                class="ui-menu-item"
                role="menuitem"
                data-menu-item
                data-playground-dialog-trigger="content-filter"
              >
                Content filter preferences
              </button>
              <span class="ui-menu-separator" role="separator"></span>
              <button
                type="button"
                class="ui-menu-item"
                role="menuitem"
                data-menu-item
                data-destructive="true"
                data-playground-dialog-trigger="delete-preset"
              >
                Delete preset
              </button>
            </div>
          </span>
        </div>
      </header>

      <div class="playground-separator" aria-hidden="true"></div>

      <div class="playground-shell">
        <section class="playground-main-column">
          <div class="playground-editor-grid" data-mode="complete">
            <div class="playground-complete-panel" data-playground-mode-panel="complete">
              <textarea class="playground-textarea" placeholder="Write a tagline for an ice cream shop"></textarea>
            </div>

            <div class="playground-textarea playground-copy-surface" data-playground-mode-panel="insert" hidden>
              We&apos;re writing to [inset]. Congrats from OpenAI!
            </div>
            <div
              class="playground-surface-pane playground-surface-pane-muted"
              aria-label="Insertion preview"
              data-playground-mode-panel="insert"
              hidden
            ></div>

            <div class="playground-edit-stack" data-playground-mode-panel="edit" hidden>
              <label class="playground-field">
                <span class="sr-only">Input</span>
                <div class="playground-textarea playground-textarea-compact playground-copy-surface">We is going to the market.</div>
              </label>
              <label class="playground-field">
                <span>Instructions</span>
                <div class="playground-textarea playground-textarea-compact playground-copy-surface">Fix the grammar.</div>
              </label>
            </div>
            <div
              class="playground-surface-pane"
              aria-label="Edit preview"
              data-playground-mode-panel="edit"
              hidden
            ></div>
          </div>

          <div class="playground-submit-row">
            <button class="playground-primary-button" type="button">Submit</button>
            <button class="playground-ghost-button" type="button" aria-label="Show history">
              <LucideRotateCcwIcon />
            </button>
          </div>
        </section>

        <aside class="playground-sidebar-panel">
          <section class="playground-field">
            <span>Mode</span>
            <div class="playground-icon-tab-list" role="tablist" aria-label="Playground modes">
              <button
                type="button"
                role="tab"
                aria-selected="true"
                class="playground-tab playground-tab-active"
                data-playground-mode-trigger="complete"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" class="playground-tab-icon">
                  <rect x="4" y="3" width="12" height="2" rx="1"></rect>
                  <rect x="4" y="7" width="12" height="2" rx="1"></rect>
                  <rect x="4" y="11" width="3" height="2" rx="1"></rect>
                  <rect x="8.5" y="11" width="3" height="2" rx="1"></rect>
                  <rect x="13" y="11" width="3" height="2" rx="1"></rect>
                  <rect x="4" y="15" width="3" height="2" rx="1"></rect>
                  <rect x="8.5" y="15" width="3" height="2" rx="1"></rect>
                </svg>
                <span class="sr-only">Complete</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected="false"
                class="playground-tab"
                data-playground-mode-trigger="insert"
                tabIndex={-1}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" class="playground-tab-icon">
                  <path d="M10 3.5V10"></path>
                  <path d="M7 7.5L10 10.5L13 7.5"></path>
                  <rect x="4" y="15" width="3" height="2" rx="1"></rect>
                  <rect x="8.5" y="15" width="3" height="2" rx="1"></rect>
                  <rect x="13" y="15" width="3" height="2" rx="1"></rect>
                </svg>
                <span class="sr-only">Insert</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected="false"
                class="playground-tab"
                data-playground-mode-trigger="edit"
                tabIndex={-1}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" class="playground-tab-icon">
                  <rect x="4" y="3" width="12" height="2" rx="1"></rect>
                  <rect x="4" y="7" width="12" height="2" rx="1"></rect>
                  <rect x="4" y="11" width="3" height="2" rx="1"></rect>
                  <rect x="4" y="15" width="4" height="2" rx="1"></rect>
                  <rect x="8.5" y="11" width="3" height="2" rx="1"></rect>
                  <path d="M12 16.5L15.5 13L16.8 14.3L13.3 17.8H12Z"></path>
                </svg>
                <span class="sr-only">Edit</span>
              </button>
            </div>
          </section>

          <section class="playground-field">
            <span>Model</span>
            <span class="ui-menu playground-model-menu" data-menu data-playground-model-menu>
              <button
                type="button"
                class="playground-model-trigger"
                role="combobox"
                aria-label="Select a model"
                aria-haspopup="dialog"
                aria-expanded="false"
                data-menu-trigger
              >
                <span data-menu-label-target>{playgroundModels[0].name}</span>
                <LucideChevronsUpDownIcon class="playground-model-chevron" />
              </button>
              <div
                class="ui-menu-panel playground-model-panel"
                data-menu-panel
                data-menu-side="bottom"
                data-menu-align="end"
                role="dialog"
                aria-label="Model selector"
                hidden
              >
                <aside class="playground-model-peek" data-playground-model-peek>
                  <h4>{playgroundModels[0].name}</h4>
                  <p data-playground-model-description>{playgroundModels[0].description}</p>
                  <div data-playground-model-strengths-wrap>
                    <h5>Strengths</h5>
                    <p data-playground-model-strengths>{playgroundModels[0].strengths}</p>
                  </div>
                </aside>
                <div class="playground-command-search-shell">
                  <input
                    class="playground-command-search"
                    type="search"
                    placeholder="Search Models..."
                    aria-label="Search models"
                    data-playground-model-search
                  />
                </div>
                <div class="playground-command-list playground-model-list">
                  <p class="playground-command-empty" data-playground-model-empty hidden>No Models found.</p>
                  {(["GPT-3", "Codex"] as const).map((type) => (
                    <section class="playground-command-group" key={type} data-playground-model-group>
                      <p class="playground-command-heading">{type}</p>
                      {playgroundModels.filter((model) => model.type === type).map((model, index) => {
                        const selected = type === "GPT-3" && index === 0
                        return (
                          <button
                            type="button"
                            class="ui-menu-item playground-command-item playground-model-option"
                            key={model.name}
                            role="option"
                            aria-selected={selected ? "true" : "false"}
                            data-menu-item
                            data-menu-value={model.name}
                            data-playground-model-option
                            data-model-description={model.description}
                            data-model-strengths={model.strengths}
                            data-selected={selected ? "true" : "false"}
                          >
                            <span>{model.name}</span>
                            <LucideCheckIcon class="ui-menu-item-check" />
                          </button>
                        )
                      })}
                    </section>
                  ))}
                </div>
              </div>
            </span>
          </section>

          {playgroundSliders.map((slider) => {
            const percent = ((slider.value - slider.min) / (slider.max - slider.min || 1)) * 100

            return (
              <div class="playground-field" data-slider-scope={slider.name} key={slider.name}>
                <div class="playground-field-head">
                  <span>{slider.label}</span>
                  <span class="playground-field-value" data-slider-output="0">
                    {slider.value}
                  </span>
                </div>
                <div
                  class="ui-slider"
                  data-slider={slider.name}
                  data-slider-min={String(slider.min)}
                  data-slider-max={String(slider.max)}
                  data-slider-step={String(slider.step)}
                  role="group"
                  aria-label={slider.label}
                >
                  <span class="ui-slider-track">
                    <span class="ui-slider-range" data-slider-range style={`left:0%;right:${100 - percent}%`}></span>
                  </span>
                  <span
                    class="ui-slider-thumb"
                    data-slider-thumb="0"
                    data-slider-value={String(slider.value)}
                    role="slider"
                    tabIndex={0}
                    aria-label={slider.label}
                    aria-valuemin={slider.min}
                    aria-valuemax={slider.max}
                    aria-valuenow={slider.value}
                    style={`left:${percent}%`}
                  ></span>
                </div>
              </div>
            )
          })}
        </aside>
      </div>

      <div
        class="playground-dialog-overlay"
        data-playground-dialog="save"
        role="presentation"
        hidden
      >
        <section
          class="playground-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="playground-save-title"
          aria-describedby="playground-save-description"
        >
          <button
            type="button"
            class="playground-dialog-close"
            aria-label="Close"
            data-playground-dialog-close
          >
            <LucideXIcon />
          </button>
          <header class="playground-dialog-header">
            <h3 id="playground-save-title">Save preset</h3>
            <p id="playground-save-description">
              This will save the current playground state as a preset which you can access later or share with others.
            </p>
          </header>
          <div class="playground-save-fields">
            <label class="playground-field" for="playground-preset-name">
              <span>Name</span>
              <input id="playground-preset-name" class="playground-dialog-input" type="text" autofocus />
            </label>
            <label class="playground-field" for="playground-preset-description">
              <span>Description</span>
              <textarea id="playground-preset-description" class="playground-dialog-textarea"></textarea>
            </label>
          </div>
          <footer class="playground-dialog-footer">
            <button type="submit" class="playground-primary-button">Save</button>
          </footer>
        </section>
      </div>

      <div
        class="playground-dialog-overlay"
        data-playground-dialog="code"
        role="presentation"
        hidden
      >
        <section
          class="playground-dialog playground-code-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="playground-code-title"
          aria-describedby="playground-code-description"
        >
          <button
            type="button"
            class="playground-dialog-close"
            aria-label="Close"
            data-playground-dialog-close
          >
            <LucideXIcon />
          </button>
          <header class="playground-dialog-header">
            <h3 id="playground-code-title">View code</h3>
            <p id="playground-code-description">
              You can use the following code to start integrating your current prompt and settings into your application.
            </p>
          </header>
          <pre class="playground-code-block"><code><span><b>import</b> os</span>{"\n"}<span><b>import</b> openai</span>{"\n\n"}<span>openai.api_key = os.getenv(<i>&quot;OPENAI_API_KEY&quot;</i>)</span>{"\n\n"}<span>response = openai.Completion.create(</span>{"\n"}<span>  model=<i>&quot;davinci&quot;</i>,</span>{"\n"}<span>  prompt=<em>&quot;&quot;</em>,</span>{"\n"}<span>  temperature=<em>0.9</em>,</span>{"\n"}<span>  max_tokens=<em>5</em>,</span>{"\n"}<span>  top_p=<em>1</em>,</span>{"\n"}<span>  frequency_penalty=<em>0</em>,</span>{"\n"}<span>  presence_penalty=<em>0</em>,</span>{"\n"}<span>)</span></code></pre>
          <p class="playground-code-note">
            Your API Key can be found here. You should use environment variables or a secret management tool to expose your key to your applications.
          </p>
        </section>
      </div>

      <div
        class="playground-dialog-overlay"
        data-playground-dialog="content-filter"
        role="presentation"
        hidden
      >
        <section
          class="playground-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="playground-filter-title"
          aria-describedby="playground-filter-description"
        >
          <button type="button" class="playground-dialog-close" aria-label="Close" data-playground-dialog-close>
            <LucideXIcon />
          </button>
          <header class="playground-dialog-header">
            <h3 id="playground-filter-title">Content filter preferences</h3>
            <p id="playground-filter-description">
              The content filter flags text that may violate our content policy. It&apos;s powered by our moderation endpoint which is free to use to moderate your OpenAI API traffic. Learn more.
            </p>
          </header>
          <div class="playground-filter-content">
            <h4>Playground Warnings</h4>
            <div class="playground-warning-row">
              <button
                type="button"
                id="playground-show-warning"
                class="ui-switch"
                role="switch"
                aria-checked="true"
                data-checked="true"
                onClick$={(event: MouseEvent) => {
                  const target = event.currentTarget
                  if (!(target instanceof HTMLButtonElement)) {
                    return
                  }
                  const checked = target.dataset.checked !== "true"
                  target.dataset.checked = checked ? "true" : "false"
                  target.setAttribute("aria-checked", checked ? "true" : "false")
                }}
              >
                <span></span>
              </button>
              <label class="playground-warning-copy" for="playground-show-warning">
                <strong>Show a warning when content is flagged</strong>
                <span>A warning will be shown when sexual, hateful, violent or self-harm content is detected.</span>
              </label>
            </div>
          </div>
          <footer class="playground-dialog-footer">
            <button type="button" class="playground-header-button" data-playground-dialog-close>Close</button>
          </footer>
        </section>
      </div>

      <div
        class="playground-dialog-overlay"
        data-playground-dialog="delete-preset"
        role="presentation"
        hidden
      >
        <section
          class="playground-dialog playground-alert-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="playground-delete-title"
          aria-describedby="playground-delete-description"
        >
          <header class="playground-dialog-header">
            <h3 id="playground-delete-title">Are you absolutely sure?</h3>
            <p id="playground-delete-description">
              This action cannot be undone. This preset will no longer be accessible by you or others you&apos;ve shared it with.
            </p>
          </header>
          <footer class="playground-dialog-footer playground-alert-footer">
            <button type="button" class="playground-header-button" data-playground-dialog-close>Cancel</button>
            <button type="button" class="playground-destructive-button" data-playground-delete-confirm>Delete</button>
          </footer>
        </section>
      </div>

      <div class="playground-toast-region" role="status" aria-live="polite" data-playground-toast-region></div>
    </div>
  )
}

function AuthenticationExample() {
  return (
    <div class="live-example auth-example">
      <a class="auth-login-link" href="/examples/authentication">
        Login
      </a>
      <section class="auth-brand-panel">
        <div class="auth-logo-row">
          <svg class="auth-logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          <span>Acme Inc</span>
        </div>
        <blockquote>
          &ldquo;This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before.&rdquo; - Sofia Davis
        </blockquote>
      </section>

      <section class="auth-form-panel">
        <div class="auth-form-shell">
          <div class="auth-shell-header">
            <h3>Create an account</h3>
            <p class="tasks-copy">Enter your email below to create your account</p>
          </div>

          <form class="auth-field-group" data-auth-form>
            <label class="sr-only" for="auth-email">Email</label>
            <input
              id="auth-email"
              class="auth-input"
              type="email"
              placeholder="name@example.com"
              autoCapitalize="none"
              autoComplete="email"
            />
            <button class="auth-submit-button" type="submit">
              <span class="auth-spinner" data-auth-spinner hidden aria-hidden="true"></span>
              <span>Sign In with Email</span>
            </button>
          </form>

          <div class="auth-divider">
            <span />
            <p>Or continue with</p>
            <span />
          </div>

          <button class="auth-provider-button" type="button" data-auth-provider>
            <span class="auth-provider-icon" data-auth-provider-icon>
              <GitHubMarkIcon />
            </span>
            <span class="auth-spinner" data-auth-spinner hidden aria-hidden="true"></span>
            <span>GitHub</span>
          </button>

          <p class="auth-footnote">
            By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </section>
    </div>
  )
}

function GitHubMarkIcon() {
  return (
    <svg class="example-icon" viewBox="0 0 438.549 438.549" aria-hidden="true">
      <path
        fill="currentColor"
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
      />
    </svg>
  )
}

function RTLExample() {
  let direction = $state<DirectionMode>("rtl")

  return (
    <div class="live-example rtl-example">
      <header class="rtl-header">
        <div>
          <p class="dashboard-section-label">Direction aware UI</p>
          <h3>RTL Components</h3>
        </div>
        <div class="rtl-toggle-row">
          <button
            type="button"
            data-direction="rtl"
            class={direction === "rtl" ? "rtl-toggle rtl-toggle-active" : "rtl-toggle"}
            onClick$={(event: MouseEvent) => {
              const target = event.currentTarget
              if (!(target instanceof HTMLButtonElement)) {
                return
              }

              const nextDirection = resolveDirectionMode(target.dataset.direction)
              if (!nextDirection) {
                return
              }

              direction = nextDirection
            }}
          >
            RTL
          </button>
          <button
            type="button"
            data-direction="ltr"
            class={direction === "ltr" ? "rtl-toggle rtl-toggle-active" : "rtl-toggle"}
            onClick$={(event: MouseEvent) => {
              const target = event.currentTarget
              if (!(target instanceof HTMLButtonElement)) {
                return
              }

              const nextDirection = resolveDirectionMode(target.dataset.direction)
              if (!nextDirection) {
                return
              }

              direction = nextDirection
            }}
          >
            LTR
          </button>
        </div>
      </header>

      <div class="rtl-preview-frame" dir={direction}>
        <section class="rtl-card">
          <div class="rtl-card-head">
            <div>
              <p class="dashboard-section-label">لوحة التحكم</p>
              <h4>إدارة الفريق</h4>
            </div>
            <span class="dashboard-chart-chip">جاهز</span>
          </div>

          <div class="rtl-stat-grid">
            {rtlSampleRows.map((entry) => (
              <article class="rtl-stat-card" key={entry.title}>
                <p>{entry.title}</p>
                <strong>{entry.owner}</strong>
                <span>{entry.state}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function ExampleFallback(props: { slug: string }) {
  return (
    <div class="live-example example-fallback">
      <h3>{props.slug}</h3>
      <p>This example preview is not available yet.</p>
    </div>
  )
}
