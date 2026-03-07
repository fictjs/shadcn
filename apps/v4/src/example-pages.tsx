import { $state, untrack } from "fict"

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

const dashboardNavItems = ["Dashboard", "Lifecycle", "Analytics", "Projects", "Team"] as const
const dashboardDocumentItems = ["Data Library", "Reports", "Word Assistant"] as const
const dashboardSecondaryItems = ["Settings", "Get Help", "Search"] as const
const dashboardViewTabs = ["Outline", "Past Performance", "Key Personnel", "Focus Documents"] as const
const dashboardOutlineRows = [
  {
    header: "Executive Summary",
    type: "Narrative",
    status: "Done",
    target: "18",
    limit: "24",
    reviewer: "Eddie Lake",
  },
  {
    header: "Technical Approach",
    type: "Technical Approach",
    status: "In Progress",
    target: "12",
    limit: "18",
    reviewer: "Jamik Tashpulatov",
  },
  {
    header: "Capabilities",
    type: "Capabilities",
    status: "Done",
    target: "10",
    limit: "16",
    reviewer: "Emily Whalen",
  },
  {
    header: "Focus Documents",
    type: "Focus Documents",
    status: "Not Started",
    target: "08",
    limit: "12",
    reviewer: "Assign reviewer",
  },
] as const

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

