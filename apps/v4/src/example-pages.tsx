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
  LucideEllipsisIcon,
  LucideSettings2Icon,
  LucideTimerIcon,
} from "./example-icons"
import { dashboardTableRows, taskRows, visitorChartData } from "./example-data"

interface LiveExamplePageProps {
  slug: string
}

type DashboardRange = "90d" | "30d" | "7d"
type DashboardView = "outline" | "past-performance" | "key-personnel" | "focus-documents"
type DashboardPageSize = 10 | 20 | 30 | 40 | 50
type PlaygroundMode = "complete" | "insert" | "edit"
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
const playgroundPresets = ["Explain quantum computing", "Write release notes", "Draft support reply"] as const
const playgroundModels = ["gpt-4.1", "gpt-4o-mini", "claude-sonnet", "gemini-pro"] as const

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
  const selectedRows = scope.dataset.dashboardSelectedRows || "|"
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

function syncDashboardTableSelections(): void {
  document.querySelectorAll<HTMLElement>(".dashboard-table-selection-scope").forEach((scope) => {
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

function DashboardReviewerCell(props: { reviewer: string }) {
  return props.reviewer === "Assign reviewer" ? (
    <span class="dashboard-select-trigger dashboard-select-trigger-reviewer">
      <span class="dashboard-select-placeholder">Assign reviewer</span>
      <TablerChevronDownIcon class="dashboard-select-chevron" />
    </span>
  ) : (
    props.reviewer
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
  let selectedDashboardRows = $state("|")
  let selectedDashboardCount = $state(0)
  let hiddenDashboardColumns = $state("|")

  const activeViewLabel = activeView === "past-performance"
    ? "past performance"
    : activeView === "key-personnel"
      ? "key personnel"
      : activeView === "focus-documents"
        ? "focus documents"
        : "outline"

  return (
    <div class="live-example dashboard-example">
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
              <button type="button" class="dashboard-outline-button">
                <TablerPlusIcon />
                <span>Add Section</span>
              </button>
            </div>
          </div>

          {activeView === "outline" ? (
            <div class="dashboard-table-panel">
              <div class="dashboard-table-frame">
                <div
                  class="dashboard-table-selection-scope"
                  data-dashboard-selected-rows={selectedDashboardRows}
                  data-dashboard-hidden-columns={hiddenDashboardColumns}
                  onInput$={(event: Event) => {
                    const target = event.target
                    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
                      return
                    }

                    const selectionScope = target.closest<HTMLElement>(".dashboard-table-selection-scope")
                    if (!selectionScope) {
                      return
                    }

                    let selectedRows = selectionScope.dataset.dashboardSelectedRows || "|"
                    if (target.dataset.dashboardSelectAll === "true") {
                      const rowCheckboxes = target
                        .closest(".dashboard-table-frame")
                        ?.querySelectorAll<HTMLInputElement>("[data-dashboard-row-id]")

                      for (const checkbox of rowCheckboxes ?? []) {
                        const rowId = checkbox.dataset.dashboardRowId
                        if (!rowId) {
                          continue
                        }

                        selectedRows = updateDashboardSelection(selectedRows, rowId, target.checked)
                      }
                    } else {
                      const rowId = target.dataset.dashboardRowId
                      if (!rowId) {
                        return
                      }

                      selectedRows = updateDashboardSelection(selectedRows, rowId, target.checked)
                    }

                    selectionScope.dataset.dashboardSelectedRows = selectedRows
                    selectedDashboardRows = selectedRows
                    selectedDashboardCount = countDashboardSelection(selectedRows)
                    window.requestAnimationFrame(syncDashboardTableSelections)
                  }}
                >
                  <DashboardTablePage
                    pageIndex={dashboardPageIndex}
                    pageSize={dashboardPageSize}
                  />
                </div>
              </div>

              <div class="dashboard-table-footer">
                <p class="dashboard-table-selection">{selectedDashboardCount} of {dashboardTableRows.length} row(s) selected.</p>
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
                      class="dashboard-pagination-button"
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
                      class="dashboard-pagination-button"
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
          <tr key={row.id}>
            <td class="dashboard-cell-drag">
              <button type="button" class="dashboard-icon-button dashboard-drag-handle" aria-label="Drag to reorder">
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
              <button type="button" class="dashboard-cell-link">{row.header}</button>
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
              <input class="dashboard-cell-input" value={row.target} aria-label={`Target for ${row.header}`} />
            </td>
            <td class="dashboard-cell-number" data-dashboard-column="limit">
              <input class="dashboard-cell-input" value={row.limit} aria-label={`Limit for ${row.header}`} />
            </td>
            <td data-dashboard-column="reviewer">
              <DashboardReviewerCell reviewer={row.reviewer} />
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

function TasksExample() {
  const pageRows = taskRows.slice(0, TASKS_PAGE_SIZE)

  return (
    <div class="live-example tasks-example">
      <header class="tasks-header">
        <div class="tasks-heading">
          <h2>Welcome back!</h2>
          <p class="tasks-copy">Here&apos;s a list of your tasks for this month.</p>
        </div>
        <button type="button" class="tasks-user-nav" aria-label="Open user menu">
          <img class="tasks-user-avatar" src="/avatars/shadcn.jpg" alt="shadcn" width="36" height="36" />
        </button>
      </header>

      <div class="tasks-table-block">
        <div class="tasks-toolbar">
          <div class="tasks-toolbar-filters">
            <input id="tasks-filter" class="tasks-filter-input" type="text" placeholder="Filter tasks..." aria-label="Filter tasks" />
            <button type="button" class="tasks-facet-button">
              <LucideCirclePlusIcon />
              <span>Status</span>
            </button>
            <button type="button" class="tasks-facet-button">
              <LucideCirclePlusIcon />
              <span>Priority</span>
            </button>
          </div>
          <div class="tasks-toolbar-actions">
            <button type="button" class="tasks-outline-button">
              <LucideSettings2Icon />
              <span>View</span>
            </button>
            <button type="button" class="tasks-primary-button">Add Task</button>
          </div>
        </div>

        <div class="tasks-table-frame">
          <table class="tasks-data-table">
            <thead>
              <tr>
                <th class="tasks-cell-select">
                  <input type="checkbox" class="tasks-checkbox" aria-label="Select all" />
                </th>
                <th>
                  <span class="tasks-column-header">Task</span>
                </th>
                <th>
                  <button type="button" class="tasks-sort-button">
                    <span>Title</span>
                    <LucideChevronsUpDownIcon />
                  </button>
                </th>
                <th>
                  <button type="button" class="tasks-sort-button">
                    <span>Status</span>
                    <LucideChevronsUpDownIcon />
                  </button>
                </th>
                <th>
                  <button type="button" class="tasks-sort-button">
                    <span>Priority</span>
                    <LucideChevronsUpDownIcon />
                  </button>
                </th>
                <th class="tasks-cell-actions"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((task) => (
                <tr key={task.id}>
                  <td class="tasks-cell-select">
                    <input type="checkbox" class="tasks-checkbox" aria-label={`Select ${task.id}`} />
                  </td>
                  <td class="tasks-cell-id">{task.id}</td>
                  <td>
                    <div class="tasks-title-cell">
                      <span class="tasks-label-badge">{formatTaskLabel(task.label)}</span>
                      <span class="tasks-title-text">{task.title}</span>
                    </div>
                  </td>
                  <td>
                    <div class="tasks-meta-cell tasks-status-cell">
                      <TaskStatusIcon status={task.status} />
                      <span>{formatTaskStatus(task.status)}</span>
                    </div>
                  </td>
                  <td>
                    <div class="tasks-meta-cell">
                      <TaskPriorityIcon priority={task.priority} />
                      <span>{formatTaskLabel(task.priority)}</span>
                    </div>
                  </td>
                  <td class="tasks-cell-actions">
                    <button type="button" class="tasks-row-action" aria-label="Open menu">
                      <LucideEllipsisIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div class="tasks-pagination">
          <p class="tasks-selection">0 of {taskRows.length} row(s) selected.</p>
          <div class="tasks-pagination-controls">
            <div class="tasks-rows-per-page">
              <span class="tasks-pagination-label">Rows per page</span>
              <span class="tasks-select-trigger">
                <span>{TASKS_PAGE_SIZE}</span>
                <LucideChevronsUpDownIcon class="tasks-select-chevron" />
              </span>
            </div>
            <p class="tasks-pagination-label">
              Page 1 of {Math.ceil(taskRows.length / TASKS_PAGE_SIZE)}
            </p>
            <div class="tasks-pagination-buttons">
              <button type="button" class="tasks-pagination-button" aria-label="Go to first page" disabled>
                <LucideChevronsLeftIcon />
              </button>
              <button type="button" class="tasks-pagination-button" aria-label="Go to previous page" disabled>
                <LucideChevronLeftIcon />
              </button>
              <button type="button" class="tasks-pagination-button" aria-label="Go to next page">
                <LucideChevronRightIcon />
              </button>
              <button type="button" class="tasks-pagination-button" aria-label="Go to last page">
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
  let mode = $state<PlaygroundMode>("complete")
  let preset = $state<string>(playgroundPresets[0])
  let model = $state<string>(playgroundModels[0])

  return (
    <div class="live-example playground-example">
      <header class="playground-header">
        <h3>Playground</h3>
        <div class="playground-top-actions">
          <button
            class="playground-header-button playground-header-button-wide"
            type="button"
            aria-label="Load a preset..."
            onClick$={() => {
              const currentPreset = untrack(() => preset)
              preset = currentPreset === playgroundPresets[0]
                ? playgroundPresets[1]
                : currentPreset === playgroundPresets[1]
                  ? playgroundPresets[2]
                  : playgroundPresets[0]
            }}
          >
            <span class="playground-header-button-label">Load a preset...</span>
            <span class="playground-header-button-value">{preset}</span>
          </button>
          <button class="playground-header-button" type="button">Save</button>
          <button class="playground-header-button" type="button">View code</button>
          <button class="playground-header-button" type="button">Share</button>
          <button class="playground-header-button playground-header-button-icon" type="button" aria-label="Actions">
            <LucideEllipsisIcon />
          </button>
        </div>
      </header>

      <div class="playground-separator" aria-hidden="true"></div>

      <div class="playground-shell">
        <section class="playground-main-column">
          <div class="playground-editor-grid" data-mode={mode}>
            {mode === "complete" ? (
              <div class="playground-complete-panel">
                <textarea class="playground-textarea" placeholder="Write a tagline for an ice cream shop"></textarea>
              </div>
            ) : null}

            {mode === "insert" ? (
              <>
                <div class="playground-textarea playground-copy-surface">We&apos;re writing to [inset]. Congrats from OpenAI!</div>
                <div class="playground-surface-pane playground-surface-pane-muted" aria-label="Insertion preview"></div>
              </>
            ) : null}

            {mode === "edit" ? (
              <>
                <div class="playground-edit-stack">
                  <label class="playground-field">
                    <span>Input</span>
                    <div class="playground-textarea playground-textarea-compact playground-copy-surface">We is going to the market.</div>
                  </label>
                  <label class="playground-field">
                    <span>Instructions</span>
                    <div class="playground-textarea playground-textarea-compact playground-copy-surface">Fix the grammar.</div>
                  </label>
                </div>
                <div class="playground-surface-pane" aria-label="Edit preview"></div>
              </>
            ) : null}
          </div>

          <div class="playground-submit-row">
            <button class="playground-primary-button" type="button">Submit</button>
            <button class="playground-ghost-button" type="button" aria-label="Show history">Reset</button>
          </div>
        </section>

        <aside class="playground-sidebar-panel">
          <section class="playground-field">
            <span>Mode</span>
            <div class="playground-icon-tab-list" role="tablist" aria-label="Playground modes">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "complete"}
                class={mode === "complete" ? "playground-tab playground-tab-active" : "playground-tab"}
                onClick={() => {
                  mode = "complete"
                }}
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
                aria-selected={mode === "insert"}
                class={mode === "insert" ? "playground-tab playground-tab-active" : "playground-tab"}
                onClick={() => {
                  mode = "insert"
                }}
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
                aria-selected={mode === "edit"}
                class={mode === "edit" ? "playground-tab playground-tab-active" : "playground-tab"}
                onClick={() => {
                  mode = "edit"
                }}
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
            <button
              type="button"
              class="playground-model-trigger"
              aria-label="Model"
              onClick={() => {
                const current = untrack(() => model)
                model = current === "gpt-4.1" ? "gpt-4o-mini"
                  : current === "gpt-4o-mini" ? "claude-sonnet"
                  : current === "claude-sonnet" ? "gemini-pro"
                  : "gpt-4.1"
              }}
            >
              <span>{model}</span>
              <LucideChevronsUpDownIcon class="playground-model-chevron" />
            </button>
          </section>

          <PlaygroundSlider label="Temperature" name="temperature" min={0} max={1} step={0.1} value={0.56} />
          <PlaygroundSlider label="Maximum Length" name="max-length" min={0} max={4000} step={10} value={256} />
          <PlaygroundSlider label="Top P" name="top-p" min={0} max={1} step={0.1} value={0.9} />
        </aside>
      </div>
    </div>
  )
}

function PlaygroundSlider(props: {
  label: string
  name: string
  min: number
  max: number
  step: number
  value: number
}) {
  const percent = ((props.value - props.min) / (props.max - props.min || 1)) * 100

  return (
    <div class="playground-field" data-slider-scope={props.name}>
      <div class="playground-field-head">
        <span>{props.label}</span>
        <span class="playground-field-value" data-slider-output="0">
          {props.value}
        </span>
      </div>
      <div
        class="ui-slider"
        data-slider={props.name}
        data-slider-min={String(props.min)}
        data-slider-max={String(props.max)}
        data-slider-step={String(props.step)}
        role="group"
        aria-label={props.label}
      >
        <span class="ui-slider-track">
          <span class="ui-slider-range" data-slider-range style={`left:0%;right:${100 - percent}%`}></span>
        </span>
        <span
          class="ui-slider-thumb"
          data-slider-thumb="0"
          data-slider-value={String(props.value)}
          role="slider"
          tabIndex={0}
          aria-label={props.label}
          aria-valuemin={props.min}
          aria-valuemax={props.max}
          aria-valuenow={props.value}
          style={`left:${percent}%`}
        ></span>
      </div>
    </div>
  )
}

function AuthenticationExample() {
  return (
    <div class="live-example auth-example">
      <a class="auth-login-link" href="#auth-login">
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

          <div class="auth-field-group">
            <input class="auth-input" type="email" placeholder="name@example.com" aria-label="Email" autoComplete="email" />
            <button class="auth-submit-button" type="button">Sign In with Email</button>
          </div>

          <div class="auth-divider">
            <span />
            <p>Or continue with</p>
            <span />
          </div>

          <button class="auth-provider-button" type="button">
            <GitHubMarkIcon />
            <span>GitHub</span>
          </button>

          <p class="auth-footnote">
            By clicking continue, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
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
