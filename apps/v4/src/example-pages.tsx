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
type PlaygroundMode = "complete" | "insert" | "edit"
type DirectionMode = "rtl" | "ltr"

const dashboardStats = [
  { label: "Total Revenue", value: "$45,231.89", delta: "+20.1% from last month" },
  { label: "Subscriptions", value: "+2,350", delta: "+180.1% from last month" },
  { label: "Sales", value: "+12,234", delta: "+19% from last month" },
  { label: "Active Now", value: "+573", delta: "+201 since last hour" },
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
  return (
    <div class="live-example dashboard-example">
      <aside class="dashboard-sidebar">
        <div class="dashboard-brand-row">
          <div class="dashboard-brand-mark">S</div>
          <div>
            <p class="dashboard-brand-title">Acme Inc</p>
            <p class="dashboard-brand-copy">Enterprise Workspace</p>
          </div>
        </div>

        <nav class="dashboard-nav" aria-label="Dashboard sidebar">
          <a class="dashboard-nav-link dashboard-nav-link-active" href="#dashboard-overview">
            Overview
          </a>
          <a class="dashboard-nav-link" href="#dashboard-reports">
            Reports
          </a>
          <a class="dashboard-nav-link" href="#dashboard-analytics">
            Analytics
          </a>
          <a class="dashboard-nav-link" href="#dashboard-team">
            Team
          </a>
        </nav>

        <section class="dashboard-sidebar-card">
          <p class="dashboard-section-label">Projects</p>
          <div class="dashboard-sidebar-stack">
            <div class="dashboard-project-row">
              <span>Design Engineering</span>
              <strong>24</strong>
            </div>
            <div class="dashboard-project-row">
              <span>Growth Experiments</span>
              <strong>16</strong>
            </div>
            <div class="dashboard-project-row">
              <span>Customer Ops</span>
              <strong>08</strong>
            </div>
          </div>
        </section>
      </aside>

      <div class="dashboard-main">
        <header class="dashboard-header">
          <div>
            <p class="dashboard-section-label">Overview</p>
            <h3>Dashboard</h3>
          </div>
          <div class="dashboard-toolbar">
            <button class="dashboard-pill dashboard-pill-active" type="button">
              Overview
            </button>
            <button class="dashboard-pill" type="button">
              Analytics
            </button>
            <button class="dashboard-pill" type="button">
              Export
            </button>
          </div>
        </header>

        <section class="dashboard-stats-grid">
          {dashboardStats.map((stat) => (
            <article class="dashboard-stat-card" key={stat.label}>
              <p class="dashboard-stat-label">{stat.label}</p>
              <h4>{stat.value}</h4>
              <p class="dashboard-stat-copy">{stat.delta}</p>
            </article>
          ))}
        </section>

        <section class="dashboard-content-grid">
          <article class="dashboard-chart-card">
            <div class="dashboard-chart-head">
              <div>
                <p class="dashboard-section-label">Revenue</p>
                <h4>$84,240.00</h4>
              </div>
              <span class="dashboard-chart-chip">+12.4%</span>
            </div>
            <svg class="dashboard-chart" viewBox="0 0 640 280" role="img" aria-label="Revenue chart">
              <path d="M40 210 L130 168 L220 184 L310 112 L400 130 L490 72 L580 104 L580 240 L40 240 Z" fill="rgba(15, 23, 42, 0.08)" />
              <path d="M40 210 L130 168 L220 184 L310 112 L400 130 L490 72 L580 104" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <g class="dashboard-chart-guides">
                <line x1="40" y1="80" x2="580" y2="80" />
                <line x1="40" y1="140" x2="580" y2="140" />
                <line x1="40" y1="200" x2="580" y2="200" />
              </g>
            </svg>
          </article>

          <article class="dashboard-table-card">
            <div class="dashboard-chart-head">
              <div>
                <p class="dashboard-section-label">Recent Sales</p>
                <h4>5 recent conversions</h4>
              </div>
            </div>
            <div class="dashboard-sales-list">
              {[
                ["Olivia Martin", "$1,999.00", "+42%"],
                ["Jackson Lee", "$39.00", "+18%"],
                ["Isabella Nguyen", "$299.00", "+27%"],
                ["William Kim", "$99.00", "+9%"],
                ["Sofia Davis", "$39.00", "+14%"],
              ].map((row) => (
                <div class="dashboard-sale-row" key={row[0]}>
                  <div>
                    <strong>{row[0]}</strong>
                    <p>{row[2]} this week</p>
                  </div>
                  <span>{row[1]}</span>
                </div>
              ))}
            </div>
          </article>
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
              onInput$={(event: InputEvent) => {
                const target = event.currentTarget
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
        <div>
          <p class="dashboard-section-label">Prompting</p>
          <h3>Playground</h3>
        </div>
        <div class="playground-actions">
          <button class="playground-ghost-button" type="button">View Code</button>
          <button class="playground-ghost-button" type="button">Share</button>
          <button class="playground-primary-button" type="button">Save</button>
        </div>
      </header>

      <div class="playground-shell">
        <section class="playground-panel">
          <div class="playground-mode-row" role="tablist" aria-label="Playground modes">
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
                {entry[1]}
              </button>
            ))}
          </div>

          <div class="playground-editor-grid">
            {mode === "complete" ? (
              <>
                <div class="playground-textarea playground-copy-surface">{preset}</div>
                <div class="playground-output-card">
                  <p class="dashboard-section-label">Output</p>
                  <h4>Draft response</h4>
                  <p>Turn curious visitors into loyal customers with crisp, delightful copy tuned for product launches.</p>
                </div>
              </>
            ) : mode === "insert" ? (
              <>
                <div class="playground-textarea playground-copy-surface">We&apos;re writing to [company]. Congrats from OpenAI!</div>
                <div class="playground-output-card playground-output-muted">
                  <p class="dashboard-section-label">Insertion Preview</p>
                  <p>Open the final response preview here after selecting an insertion target.</p>
                </div>
              </>
            ) : (
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
                <div class="playground-output-card">
                  <p class="dashboard-section-label">Edited Response</p>
                  <p>We are going to the market.</p>
                </div>
              </>
            )}
          </div>

          <div class="playground-submit-row">
            <button class="playground-primary-button" type="button">Submit</button>
            <button class="playground-ghost-button" type="button">Reset</button>
          </div>
        </section>

        <aside class="playground-sidebar-panel">
          <section class="playground-field">
            <span>Preset</span>
            <div class="playground-option-group">
              {playgroundPresets.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  data-preset={entry}
                  class={preset === entry ? "playground-option-button playground-option-button-active" : "playground-option-button"}
                  aria-pressed={preset === entry}
                  onClick$={(event: MouseEvent) => {
                    const target = event.currentTarget
                    if (!(target instanceof HTMLButtonElement)) {
                      return
                    }

                    const nextPreset = target.dataset.preset
                    if (!nextPreset) {
                      return
                    }

                    preset = nextPreset
                  }}
                >
                  {entry}
                </button>
              ))}
            </div>
          </section>

          <section class="playground-field">
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

          <div class="playground-selection-summary">
            <p class="slug">Preset: {preset}</p>
            <p class="slug">Model: {model}</p>
          </div>

          <label class="playground-field">
            <span>Temperature</span>
            <input type="range" min="0" max="100" value="56" />
          </label>

          <label class="playground-field">
            <span>Max Length</span>
            <input type="range" min="64" max="512" value="256" />
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