function resolvePlaygroundMode(value: string | undefined): PlaygroundMode | null {
  return value === "complete" || value === "insert" || value === "edit" ? value : null
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

function DashboardExample() {
  let timeRange = $state<DashboardRange>("90d")
  let activeView = $state<DashboardView>("outline")

  const chartLabel = timeRange === "90d"
    ? "Total for the last 3 months"
    : timeRange === "30d"
      ? "Total for the last 30 days"
      : "Total for the last 7 days"

  return (
    <div class="live-example dashboard-example">
      <aside class="dashboard-sidebar">
        <div class="dashboard-sidebar-top">
          <div class="dashboard-brand-row">
            <div class="dashboard-brand-mark">S</div>
            <div>
              <p class="dashboard-brand-title">Acme Inc.</p>
            </div>
          </div>

          <nav class="dashboard-nav" aria-label="Dashboard sidebar">
            {dashboardNavItems.map((item, index) => (
              <a class={index === 0 ? "dashboard-nav-link dashboard-nav-link-active" : "dashboard-nav-link"} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} key={item}>
                <span class="dashboard-nav-icon">{item.charAt(0)}</span>
                <span>{item}</span>
              </a>
            ))}
          </nav>

          <section class="dashboard-sidebar-section">
            <p class="dashboard-sidebar-heading">Documents</p>
            <div class="dashboard-sidebar-stack">
              {dashboardDocumentItems.map((item) => (
                <a class="dashboard-doc-link" href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} key={item}>
                  <span class="dashboard-doc-icon">{item.charAt(0)}</span>
                  <span>{item}</span>
                </a>
              ))}
            </div>
          </section>
        </div>

        <div class="dashboard-sidebar-bottom">
          <nav class="dashboard-secondary-nav" aria-label="Dashboard utilities">
            {dashboardSecondaryItems.map((item) => (
              <a class="dashboard-secondary-link" href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} key={item}>
                {item}
              </a>
            ))}
          </nav>

          <div class="dashboard-user-card">
            <span class="dashboard-user-avatar">S</span>
            <div class="dashboard-user-meta">
              <strong>shadcn</strong>
              <span>m@example.com</span>
            </div>
          </div>
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
                <span class={stat.delta.startsWith("-") ? "dashboard-stat-badge dashboard-stat-badge-negative" : "dashboard-stat-badge"}>{stat.delta}</span>
              </div>
              <h4>{stat.value}</h4>
              <div class="dashboard-stat-foot">
                <p class="dashboard-stat-trend">{stat.trend}</p>
                <p class="dashboard-stat-copy">{stat.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <article class="dashboard-chart-card">
          <div class="dashboard-chart-head">
            <div>
              <p class="dashboard-chart-title">Total Visitors</p>
              <p class="dashboard-chart-description">{chartLabel}</p>
            </div>
            <div class="dashboard-chart-actions" role="tablist" aria-label="Dashboard chart range">
              {[
                ["90d", "Last 3 months"],
                ["30d", "Last 30 days"],
                ["7d", "Last 7 days"],
              ].map((entry) => (
                <button
                  type="button"
                  key={entry[0]}
                  data-range={entry[0]}
                  class={timeRange === entry[0] ? "dashboard-range-chip dashboard-range-chip-active" : "dashboard-range-chip"}
                  onClick$={(event: MouseEvent) => {
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
          <svg class="dashboard-chart" viewBox="0 0 640 280" role="img" aria-label="Visitors chart">
            <path d="M40 210 L130 168 L220 184 L310 112 L400 130 L490 72 L580 104 L580 240 L40 240 Z" fill="rgba(15, 23, 42, 0.08)" />
            <path d="M40 210 L130 168 L220 184 L310 112 L400 130 L490 72 L580 104" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <g class="dashboard-chart-guides">
              <line x1="40" y1="80" x2="580" y2="80" />
              <line x1="40" y1="140" x2="580" y2="140" />
              <line x1="40" y1="200" x2="580" y2="200" />
            </g>
          </svg>
        </article>

        <section class="dashboard-outline-card">
          <div class="dashboard-outline-toolbar">
            <div class="dashboard-view-tabs" role="tablist" aria-label="Dashboard views">
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
                    data-view={value}
                    class={activeView === value ? "dashboard-view-tab dashboard-view-tab-active" : "dashboard-view-tab"}
                    onClick$={(event: MouseEvent) => {
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
                  </button>
                )
              })}
            </div>

            <div class="dashboard-outline-actions">
              <button type="button" class="dashboard-outline-button">Columns</button>
              <button type="button" class="dashboard-outline-button dashboard-outline-button-primary">Add Section</button>
            </div>
          </div>

          {activeView === "outline" ? (
            <div class="dashboard-outline-table-wrap">
              <table class="dashboard-outline-table">
                <thead>
                  <tr>
                    <th>Header</th>
                    <th>Section Type</th>
                    <th>Status</th>
                    <th>Target</th>
                    <th>Limit</th>
                    <th>Reviewer</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardOutlineRows.map((row) => (
                    <tr key={row.header}>
                      <td>{row.header}</td>
                      <td>{row.type}</td>
                      <td>
                        <span class={`dashboard-outline-status dashboard-outline-status-${row.status.toLowerCase().replace(/\s+/g, "-")}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{row.target}</td>
                      <td>{row.limit}</td>
                      <td>{row.reviewer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div class="dashboard-outline-footer">
                <p>4 proposal sections</p>
                <p>Page 1 of 1</p>
              </div>
            </div>
          ) : (
            <div class="dashboard-outline-placeholder">
              <p>{activeView.replace(/-/g, " ")}</p>
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
  let filteredTasks: TaskRow[] = $state(taskRows)

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
              onClick$={(event: MouseEvent) => {
                const target = event.currentTarget
                if (!(target instanceof HTMLButtonElement)) {
                  return
                }

                const nextStatus = resolveTaskStatusFilter(target.dataset.status)
                if (!nextStatus) {
                  return
                }

                status = nextStatus
                const querySnapshot = untrack(() => query)
                const normalized = querySnapshot.trim().toLowerCase()
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
                  <span class={`tasks-status tasks-status-${task.status}`}>{task.status.replace("-", " ")}</span>
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
              {[
                ["complete", "Complete"],
                ["insert", "Insert"],
                ["edit", "Edit"],
              ].map((entry) => (
                <button
                  key={entry[0]}
                  type="button"
                  data-mode={entry[0]}
                  role="tab"
                  aria-selected={mode === entry[0]}
                  class={mode === entry[0] ? "playground-tab playground-tab-active" : "playground-tab"}
                  onClick$={(event: MouseEvent) => {
                    const target = event.currentTarget
                    if (!(target instanceof HTMLButtonElement)) {
                      return
                    }

                    const nextMode = resolvePlaygroundMode(target.dataset.mode)
                    if (!nextMode) {
                      return
                    }

                    mode = nextMode
                  }}
                >
                  {entry[0] === "complete" ? (
                    <svg viewBox="0 0 20 20" aria-hidden="true" class="playground-tab-icon">
                      <rect x="4" y="3" width="12" height="2" rx="1"></rect>
                      <rect x="4" y="7" width="12" height="2" rx="1"></rect>
                      <rect x="4" y="11" width="3" height="2" rx="1"></rect>
                      <rect x="8.5" y="11" width="3" height="2" rx="1"></rect>
                      <rect x="13" y="11" width="3" height="2" rx="1"></rect>
                      <rect x="4" y="15" width="3" height="2" rx="1"></rect>
                      <rect x="8.5" y="15" width="3" height="2" rx="1"></rect>
                    </svg>
                  ) : entry[0] === "insert" ? (
                    <svg viewBox="0 0 20 20" aria-hidden="true" class="playground-tab-icon">
                      <path d="M10 3.5V10"></path>
                      <path d="M7 7.5L10 10.5L13 7.5"></path>
                      <rect x="4" y="15" width="3" height="2" rx="1"></rect>
                      <rect x="8.5" y="15" width="3" height="2" rx="1"></rect>
                      <rect x="13" y="15" width="3" height="2" rx="1"></rect>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" aria-hidden="true" class="playground-tab-icon">
                      <rect x="4" y="3" width="12" height="2" rx="1"></rect>
                      <rect x="4" y="7" width="12" height="2" rx="1"></rect>
                      <rect x="4" y="11" width="3" height="2" rx="1"></rect>
                      <rect x="4" y="15" width="4" height="2" rx="1"></rect>
                      <rect x="8.5" y="11" width="3" height="2" rx="1"></rect>
                      <path d="M12 16.5L15.5 13L16.8 14.3L13.3 17.8H12Z"></path>
                    </svg>
                  )}
                  <span class="sr-only">{entry[1]}</span>
                </button>
              ))}
            </div>
          </section>

          <section class="playground-field playground-sidebar-stack">
            <span>Model</span>
            <div class="playground-option-group">
              {playgroundModels.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  data-model={entry}
                  class={model === entry ? "playground-option-button playground-option-button-active" : "playground-option-button"}
                  aria-pressed={model === entry}
                  onClick$={(event: MouseEvent) => {
                    const target = event.currentTarget
                    if (!(target instanceof HTMLButtonElement)) {
                      return
                    }

                    const nextModel = target.dataset.model
                    if (!nextModel) {
                      return
                    }

                    model = nextModel
                  }}
                >
                  {entry}
                </button>
              ))}
            </div>
          </section>

          <label class="playground-field">
            <span>Temperature</span>
            <input type="range" min="0" max="100" value="56" />
          </label>

          <label class="playground-field">
            <span>Max Length</span>
            <input type="range" min="64" max="512" value="256" />
          </label>

          <label class="playground-field">
            <span>Top P</span>
            <input type="range" min="0" max="100" value="90" />
          </label>
        </aside>
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
