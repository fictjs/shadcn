import { expect, test, type Page } from "@playwright/test"

async function waitForClientReady(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true")
}

test.describe("shadcn v4 site", () => {
  test("routes use shadcn/ui page titles", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle("The Foundation for your Design System - shadcn/ui")

    await page.goto("/docs")
    await expect(page).toHaveTitle("Introduction - shadcn/ui")

    await page.goto("/blocks")
    await expect(page).toHaveTitle("Building Blocks for the Web - shadcn/ui")

    await page.goto("/themes")
    await expect(page).toHaveTitle("Pick a Color. Make it yours. - shadcn/ui")

    await page.goto("/create")
    await expect(page).toHaveTitle("New Project - shadcn/ui")
  })

  test("examples root keeps catalog controls while detail routes stay focused", async ({ page }) => {
    await page.goto("/examples")

    await expect(page.getByLabel("Filter examples")).toBeVisible()
    await expect(page.locator(".pill-grid .pill-item").first()).toBeVisible()
    await expect(page.getByRole("link", { name: "RTL New" })).toBeVisible()

    await page.goto("/examples/dashboard")

    await expect(page.locator(".example-showcase-surface")).toBeVisible()
    await expect(page.getByRole("navigation", { name: "Examples navigation" }).getByRole("link", { name: "Examples" })).toHaveAttribute("href", "/")
    await expect(page.getByLabel("Filter examples")).toHaveCount(0)
    await expect(page.locator(".pill-grid .pill-item")).toHaveCount(0)
    await expect(page.locator(".example-mobile-gallery figcaption")).toHaveCount(0)
    await expect(page.locator(".example-detail-card")).not.toContainText("Prompt playground interface")
  })

  test("home and docs routes render expected chrome", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { name: "The Foundation for your Design System" })).toBeVisible()
    await expect(page.getByRole("navigation", { name: "Primary" })).toContainText("Docs")
    await expect(page.getByRole("link", { name: "shadcn/skills, presets and more" })).toHaveAttribute(
      "href",
      "/docs/changelog/2026-03-cli-v4"
    )
    await expect(page.getByRole("main").getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/docs/installation",
    )
    await expect(page.locator("body")).toHaveAttribute("data-active-theme", "neutral")
    await expect(page.locator("#theme-selector")).toHaveValue("neutral")
    await expect(
      page.locator('[data-select-trigger][aria-label="Theme selector"]'),
    ).toContainText("Neutral")
    await expect(page.getByRole("link", { name: "RTL New" })).toBeVisible()
    await expect(page.locator(".home-examples-root .examples-root-grid")).toBeVisible()
    await expect(page.locator(".home-examples-root")).toContainText("Payment Method")
    await expect(page.locator(".home-examples-root")).toContainText("Two-factor authentication")
    await expect(page.locator(".home-examples-root")).toContainText("Enable")
    await expect(page.locator(".home-examples-root")).toContainText("Your profile has been verified.")
    await expect(page.locator(".home-examples-root")).toContainText("Invite Members")
    await expect(page.locator(".root-section-separator")).toContainText("Appearance Settings")
    await expect(page.locator(".home-examples-root")).toContainText("Compute Environment")
    await expect(page.locator(".home-examples-root")).toContainText("How did you hear about us?")
    await expect(page.locator(".home-examples-root")).toContainText("Processing your request")
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "shadcn" })).toHaveAttribute(
      "href",
      "https://twitter.com/shadcn",
    )

    await page.goto("/docs")

    await expect(page.locator(".doc-header-row > h1")).toContainText("Introduction")
    await expect(page.getByRole("button", { name: "Copy Page" })).toBeVisible()
  })

  test("desktop header matches upstream shadcn chrome", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto("/")

    const primaryNav = page.getByRole("navigation", { name: "Primary" })
    await expect(primaryNav).toBeVisible()
    await expect(primaryNav.getByRole("link")).toHaveText([
      "Docs",
      "Components",
      "Blocks",
      "Charts",
      "Directory",
      "Create",
    ])

    await expect(page.getByRole("button", { name: "Search documentation..." })).toBeVisible()
    await expect(page.getByRole("link", { name: "108k" })).toHaveAttribute("href", "https://github.com/shadcn-ui/ui")
    await expect(page.getByRole("button", { name: "Toggle layout" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Toggle theme" })).toBeVisible()
    await expect(page.getByRole("banner").getByRole("link", { name: "New Project" })).toHaveAttribute("href", "/create")
  })

  test("layout toggle switches between full and fixed containers", async ({ page }) => {
    await page.setViewportSize({ width: 1800, height: 1000 })
    await page.goto("/")

    const html = page.locator("html")
    const mainContainer = page.locator(".home-preview-shell")
    const layoutToggle = page.getByRole("button", { name: "Toggle layout" })

    await expect(layoutToggle).toBeVisible()
    await expect(html).toHaveAttribute("data-layout", "full")
    const fullWidth = await mainContainer.evaluate((element) => element.getBoundingClientRect().width)

    await layoutToggle.click()

    await expect(html).toHaveAttribute("data-layout", "fixed")
    await expect(html).toHaveClass(/layout-fixed/)
    const fixedWidth = await mainContainer.evaluate((element) => element.getBoundingClientRect().width)
    expect(fixedWidth).toBeLessThan(fullWidth - 150)

    await page.reload()
    await expect(html).toHaveAttribute("data-layout", "fixed")
    const persistedWidth = await mainContainer.evaluate((element) => element.getBoundingClientRect().width)
    expect(Math.round(persistedWidth)).toBe(Math.round(fixedWidth))
  })

  test("header search opens a command-style route picker", async ({ page }) => {
    await page.goto("/")

    await page.getByRole("button", { name: "Search documentation..." }).click()

    await expect(page.getByRole("dialog", { name: "Search documentation..." })).toBeVisible()
    await page.locator("#site-search-input").fill("tasks")
    await expect(page.locator(".site-search-result")).toContainText("Tasks")

    await page.getByRole("link", { name: /Tasks/ }).click()

    await expect(page).toHaveURL(/\/examples\/tasks$/)
    await expect(page.getByPlaceholder("Filter tasks...")).toBeVisible()
  })

  test("mobile header opens a dedicated menu overlay", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")

    await expect(page.getByRole("button", { name: "Toggle menu" })).toBeVisible()
    await page.getByRole("button", { name: "Toggle menu" }).click()

    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible()
    await page.getByRole("link", { name: "Installation" }).click()

    await expect(page).toHaveURL(/\/docs\/installation$/)
    await expect(page.locator(".doc-header-row > h1")).toContainText("Installation")
  })

  test("mode toggle switches site theme and preview assets", async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 900 })
    await page.goto("/")

    const modeToggle = page.getByRole("button", { name: "Toggle theme" })
    await expect(page.locator("html")).not.toHaveClass(/dark/)
    await expect(page.locator(".home-mobile-preview-card .color-mode-image-light")).toBeVisible()
    await expect(page.locator(".home-mobile-preview-card .color-mode-image-dark")).toBeHidden()

    await modeToggle.click()

    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(page.locator(".home-mobile-preview-card .color-mode-image-light")).toBeHidden()
    await expect(page.locator(".home-mobile-preview-card .color-mode-image-dark")).toBeVisible()

    await page.goto("/themes")

    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(page.locator(".theme-preview-stage")).toBeVisible()
    await expect(page.locator(".theme-cards-demo")).toContainText("Payments")
  })

  test("mode shortcut toggles theme outside editable inputs only", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("html")).not.toHaveClass(/dark/)
    await page.keyboard.press("d")
    await expect(page.locator("html")).toHaveClass(/dark/)

    await page.getByRole("button", { name: "Search documentation..." }).click()
    await page.locator("#site-search-input").press("d")
    await expect(page.locator("html")).toHaveClass(/dark/)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog", { name: "Search documentation..." })).toHaveCount(0)
    await page.keyboard.press("d")
    await expect(page.locator("html")).not.toHaveClass(/dark/)
  })

  test("docs pages normalize mdx component blocks into readable content", async ({ page }) => {
    await page.goto("/docs/mcp")

    await expect(page.getByRole("heading", { name: "MCP Server" })).toBeVisible()
    await expect(page.locator(".doc-body")).toContainText("Claude Code")
    await expect(page.locator(".doc-body")).not.toContainText("<TabsContent")
    await expect(page.locator(".doc-body")).not.toContainText("<Callout")
  })

  test("docs pages render structured tabs and registry cards", async ({ page }) => {
    await page.goto("/docs/components/base/avatar")

    await expect(page.locator(".doc-tabs")).toBeVisible()
    await expect(page.locator(".doc-component-card").first()).toBeVisible()
    await expect(page.locator(".doc-component-preview-stage").first()).toBeVisible()
    await page.getByRole("button", { name: "Manual" }).click()
    await expect(page.locator(".doc-tabs-panel")).toContainText("Install the following dependencies")
    await expect(page.locator(".doc-component-card-source .doc-component-source-code").first()).toContainText("Avatar")
  })

  test("dashboard example renders as a live desktop stage", async ({ page }) => {
    await page.goto("/examples/dashboard")

    await expect(page.locator(".example-live-stage .dashboard-example")).toBeVisible()
    await expect(page.locator(".dashboard-stat-card")).toHaveCount(4)
    await expect(page.locator(".example-mobile-gallery")).toBeHidden()
    await expect(page.locator(".dashboard-site-header")).toContainText("Documents")
    await expect(page.getByRole("button", { name: "Quick Create" })).toBeVisible()
    await expect(page.locator(".dashboard-chart-card")).toContainText("Total Visitors")
    await expect(page.locator(".dashboard-data-table")).toBeVisible()
    await expect(page.locator(".dashboard-data-table tbody tr")).toHaveCount(10)
    await expect(page.locator(".dashboard-table-footer")).toContainText("0 of 68 row(s) selected.")
  })

  test("tasks example mirrors the shadcn data table", async ({ page }) => {
    await page.goto("/examples/tasks")

    await expect(page.locator(".example-live-stage .tasks-example")).toBeVisible()
    await expect(page.getByPlaceholder("Filter tasks...")).toBeVisible()
    await expect(page.getByRole("button", { name: "Add Task" })).toBeVisible()
    await expect(page.locator(".tasks-data-table tbody tr")).toHaveCount(25)
    await expect(page.locator(".tasks-pagination")).toContainText("0 of 100 row(s) selected.")
  })

  test("charts route renders styled preview cards instead of placeholders", async ({ page }) => {
    await page.goto("/charts/area")

    await expect(page.getByRole("heading", { name: "Beautiful Charts & Graphs" })).toBeVisible()
    await expect(page.locator('.chart-display-card[data-full-width="true"]').first()).toBeVisible()
    await expect(page.locator(".chart-display-card .chart-preview-stage").first()).toBeVisible()
    await expect(page.locator(".chart-display-card .chart-preview-svg").first()).toBeVisible()
    await expect(page.locator(".chart-frame-placeholder")).toHaveCount(0)
  })

  test("blocks route renders featured preview displays instead of text lists", async ({ page }) => {
    await page.goto("/blocks")

    await expect(page.getByRole("heading", { name: "Building Blocks for the Web" })).toBeVisible()
    await expect(page.locator(".block-display-card").first()).toBeVisible()
    await expect(page.locator(".block-display-card .block-preview-stage").first()).toBeVisible()
    await expect(page.locator(".block-display-card .block-preview-image").first()).toBeVisible()
  })

  test("dashboard example switches views and chart ranges without duplicating lists", async ({
    page,
  }) => {
    await page.goto("/examples/dashboard")
    await waitForClientReady(page)

    const tabs = page.locator(".dashboard-tabs-trigger")
    const ranges = page.locator(".dashboard-range-item")
    await expect(tabs).toHaveCount(4)
    await expect(ranges).toHaveCount(3)

    await tabs.nth(1).click()
    // Resuming the scope must reconcile the server-rendered list, not append a
    // second copy of it.
    await expect(tabs).toHaveCount(4)
    await expect(tabs.nth(1)).toHaveAttribute("data-state", "active")
    await expect(tabs.nth(0)).toHaveAttribute("data-state", "inactive")
    await expect(page.locator(".dashboard-outline-placeholder")).toBeVisible()

    await page.locator('.dashboard-range-item[data-range="90d"]').click()
    await expect(ranges).toHaveCount(3)
    await expect(page.locator('.dashboard-range-item[data-range="90d"]')).toHaveAttribute(
      "data-state",
      "on",
    )
    await expect(page.locator(".dashboard-chart-ticks text").first()).toBeVisible()
  })

  test("dashboard compact layout uses the React responsive controls", async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 900 })
    await page.goto("/examples/dashboard")

    const viewSelector = page.getByLabel("View", { exact: true })
    await expect(page.locator(".example-live-stage")).toBeVisible()
    await expect(viewSelector).toBeVisible()
    await expect(page.locator(".dashboard-tabs-list")).toBeHidden()
    const statColumns = await page.locator(".dashboard-stats-grid").evaluate((element) => {
      return getComputedStyle(element).gridTemplateColumns.split(" ").length
    })
    expect(statColumns).toBe(2)

    await expect(page.getByLabel("Go to first page")).toBeHidden()
    await expect(page.getByLabel("Go to previous page")).toBeVisible()
    await expect(page.getByLabel("Go to next page")).toBeVisible()
    await expect(page.getByLabel("Go to last page")).toBeHidden()
    await expect(page.locator(".dashboard-rows-per-page")).toBeHidden()

    await viewSelector.selectOption("key-personnel")
    await expect(page.locator('.dashboard-outline-placeholder[aria-label="key personnel"]')).toBeVisible()
  })

  test("dashboard table selection and pagination match the React example", async ({ page }) => {
    await page.goto("/examples/dashboard")
    await waitForClientReady(page)

    const rows = page.locator(".dashboard-data-table tbody tr")
    const selection = page.locator(".dashboard-table-selection")
    const pagination = page.locator(".dashboard-table-pagination")

    await expect(rows).toHaveCount(10)
    await rows.first().getByRole("checkbox").check()
    await expect(selection).toHaveText("1 of 68 row(s) selected.")

    await page.getByRole("checkbox", { name: "Select all" }).check()
    await expect(selection).toHaveText("10 of 68 row(s) selected.")
    await expect(rows.first()).toHaveAttribute("data-state", "selected")

    await page.getByRole("button", { name: "Go to next page" }).click()
    await expect(pagination).toContainText("Page 2 of 7")
    await expect(rows.first()).toContainText("Adaptive Communication Protocols")
    await expect(selection).toHaveText("10 of 68 row(s) selected.")

    await rows.first().getByRole("checkbox").check()
    await expect(selection).toHaveText("11 of 68 row(s) selected.")

    await page.getByLabel("Rows per page").selectOption("20")
    await expect(rows).toHaveCount(20)
    await expect(pagination).toContainText("Page 1 of 4")

    await page.getByRole("button", { name: "Go to last page" }).click()
    await expect(rows).toHaveCount(8)
    await expect(pagination).toContainText("Page 4 of 4")
    await expect(page.getByRole("button", { name: "Go to next page" })).toBeDisabled()

    await page.getByRole("button", { name: "Go to first page" }).click()
    await expect(pagination).toContainText("Page 1 of 4")
    await expect(page.getByRole("button", { name: "Go to previous page" })).toBeDisabled()
  })

  test("dashboard column visibility menu controls the live table", async ({ page }) => {
    await page.goto("/examples/dashboard")
    await waitForClientReady(page)

    await page.getByRole("button", { name: "Customize Columns" }).click()
    const menu = page.getByRole("menu", { name: "Customize columns" })
    const reviewerItem = menu.getByRole("menuitemcheckbox", { name: "reviewer" })
    await expect(menu).toBeVisible()
    await expect(reviewerItem).toHaveAttribute("aria-checked", "true")

    await reviewerItem.click()
    await expect(reviewerItem).toHaveAttribute("aria-checked", "false")
    await expect(page.locator('th[data-dashboard-column="reviewer"]')).toBeHidden()
    await expect(page.locator('td[data-dashboard-column="reviewer"]')).toHaveCount(10)
    await expect(page.locator('td[data-dashboard-column="reviewer"]').first()).toBeHidden()

    await page.getByRole("button", { name: "Go to next page" }).click()
    await expect(page.locator('th[data-dashboard-column="reviewer"]')).toBeHidden()

    await page.getByRole("button", { name: "Customize Columns" }).click()
    await expect(reviewerItem).toHaveAttribute("aria-checked", "false")
    await reviewerItem.click()
    await expect(page.locator('th[data-dashboard-column="reviewer"]')).toBeVisible()
  })

  test("dashboard document, user, and row action menus match React", async ({ page }) => {
    await page.goto("/examples/dashboard")
    await waitForClientReady(page)

    await page.getByRole("button", { name: "More options for Data Library" }).click()
    const documentMenu = page.getByRole("menu", { name: "Data Library actions" })
    await expect(documentMenu).toBeVisible()
    await expect(documentMenu.getByRole("menuitem")).toHaveText(["Open", "Share", "Delete"])
    await page.keyboard.press("Escape")
    await expect(documentMenu).toBeHidden()

    await page.getByRole("button", { name: "Open user menu" }).click()
    const userMenu = page.getByRole("menu", { name: "User menu" })
    await expect(userMenu).toBeVisible()
    await expect(userMenu.getByRole("menuitem")).toHaveText([
      "Account",
      "Billing",
      "Notifications",
      "Log out",
    ])
    await userMenu.getByRole("menuitem", { name: "Account" }).click()
    await expect(userMenu).toBeHidden()

    await page.getByRole("button", { name: "Open menu for Cover page" }).click()
    const rowMenu = page.getByRole("menu", { name: "Cover page actions" })
    await expect(rowMenu).toBeVisible()
    await expect(rowMenu.getByRole("menuitem")).toHaveText([
      "Edit",
      "Make a copy",
      "Favorite",
      "Delete",
    ])
    await page.mouse.click(900, 40)
    await expect(rowMenu).toBeHidden()
  })

  test("dashboard reviewer cells expose the React select control", async ({ page }) => {
    await page.goto("/examples/dashboard")

    const reviewer = page.getByLabel("Reviewer for Innovation and Advantages")
    await expect(reviewer).toHaveValue("")
    await expect(reviewer).toContainText("Assign reviewer")

    await reviewer.selectOption("Jamik Tashpulatov")
    await expect(reviewer).toHaveValue("Jamik Tashpulatov")
  })

  test("dashboard row headers open the responsive detail drawer", async ({ page }) => {
    await page.goto("/examples/dashboard")

    const trigger = page.getByRole("button", { name: "Innovation and Advantages", exact: true })
    await trigger.click()

    const drawer = page.getByRole("dialog", { name: "Innovation and Advantages" })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText("Showing total visitors for the last 6 months", { exact: true })).toBeVisible()
    await expect(drawer.getByLabel("Header")).toHaveValue("Innovation and Advantages")
    await expect(drawer.getByLabel("Type")).toHaveValue("Narrative")
    await expect(drawer.getByLabel("Status")).toHaveValue("Done")
    await expect(drawer.getByLabel("Target")).toHaveValue("25")
    await expect(drawer.getByLabel("Limit")).toHaveValue("26")
    await expect(drawer.getByLabel("Reviewer")).toHaveValue("")
    await expect(trigger).toHaveAttribute("aria-expanded", "true")

    await page.keyboard.press("Escape")
    await expect(drawer).toBeHidden()
    await expect(trigger).toBeFocused()

    await trigger.click()
    await drawer.getByRole("button", { name: "Done" }).click()
    await expect(drawer).toBeHidden()
  })

  test("dashboard target and limit forms report their save state", async ({ page }) => {
    await page.goto("/examples/dashboard")

    const target = page.getByLabel("Target for Innovation and Advantages")
    await target.fill("26")
    await target.press("Enter")

    const status = page.getByRole("status")
    await expect(status.getByText("Saving Innovation and Advantages", { exact: true })).toBeVisible()
    await expect(status.getByText("Done", { exact: true })).toBeVisible({ timeout: 2000 })
    await expect(target).toHaveValue("26")
  })

  test("dashboard rows support pointer and keyboard reordering", async ({ page }) => {
    await page.goto("/examples/dashboard")

    const rowHeaders = page.locator("tbody [data-dashboard-drawer-trigger]")
    const dragHandles = page.locator("[data-dashboard-drag-handle]")
    await expect(rowHeaders.nth(0)).toHaveText("Cover page")
    await dragHandles.nth(0).dragTo(dragHandles.nth(2))
    await expect(rowHeaders.nth(0)).toHaveText("Table of contents")
    await expect(rowHeaders.nth(1)).toHaveText("Executive summary")
    await expect(rowHeaders.nth(2)).toHaveText("Cover page")

    await page.getByLabel("Go to next page").click()
    await page.getByLabel("Go to previous page").click()
    await expect(rowHeaders.nth(0)).toHaveText("Table of contents")
    await expect(rowHeaders.nth(2)).toHaveText("Cover page")

    const keyboardHandle = page.locator('[data-dashboard-order-row="2"] [data-dashboard-drag-handle]')
    await keyboardHandle.focus()
    await keyboardHandle.press("Space")
    await expect(keyboardHandle).toHaveAttribute("aria-grabbed", "true")
    await keyboardHandle.press("ArrowDown")
    await keyboardHandle.press("Space")
    await expect(rowHeaders.nth(0)).toHaveText("Executive summary")
    await expect(rowHeaders.nth(1)).toHaveText("Table of contents")
    await expect(keyboardHandle).toHaveAttribute("aria-grabbed", "false")
  })

  test("tasks example renders the faceted toolbar and row metadata", async ({ page }) => {
    await page.goto("/examples/tasks")
    await waitForClientReady(page)

    const toolbar = page.locator(".tasks-toolbar")
    await expect(toolbar.getByRole("button", { name: "Status" })).toBeVisible()
    await expect(toolbar.getByRole("button", { name: "Priority" })).toBeVisible()
    await expect(toolbar.getByRole("button", { name: "View" })).toBeVisible()
    await expect(toolbar.getByRole("button", { name: "Add Task" })).toBeVisible()

    const firstRow = page.locator(".tasks-data-table tbody tr").first()
    await expect(firstRow.locator(".tasks-cell-id")).toHaveText("TASK-8782")
    await expect(firstRow.locator(".tasks-label-badge")).toHaveText("Documentation")
    await expect(firstRow.locator(".tasks-status-cell")).toContainText("In Progress")
    await expect(firstRow.locator(".tasks-meta-icon")).toHaveCount(2)
    await expect(firstRow.locator(".tasks-meta-cell").last()).toContainText("Medium")
  })

  test("tasks title and faceted filters match the React table", async ({ page }) => {
    await page.goto("/examples/tasks")
    await waitForClientReady(page)

    const rows = page.locator(".tasks-data-table tbody [data-task-row]")
    const selection = page.locator("[data-tasks-selection]")
    const reset = page.locator("[data-tasks-reset]")

    await page.getByPlaceholder("Filter tasks...").fill("open-source SSD pixel")
    await expect(rows).toHaveCount(1)
    await expect(rows.first().locator(".tasks-cell-id")).toHaveText("TASK-8782")
    await expect(selection).toHaveText("0 of 1 row(s) selected.")
    await expect(reset).toBeVisible()

    await reset.click()
    await expect(rows).toHaveCount(25)
    await expect(selection).toHaveText("0 of 100 row(s) selected.")

    await page.locator('[data-task-facet="status"] [data-menu-trigger]').click()
    const statusFilters = page.getByRole("dialog", { name: "Status filters" })
    await statusFilters.locator('[data-task-facet-option="done"]').click()
    await expect(rows).toHaveCount(19)
    await expect(selection).toHaveText("0 of 19 row(s) selected.")
    await expect(statusFilters).toBeVisible()
    await expect(page.locator('[data-task-facet="status"] [data-task-facet-summary-wide]')).toContainText("Done")

    await page.locator('[data-task-facet="priority"] [data-menu-trigger]').click()
    const priorityFilters = page.getByRole("dialog", { name: "Priority filters" })
    await priorityFilters.locator('[data-task-facet-option="high"]').click()
    await expect(rows).toHaveCount(7)
    await expect(selection).toHaveText("0 of 7 row(s) selected.")

    await reset.click()
    await expect(rows).toHaveCount(25)
    await expect(selection).toHaveText("0 of 100 row(s) selected.")
    await expect(reset).toBeHidden()
  })

  test("tasks selection and pagination match the React table", async ({ page }) => {
    await page.goto("/examples/tasks")
    await waitForClientReady(page)

    const rows = page.locator(".tasks-data-table tbody [data-task-row]")
    const selection = page.locator("[data-tasks-selection]")
    const pageLabel = page.locator("[data-tasks-page-label]")
    const selectAll = page.getByRole("checkbox", { name: "Select all" })

    await rows.first().getByRole("checkbox").check()
    await expect(selection).toHaveText("1 of 100 row(s) selected.")
    await selectAll.check()
    await expect(selection).toHaveText("25 of 100 row(s) selected.")
    await expect(rows.first()).toHaveAttribute("data-state", "selected")

    await page.getByLabel("Go to next page").click()
    await expect(pageLabel).toHaveText("Page 2 of 4")
    await expect(rows).toHaveCount(25)
    await expect(rows.first().locator(".tasks-cell-id")).toHaveText("TASK-6274")
    await selectAll.check()
    await expect(selection).toHaveText("50 of 100 row(s) selected.")

    await page.getByLabel("Rows per page").selectOption("10")
    await expect(pageLabel).toHaveText("Page 1 of 10")
    await expect(rows).toHaveCount(10)
    await expect(selectAll).toBeChecked()

    await page.getByLabel("Go to last page").click()
    await expect(pageLabel).toHaveText("Page 10 of 10")
    await expect(rows).toHaveCount(10)
    await expect(selectAll).not.toBeChecked()
    await expect(selection).toHaveText("50 of 100 row(s) selected.")
  })

  test("tasks sortable column menus control order and visibility", async ({ page }) => {
    await page.goto("/examples/tasks")
    await waitForClientReady(page)

    const titleMenu = page.locator('[data-task-sort-menu="title"]')
    const titleTrigger = titleMenu.locator("[data-menu-trigger]")
    const titles = page.locator(".tasks-data-table tbody [data-task-row] .tasks-title-text")
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })

    await titleTrigger.click()
    await titleMenu.getByRole("menuitem", { name: "Asc" }).click()
    const ascending = await titles.allTextContents()
    expect(ascending).toEqual([...ascending].sort((left, right) => collator.compare(left, right)))
    await expect(titleTrigger).toHaveAttribute("data-sort-direction", "asc")
    await expect(page.locator('th[data-task-column="title"]')).toHaveAttribute("aria-sort", "ascending")

    await titleTrigger.click()
    await titleMenu.getByRole("menuitem", { name: "Desc" }).click()
    const descending = await titles.allTextContents()
    expect(descending).toEqual([...descending].sort((left, right) => collator.compare(right, left)))
    await expect(titleTrigger).toHaveAttribute("data-sort-direction", "desc")

    const priorityMenu = page.locator('[data-task-sort-menu="priority"]')
    await priorityMenu.locator("[data-menu-trigger]").click()
    await priorityMenu.getByRole("menuitem", { name: "Hide" }).click()
    await expect(page.locator('th[data-task-column="priority"]')).toBeHidden()
    await expect(page.locator('tbody [data-task-row]').first().locator('[data-task-column="priority"]')).toBeHidden()
  })

  test("tasks view menu toggles and restores columns", async ({ page }) => {
    await page.goto("/examples/tasks")
    await waitForClientReady(page)

    const priorityMenu = page.locator('[data-task-sort-menu="priority"]')
    await priorityMenu.locator("[data-menu-trigger]").click()
    await priorityMenu.getByRole("menuitem", { name: "Hide" }).click()

    const viewMenu = page.locator("[data-task-view-menu]")
    await viewMenu.getByRole("button", { name: "View" }).click()
    await expect(viewMenu.getByText("Toggle columns", { exact: true })).toBeVisible()

    const priorityToggle = viewMenu.getByRole("menuitemcheckbox", { name: "priority" })
    await expect(priorityToggle).toHaveAttribute("aria-checked", "false")
    await priorityToggle.click()
    await expect(page.locator('th[data-task-column="priority"]')).toBeVisible()
    await expect(priorityToggle).toHaveAttribute("aria-checked", "true")

    const titleToggle = viewMenu.getByRole("menuitemcheckbox", { name: "title" })
    await titleToggle.click()
    await expect(page.locator('th[data-task-column="title"]')).toBeHidden()
    await expect(titleToggle).toHaveAttribute("aria-checked", "false")
    await titleToggle.click()
    await expect(page.locator('th[data-task-column="title"]')).toBeVisible()
  })

  test("tasks row actions expose labels and preserve the selected label", async ({ page }) => {
    await page.goto("/examples/tasks")
    await waitForClientReady(page)

    const firstRow = page.locator("[data-task-row]").first()
    await firstRow.getByRole("button", { name: /Open menu for TASK-/ }).click()
    const actions = firstRow.getByRole("menu", { name: /TASK-.* actions/ })
    await expect(actions.getByRole("menuitem", { name: "Edit" })).toBeVisible()
    await expect(actions.getByRole("menuitem", { name: "Make a copy" })).toBeVisible()
    await expect(actions.getByRole("menuitem", { name: "Favorite" })).toBeVisible()
    await expect(actions.getByRole("menuitem", { name: "Delete" })).toContainText("⌘⌫")

    await actions.getByRole("menuitem", { name: "Labels" }).hover()
    const labels = firstRow.getByRole("menu", { name: /Labels for TASK-/ })
    await expect(labels).toBeVisible()
    await expect(labels.getByRole("menuitemradio", { name: "Documentation" })).toHaveAttribute("aria-checked", "true")

    await labels.getByRole("menuitemradio", { name: "Bug" }).click()
    await expect(firstRow.locator(".tasks-label-badge")).toHaveText("Bug")

    await firstRow.getByRole("button", { name: /Open menu for TASK-/ }).click()
    await actions.getByRole("menuitem", { name: "Labels" }).hover()
    await expect(labels.getByRole("menuitemradio", { name: "Bug" })).toHaveAttribute("aria-checked", "true")
  })

  test("tasks user menu matches the React account controls", async ({ page }) => {
    await page.goto("/examples/tasks")
    await waitForClientReady(page)

    const trigger = page.getByRole("button", { name: "Open user menu" })
    await expect(trigger.locator("img")).toHaveAttribute("src", "/avatars/03.png")
    await trigger.click()

    const menu = page.getByRole("menu", { name: "User menu" })
    await expect(menu).toContainText("shadcn")
    await expect(menu).toContainText("m@example.com")
    await expect(menu.getByRole("menuitem", { name: "Profile" })).toContainText("⇧⌘P")
    await expect(menu.getByRole("menuitem", { name: "Billing" })).toContainText("⌘B")
    await expect(menu.getByRole("menuitem", { name: "Settings" })).toContainText("⌘S")
    await expect(menu.getByRole("menuitem", { name: "New Team" })).toBeVisible()
    await expect(menu.getByRole("menuitem", { name: "Log out" })).toContainText("⇧⌘Q")

    await menu.getByRole("menuitem", { name: "Profile" }).click()
    await expect(menu).toBeHidden()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  test("tasks responsive controls match the React breakpoints", async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 1100 })
    await page.goto("/examples/tasks")
    await expect(page.locator(".example-mobile-gallery")).toBeVisible()
    await expect(page.locator(".example-live-stage")).toBeHidden()

    await page.setViewportSize({ width: 768, height: 1100 })
    await expect(page.locator(".example-mobile-gallery")).toBeHidden()
    await expect(page.locator(".example-live-stage .tasks-example")).toBeVisible()
    await expect(page.getByPlaceholder("Filter tasks...")).toHaveCSS("width", "150px")
    await expect(page.getByRole("button", { name: "View" })).toBeHidden()
    await expect(page.getByLabel("Go to first page")).toBeHidden()
    await expect(page.getByLabel("Go to previous page")).toBeVisible()

    await page.setViewportSize({ width: 1023, height: 1100 })
    await expect(page.getByPlaceholder("Filter tasks...")).toHaveCSS("width", "150px")
    await expect(page.getByRole("button", { name: "View" })).toBeHidden()
    await expect(page.getByLabel("Go to last page")).toBeHidden()

    await page.setViewportSize({ width: 1024, height: 1100 })
    await expect(page.getByPlaceholder("Filter tasks...")).toHaveCSS("width", "250px")
    await expect(page.getByRole("button", { name: "View" })).toBeVisible()
    await expect(page.getByLabel("Go to first page")).toBeVisible()
    await expect(page.getByLabel("Go to last page")).toBeVisible()
  })

  test("playground example switches modes and updates controls", async ({ page }) => {
    await page.goto("/examples/playground")

    const tabs = page.getByRole("tab")
    const insertTab = page.getByRole("tab", { name: "Insert", exact: true })
    const editTab = page.getByRole("tab", { name: "Edit", exact: true })
    const presetButton = page.getByRole("combobox", { name: "Load a preset..." })

    await expect(tabs).toHaveCount(3)
    await expect(presetButton).toContainText("Load a preset...")

    await presetButton.click()
    const presetDialog = page.getByRole("dialog", { name: "Preset selector" })
    await expect(presetDialog.getByRole("option")).toHaveCount(10)
    await presetDialog.getByPlaceholder("Search presets...").fill("grammatical")
    await expect(presetDialog.locator("[data-playground-preset-option]:visible")).toHaveCount(1)
    await presetDialog.getByRole("option", { name: "Grammatical Standard English" }).click()
    await expect(presetButton).toContainText("Grammatical Standard English")

    await insertTab.click()
    await expect(insertTab).toHaveClass(/playground-tab-active/)
    await expect(page.locator(".playground-surface-pane-muted")).toBeVisible()
    await expect(page.locator('.playground-editor-grid[data-mode="insert"]')).toBeVisible()

    const modelTrigger = page.locator(".playground-model-trigger")
    await expect(modelTrigger).toContainText("gpt-4.1")
    await modelTrigger.click()
    await expect(modelTrigger).toContainText("gpt-4o-mini")

    await editTab.click()
    await expect(page.locator(".playground-edit-stack")).toContainText("Input")
    await expect(page.locator(".playground-edit-stack")).toContainText("Instructions")
  })

  test("themes route renders the customizer shell", async ({ page }) => {
    await page.goto("/themes")

    await expect(page.getByRole("heading", { name: "Pick a Color. Make it yours." })).toBeVisible()
    await expect(page.locator(".theme-customizer-scroll .theme-customizer-pill").first()).toBeVisible()
    await expect(page.getByRole("button", { name: "Copy Code" })).toBeVisible()
    await expect(page.locator(".theme-cards-demo")).toBeVisible()
    await page.locator(".theme-customizer-scroll .theme-customizer-pill", { hasText: "Blue" }).click()
    await expect(page.locator(".theme-preview-stage")).toHaveAttribute("data-theme-name", "blue")
  })

  test("theme copy controls open the upstream code dialog", async ({ page }) => {
    await page.goto("/themes")
    await waitForClientReady(page)

    await page.getByRole("button", { name: "Copy Code" }).click()

    const dialog = page.getByRole("dialog", { name: "neutral" })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText("Copy and paste the following code into your CSS file.")
    await expect(dialog.getByRole("tab")).toHaveText(["OKLCH", "HSL", "Tailwind v3"])
    await expect(dialog.locator(".theme-code-body code")).toContainText("--background: oklch(")

    await dialog.getByRole("tab", { name: "HSL", exact: true }).click()
    await expect(dialog.locator(".theme-code-body code")).toContainText("--background: hsl(")

    await dialog.getByRole("tab", { name: "Tailwind v3" }).click()
    await expect(dialog.locator(".theme-code-body code")).toContainText("@layer base")

    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Copy Code" })).toBeFocused()

    await page.goto("/")
    await page.getByRole("button", { name: "Copy Code" }).click()
    await expect(page.getByRole("dialog", { name: "neutral" })).toBeVisible()
  })

  test("active theme selector drives preview routes and persists across navigation", async ({ page }) => {
    await page.goto("/")
    await waitForClientReady(page)

    await page.locator('[data-select-trigger][aria-label="Theme selector"]').click()
    await page.locator('[data-select-option-value="blue"]').click()
    await expect(page.locator("body")).toHaveAttribute("data-active-theme", "blue")
    await expect(page.locator(".home-preview-shell")).toHaveAttribute("data-theme-name", "blue")

    await page.goto("/examples/dashboard")
    await expect(page.locator("body")).toHaveAttribute("data-active-theme", "blue")
    await expect(page.locator(".route-theme-container")).toHaveAttribute("data-theme-name", "blue")

    await page.goto("/charts/area")
    await expect(page.locator("body")).toHaveAttribute("data-active-theme", "blue")
    await expect(page.locator(".route-theme-container")).toHaveAttribute("data-theme-name", "blue")
    await expect(page.locator(".chart-display-card .chart-accent-dot").first()).toBeVisible()
  })

  test("home showcase controls stay interactive", async ({ page }) => {
    await page.goto("/")
    await waitForClientReady(page)

    const maxThumb = page.locator('[data-slider-thumb="1"]')
    await maxThumb.scrollIntoViewIfNeeded()
    const sliderBox = await page.locator("[data-slider]").boundingBox()
    const thumbBox = await maxThumb.boundingBox()
    expect(sliderBox).not.toBeNull()
    expect(thumbBox).not.toBeNull()

    await page.mouse.move(thumbBox!.x + thumbBox!.width / 2, thumbBox!.y + thumbBox!.height / 2)
    await page.mouse.down()
    await page.mouse.move(sliderBox!.x + sliderBox!.width * 0.5, thumbBox!.y + thumbBox!.height / 2, {
      steps: 8,
    })
    await page.mouse.up()
    await expect(page.locator('[data-slider-output="1"]')).toHaveText("500")

    const gpuInput = page.locator("[data-counter-input]")
    await gpuInput.scrollIntoViewIfNeeded()
    await expect(gpuInput).toHaveValue("8")
    await page.locator('[data-counter-step="1"]').click()
    await expect(gpuInput).toHaveValue("9")
    await page.locator('[data-counter-step="-1"]').click()
    await expect(gpuInput).toHaveValue("8")

    const radioItems = page.locator("[data-radio-item]")
    await expect(radioItems.nth(0)).toHaveAttribute("data-checked", "true")
    await radioItems.nth(1).click()
    await expect(radioItems.nth(0)).toHaveAttribute("data-checked", "false")
    await expect(radioItems.nth(1)).toHaveAttribute("data-checked", "true")

    const voiceToggle = page.locator('[data-toggle="voice"]')
    await voiceToggle.scrollIntoViewIfNeeded()
    await voiceToggle.click()
    await expect(page.locator(".ui-input-group-round input").first()).toHaveAttribute(
      "placeholder",
      "Record and send audio...",
    )
  })

  test("home showcase menus and popovers open on demand", async ({ page }) => {
    await page.goto("/")
    await waitForClientReady(page)

    const moreOptions = page.getByRole("button", { name: "More Options" })
    await moreOptions.scrollIntoViewIfNeeded()
    await moreOptions.click()
    await expect(page.locator(".root-actions-menu")).toBeVisible()

    await page.getByRole("menuitem", { name: "Label As..." }).click()
    await expect(page.locator(".root-actions-menu .ui-menu-sub [data-menu-panel]")).toBeVisible()
    await page.getByRole("menuitemradio", { name: "Work" }).click()
    await expect(page.locator(".root-actions-menu")).toBeHidden()

    const sources = page.getByRole("button", { name: "All Sources" })
    await sources.scrollIntoViewIfNeeded()
    await sources.click()
    await expect(page.locator(".root-sources-menu")).toBeVisible()
    await page.locator('.root-sources-menu .ui-menu-sub [data-menu-trigger]').click()
    await expect(page.locator(".root-knowledge-menu")).toBeVisible()
    await expect(page.locator(".root-sources-menu")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.locator(".root-sources-menu")).toBeHidden()

    const addContext = page.getByRole("button", { name: "Add context" })
    await addContext.scrollIntoViewIfNeeded()
    await addContext.click()
    await page.locator(".root-mention-popover [data-mention-search]").fill("dash")
    await expect(
      page.locator(".root-mention-popover [data-mention-item]:not([hidden])"),
    ).toHaveCount(1)
    await page.locator(".root-mention-popover [data-mention-item]:not([hidden])").click()
    await expect(page.locator("[data-mention-chip]")).toHaveCount(1)
    await page.locator("[data-mention-chip]").click()
    await expect(page.locator("[data-mention-chip]")).toHaveCount(0)
  })

  test("colors route renders the wrapped palette grid", async ({ page }) => {
    await page.goto("/colors")

    await expect(page.getByRole("heading", { name: "Tailwind Colors in Every Format" })).toBeVisible()
    await expect(page.locator(".colors-route-grid .color-palette").first()).toBeVisible()
    await expect(page.locator(".colors-route-grid")).toContainText("amber")

    await page.locator("[data-select-trigger]").first().click()
    await page.locator('[data-select-option-value="hsl"]').first().click()
    await expect(page.locator(".colors-route-grid")).toHaveAttribute("data-color-format", "hsl")
    await expect(page.locator("[data-select-native]").nth(1)).toHaveValue("hsl")
    await expect(page.locator("[data-select-trigger]").nth(1)).toContainText("hsl")
  })

  test("authentication and rtl examples stay interactive", async ({ page }) => {
    await page.goto("/examples/authentication")

    await expect(page.locator(".auth-login-link")).toContainText("Login")
    await expect(page.locator(".auth-form-shell h3")).toContainText("Create an account")
    await expect(page.locator(".auth-provider-button")).toHaveCount(1)
    await expect(page.locator(".auth-provider-button")).toContainText("GitHub")
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign In with Email" })).toBeVisible()

    await page.goto("/examples/rtl")

    await expect(page.locator(".rtl-preview-frame")).toHaveAttribute("dir", "rtl")
    await page.getByRole("button", { name: "LTR" }).click()
    await expect(page.locator(".rtl-preview-frame")).toHaveAttribute("dir", "ltr")
    await expect(page.locator(".rtl-stat-card")).toHaveCount(3)
  })

  test("create route builds a live starter workspace", async ({ page }) => {
    await page.goto("/create")

    await expect(page.getByRole("heading", { name: "Customize everything." })).toBeVisible()
    await expect(page.getByLabel("Search items")).toBeVisible()
    await expect(page.locator(".create-command-code")).toContainText("--template next")
    await expect(page.locator(".create-command-code")).toContainText("--base radix")

    await page.locator(".create-kind-pills").getByRole("button", { name: "Examples" }).click()
    await page.getByLabel("Search items").fill("task")
    await expect(page.locator(".create-explorer-list")).toContainText("Tasks Example")
    await expect(page.locator(".create-explorer-list .create-item-button")).toHaveCount(1)

    await page.locator(".create-explorer-list").getByRole("button", { name: /Tasks/ }).click()
    await expect(page.locator(".create-preview-stage .tasks-example")).toBeVisible()

    await page.getByRole("button", { name: "Base UI" }).click()
    await page.getByRole("button", { name: "Vite" }).click()
    await expect(page.locator(".create-command-code")).toContainText("--template vite")
    await expect(page.locator(".create-command-code")).toContainText("--base base")
  })
})
