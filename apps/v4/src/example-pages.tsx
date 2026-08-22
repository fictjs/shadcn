import { $state, untrack } from "fict"

import {
  TablerChartBarIcon,
  TablerChevronDownIcon,
  TablerChevronLeftIcon,
  TablerChevronRightIcon,
  TablerChevronsLeftIcon,
  TablerChevronsRightIcon,
  TablerCircleCheckFilledIcon,
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
  TablerPlusIcon,
  TablerReportIcon,
  TablerSearchIcon,
  TablerSettingsIcon,
  TablerTrendingDownIcon,
  TablerTrendingUpIcon,
  TablerUsersIcon,
} from "./example-icons"
import { dashboardTableRows, visitorChartData } from "./example-data"

interface LiveExamplePageProps {
  slug: string
}

interface TaskRow {
  id: string
  title: string
  status: "todo" | "in-progress" | "done"
  priority: "Low" | "Medium" | "High"
  team: string
}

type TaskStatusFilter = "all" | TaskRow["status"]
type DashboardRange = "90d" | "30d" | "7d"
type DashboardView = "outline" | "past-performance" | "key-personnel" | "focus-documents"
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
const dashboardNavItems = ["Dashboard", "Lifecycle", "Analytics", "Projects", "Team"] as const
const dashboardDocumentItems = ["Data Library", "Reports", "Word Assistant"] as const
const dashboardSecondaryItems = ["Settings", "Get Help", "Search"] as const
const dashboardViewTabs = ["Outline", "Past Performance", "Key Personnel", "Focus Documents"] as const
const taskRows: TaskRow[] = [
  { id: "TASK-8782", title: "You can’t compress the program without quantifying the open-source SSD pixel!", status: "in-progress", priority: "Medium", team: "Design" },
  { id: "TASK-7878", title: "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!", status: "todo", priority: "High", team: "Product" },
  { id: "TASK-7839", title: "We need to bypass the neural TCP card and back up the haptic RSS panel!", status: "done", priority: "Low", team: "Support" },
  { id: "TASK-5562", title: "The SAS interface is down, bypass the open-source matrix so we can program the PNG bus!", status: "in-progress", priority: "High", team: "Growth" },
  { id: "TASK-8686", title: "The SQL application is down, override the virtual circuit so we can parse the PNG bandwidth!", status: "todo", priority: "Medium", team: "Platform" },
] 

const playgroundPresets = ["Explain quantum computing", "Write release notes", "Draft support reply"] as const
const playgroundModels = ["gpt-4.1", "gpt-4o-mini", "claude-sonnet", "gemini-pro"] as const

const rtlSampleRows = [
  { title: "تحسين تجربة تسجيل الدخول", owner: "فريق المنتج", state: "قيد التنفيذ" },
  { title: "مراجعة أنماط الجداول", owner: "فريق التصميم", state: "جاهز" },
  { title: "تحديث شريط التنقل", owner: "فريق الواجهة", state: "جديد" },
] as const

function resolveTaskStatusFilter(value: string | undefined): TaskStatusFilter | null {
  return value === "all" || value === "todo" || value === "in-progress" || value === "done"
    ? value
    : null
}

function resolveDashboardRange(value: string | undefined): DashboardRange | null {
  return value === "90d" || value === "30d" || value === "7d" ? value : null
}

function resolveDashboardView(value: string | undefined): DashboardView | null {
  return value === "outline" || value === "past-performance" || value === "key-personnel" || value === "focus-documents"
    ? value
    : null
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
                <div class="dashboard-menu-item" key={item}>
                  <a class="dashboard-menu-button" href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}>
                    <DashboardNavIcon name={item} />
                    <span>{item}</span>
                  </a>
                  <button class="dashboard-menu-action" type="button" aria-label={`More options for ${item}`}>
                    <TablerDotsIcon />
                  </button>
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
          <button class="dashboard-menu-button dashboard-menu-button-lg" type="button">
            <img class="dashboard-user-avatar" src="/avatars/shadcn.jpg" alt="shadcn" width="32" height="32" />
            <span class="dashboard-user-meta">
              <span class="dashboard-user-name">shadcn</span>
              <span class="dashboard-user-email">m@example.com</span>
            </span>
            <TablerDotsVerticalIcon class="dashboard-user-more" />
          </button>
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
            <div class="dashboard-range-group" role="group" aria-label="Dashboard chart range">
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
                  onClick={(event: MouseEvent) => {
                    const target = event.currentTarget
                    if (!(target instanceof HTMLButtonElement)) {
                      return
                    }

                    const nextRange = resolveDashboardRange(target.dataset.range)
                    if (!nextRange) {
                      return
                    }

                    timeRange = nextRange
                  }}
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
            <div class="dashboard-tabs-list" role="tablist" aria-label="Dashboard views">
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
                    onClick={(event: MouseEvent) => {
                      const target = event.currentTarget
                      if (!(target instanceof HTMLButtonElement)) {
                        return
                      }

                      const nextView = resolveDashboardView(target.dataset.view)
                      if (!nextView) {
                        return
                      }

                      activeView = nextView
                    }}
                  >
                    {tab}
                    <DashboardTabBadge tab={tab} />
                  </button>
                )
              })}
            </div>

            <div class="dashboard-table-actions">
              <button type="button" class="dashboard-outline-button">
                <TablerLayoutColumnsIcon />
                <span>Customize Columns</span>
                <TablerChevronDownIcon />
              </button>
              <button type="button" class="dashboard-outline-button">
                <TablerPlusIcon />
                <span>Add Section</span>
              </button>
            </div>
          </div>

          {activeView === "outline" ? (
            <div class="dashboard-table-panel">
              <div class="dashboard-table-frame">
                <table class="dashboard-data-table">
                  <thead>
                    <tr>
                      <th class="dashboard-cell-drag"></th>
                      <th class="dashboard-cell-select"></th>
                      <th>Header</th>
                      <th>Section Type</th>
                      <th>Status</th>
                      <th class="dashboard-cell-number">Target</th>
                      <th class="dashboard-cell-number">Limit</th>
                      <th>Reviewer</th>
                      <th class="dashboard-cell-actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardTableRows.slice(0, DASHBOARD_PAGE_SIZE).map((row) => (
                      <tr key={row.id}>
                        <td class="dashboard-cell-drag">
                          <button type="button" class="dashboard-icon-button dashboard-drag-handle" aria-label="Drag to reorder">
                            <TablerGripVerticalIcon class="dashboard-grip-icon" />
                          </button>
                        </td>
                        <td class="dashboard-cell-select">
                          <input type="checkbox" class="dashboard-checkbox" aria-label={`Select ${row.header}`} />
                        </td>
                        <td>
                          <button type="button" class="dashboard-cell-link">{row.header}</button>
                        </td>
                        <td>
                          <span class="dashboard-cell-badge">{row.type}</span>
                        </td>
                        <td>
                          <span class="dashboard-cell-badge">
                            <DashboardStatusIcon status={row.status} />
                            {row.status}
                          </span>
                        </td>
                        <td class="dashboard-cell-number">
                          <input class="dashboard-cell-input" value={row.target} aria-label={`Target for ${row.header}`} />
                        </td>
                        <td class="dashboard-cell-number">
                          <input class="dashboard-cell-input" value={row.limit} aria-label={`Limit for ${row.header}`} />
                        </td>
                        <td>
                          <DashboardReviewerCell reviewer={row.reviewer} />
                        </td>
                        <td class="dashboard-cell-actions">
                          <button type="button" class="dashboard-icon-button" aria-label="Open menu">
                            <TablerDotsVerticalIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div class="dashboard-table-footer">
                <p class="dashboard-table-selection">0 of {dashboardTableRows.length} row(s) selected.</p>
                <div class="dashboard-table-pagination">
                  <div class="dashboard-rows-per-page">
                    <span class="dashboard-pagination-label">Rows per page</span>
                    <span class="dashboard-select-trigger dashboard-select-trigger-narrow">
                      <span>{DASHBOARD_PAGE_SIZE}</span>
                      <TablerChevronDownIcon class="dashboard-select-chevron" />
                    </span>
                  </div>
                  <p class="dashboard-pagination-label">
                    Page 1 of {Math.ceil(dashboardTableRows.length / DASHBOARD_PAGE_SIZE)}
                  </p>
                  <div class="dashboard-pagination-buttons">
                    <button type="button" class="dashboard-pagination-button" aria-label="Go to first page" disabled>
                      <TablerChevronsLeftIcon />
                    </button>
                    <button type="button" class="dashboard-pagination-button" aria-label="Go to previous page" disabled>
                      <TablerChevronLeftIcon />
                    </button>
                    <button type="button" class="dashboard-pagination-button" aria-label="Go to next page">
                      <TablerChevronRightIcon />
                    </button>
                    <button type="button" class="dashboard-pagination-button" aria-label="Go to last page">
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

function TasksExample() {
  let query = $state("")
  let status = $state<TaskStatusFilter>("all")
  let filteredTasks = $state<TaskRow[]>(taskRows)

  return (
    <div class="live-example tasks-example">
      <header class="tasks-header">
        <div>
          <h2>Welcome back!</h2>
          <p class="tasks-copy">Here&apos;s a list of your tasks for this month.</p>
        </div>
        <button type="button" class="tasks-user-nav" aria-label="Open user menu">
          <span class="tasks-user-avatar">JD</span>
        </button>
      </header>

      <section class="tasks-table-card">
        <div class="tasks-table-toolbar">
          <label class="tasks-search-field">
            <span class="tasks-search-label">Filter tasks</span>
            <input
              id="tasks-filter"
              type="text"
              value={query}
              placeholder="Search issue, title, or team"
              onInput={(event) => {
                const target = event.target
                if (!(target instanceof HTMLInputElement)) {
                  return
                }

                const nextQuery = target.value
                query = nextQuery
                const statusSnapshot = untrack(() => status)
                const normalized = nextQuery.trim().toLowerCase()
                const nextRows: TaskRow[] = []

                for (const task of taskRows) {
                  const matchesStatus = statusSnapshot === "all" ? true : task.status === statusSnapshot
                  const matchesQuery = normalized.length === 0
                    ? true
                    : `${task.id} ${task.title} ${task.team}`.toLowerCase().includes(normalized)

                  if (matchesStatus && matchesQuery) {
                    nextRows.push(task)
                  }
                }

                filteredTasks = nextRows
              }}
            />
          </label>

          <div class="tasks-table-toolbar-actions">
            <div class="tasks-filter-row">
          {[
            ["all", "All"],
            ["todo", "Todo"],
            ["in-progress", "In Progress"],
            ["done", "Done"],
          ].map((entry) => (
            <button
              type="button"
              key={entry[0]}
              data-status={entry[0]}
              class={status === entry[0] ? "tasks-chip tasks-chip-active" : "tasks-chip"}
              onClick={(event: MouseEvent) => {
                const target = event.currentTarget
                if (!(target instanceof HTMLButtonElement)) {
                  return
                }

                const nextStatus = resolveTaskStatusFilter(target.dataset.status)
                if (!nextStatus) {
                  return
                }

                status = nextStatus
                const queryInput = document.getElementById("tasks-filter")
                const normalized = queryInput instanceof HTMLInputElement
                  ? queryInput.value.trim().toLowerCase()
                  : ""
                const nextRows: TaskRow[] = []

                for (const task of taskRows) {
                  const matchesStatus = nextStatus === "all" ? true : task.status === nextStatus
                  const matchesQuery = normalized.length === 0
                    ? true
                    : `${task.id} ${task.title} ${task.team}`.toLowerCase().includes(normalized)

                  if (matchesStatus && matchesQuery) {
                    nextRows.push(task)
                  }
                }

                filteredTasks = nextRows
              }}
            >
              {entry[1]}
            </button>
          ))}
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.id}</strong>
                  <p>{task.title}</p>
                </td>
                <td>
                  <span class={`tasks-status tasks-status-${task.status}`}>
                    {task.status === "in-progress" ? "in progress" : task.status}
                  </span>
                </td>
                <td>{task.priority}</td>
                <td>{task.team}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 ? <p class="tasks-empty-state">No tasks match the current filters.</p> : null}
      </section>
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
          <button class="playground-header-button playground-header-button-icon" type="button">Code</button>
          <button class="playground-header-button playground-header-button-icon" type="button">Share</button>
          <button class="playground-header-button playground-header-button-icon" type="button" aria-label="Actions">...</button>
        </div>
      </header>

      <div class="playground-separator" aria-hidden="true"></div>

      <div class="playground-shell">
        <section class="playground-main-column">
          <div class="playground-editor-grid">
            {mode === "complete" ? (
              <div class="playground-complete-panel">
                <div class="playground-textarea playground-copy-surface">{preset}</div>
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

          <section class="playground-field playground-sidebar-stack">
            <span>Model</span>
            <div class="playground-option-group">
              <button
                type="button"
                class={model === "gpt-4.1" ? "playground-option-button playground-option-button-active" : "playground-option-button"}
                aria-pressed={model === "gpt-4.1"}
                onClick={() => {
                  model = "gpt-4.1"
                }}
              >
                gpt-4.1
              </button>
              <button
                type="button"
                class={model === "gpt-4o-mini" ? "playground-option-button playground-option-button-active" : "playground-option-button"}
                aria-pressed={model === "gpt-4o-mini"}
                onClick={() => {
                  model = "gpt-4o-mini"
                }}
              >
                gpt-4o-mini
              </button>
              <button
                type="button"
                class={model === "claude-sonnet" ? "playground-option-button playground-option-button-active" : "playground-option-button"}
                aria-pressed={model === "claude-sonnet"}
                onClick={() => {
                  model = "claude-sonnet"
                }}
              >
                claude-sonnet
              </button>
              <button
                type="button"
                class={model === "gemini-pro" ? "playground-option-button playground-option-button-active" : "playground-option-button"}
                aria-pressed={model === "gemini-pro"}
                onClick={() => {
                  model = "gemini-pro"
                }}
              >
                gemini-pro
              </button>
            </div>
          </section>

          <PlaygroundSlider label="Temperature" name="temperature" min={0} max={100} step={1} value={56} />
          <PlaygroundSlider label="Maximum Length" name="max-length" min={64} max={512} step={1} value={256} />
          <PlaygroundSlider label="Top P" name="top-p" min={0} max={100} step={1} value={90} />
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
          <span class="auth-logo-badge">S</span>
          <span>Acme Inc</span>
        </div>
        <blockquote>
          &ldquo;This library has saved me countless hours of work and helped me deliver stunning designs faster than ever before.&rdquo;
          <footer>- Sofia Davis</footer>
        </blockquote>
      </section>

      <section class="auth-form-panel">
        <div class="auth-form-shell">
          <div class="auth-shell-header">
            <h3>Create an account</h3>
            <p class="tasks-copy">Enter your email below to create your account</p>
          </div>

          <div class="auth-button-stack">
            <button class="auth-provider-button" type="button">Continue with GitHub</button>
            <button class="auth-provider-button" type="button">Continue with Google</button>
          </div>

          <div class="auth-divider">
            <span />
            <p>or continue with</p>
            <span />
          </div>

          <label class="auth-field">
            <span>Email</span>
            <input type="email" placeholder="name@example.com" />
          </label>

          <label class="auth-field">
            <span>Password</span>
            <input type="password" placeholder="Create a password" />
          </label>

          <button class="playground-primary-button auth-submit-button" type="button">Create account</button>
          <p class="auth-footnote">By clicking continue, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </section>
    </div>
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
            class={direction === "rtl" ? "tasks-chip tasks-chip-active" : "tasks-chip"}
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
            class={direction === "ltr" ? "tasks-chip tasks-chip-active" : "tasks-chip"}
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
