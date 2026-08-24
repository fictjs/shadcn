import { expect, test, type Locator, type Page } from "@playwright/test"

async function waitForClientReady(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true")
}

async function expectDashboardChromeStable(page: Page) {
  const toolbar = page.locator(".dashboard-table-toolbar")
  const tabs = page.locator(".dashboard-tabs-trigger")

  await expect(toolbar.locator("svg")).toHaveCount(4)
  await expect(tabs).toHaveCount(4)
  await expect(tabs.nth(0).locator(".dashboard-tab-badge")).toHaveCount(0)
  await expect(tabs.nth(1).locator(".dashboard-tab-badge")).toHaveText("3")
  await expect(tabs.nth(2).locator(".dashboard-tab-badge")).toHaveText("2")
  await expect(tabs.nth(3).locator(".dashboard-tab-badge")).toHaveCount(0)
  await expect(page.locator("[data-dashboard-view-panel]")).toHaveCount(1)
  await expect(page.locator("svg.dashboard-chart")).toHaveCount(1)
}

async function expectFocusRing(control: Locator, ringTarget: Locator = control) {
  await control.scrollIntoViewIfNeeded()
  await control.focus()
  await control.page().keyboard.press("Shift+Tab")
  await control.page().keyboard.press("Tab")
  await expect(control).toBeFocused()
  await expect.poll(async () => ringTarget.evaluate((element) => {
    const probe = document.createElement("span")
    probe.style.color = "var(--ring)"
    document.body.append(probe)
    const ringColor = getComputedStyle(probe).color
    probe.remove()

    const style = getComputedStyle(element)
    return {
      borderUsesRingColor: style.borderColor === ringColor,
      hasThreePixelRing: style.boxShadow.includes("0px 0px 0px 3px"),
      outlineStyle: style.outlineStyle,
    }
  })).toEqual({
    borderUsesRingColor: true,
    hasThreePixelRing: true,
    outlineStyle: "none",
  })
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
    const panels = page.locator("[data-dashboard-view-panel]")
    const viewValues = ["outline", "past-performance", "key-personnel", "focus-documents"]
    await expect(tabs).toHaveCount(4)
    await expect(ranges).toHaveCount(3)
    await expect(panels).toHaveCount(1)
    await expect(panels).toHaveAttribute("data-dashboard-view-panel", "outline")

    for (const index of [1, 2, 3, 1, 0, 1]) {
      await tabs.nth(index).click()
      await expect(tabs).toHaveCount(4)
      await expect(panels).toHaveCount(1)
      await expect(page.locator('.dashboard-tabs-trigger[data-state="active"]')).toHaveCount(1)
      await expect(tabs.nth(index)).toHaveAttribute("data-state", "active")
      await expect(panels).toHaveAttribute("data-dashboard-view-panel", viewValues[index])
      await expect(panels).toBeVisible()
      await expect(page.locator(".dashboard-data-table")).toHaveCount(index === 0 ? 1 : 0)
      await expect(page.locator(".dashboard-outline-placeholder")).toHaveCount(index === 0 ? 0 : 1)
    }
    await expect(page.locator('.dashboard-outline-placeholder[aria-label="past performance"]')).toBeVisible()
    await expect(page.locator(".dashboard-data-table")).toHaveCount(0)

    await tabs.nth(1).focus()
    await tabs.nth(1).press("ArrowRight")
    await expect(tabs.nth(2)).toBeFocused()
    await expect(tabs.nth(2)).toHaveAttribute("data-state", "active")
    await expect(tabs.nth(2)).toHaveAttribute("tabindex", "0")
    await tabs.nth(2).press("End")
    await expect(tabs.nth(3)).toBeFocused()
    await expect(tabs.nth(3)).toHaveAttribute("data-state", "active")
    await tabs.nth(3).press("Home")
    await expect(tabs.nth(0)).toBeFocused()
    await expect(tabs.nth(0)).toHaveAttribute("data-state", "active")
    await expect(page.locator(".dashboard-data-table")).toHaveCount(1)

    for (const range of ["90d", "30d", "7d", "90d"]) {
      await page.locator(`.dashboard-range-item[data-range="${range}"]`).click()
      await expect(ranges).toHaveCount(3)
      await expect(page.locator(`.dashboard-range-item[data-range="${range}"]`)).toHaveAttribute(
        "data-state",
        "on",
      )
      await expect(page.locator("svg.dashboard-chart")).toHaveCount(1)
      await expect(page.locator(".dashboard-chart-grid")).toHaveCount(1)
      await expect(page.locator(".dashboard-chart-ticks")).toHaveCount(1)
    }
    await expect(page.locator(".dashboard-chart-ticks text").first()).toBeVisible()
  })

  test("dashboard resumes each stateful control without duplicating chrome", async ({ page }) => {
    const cases = [
      {
        run: async () => {
          await page.locator('.dashboard-range-item[data-range="90d"]').click()
          await expect(page.locator('.dashboard-range-item[data-range="90d"]')).toHaveAttribute(
            "data-state",
            "on",
          )
          await expect(page.locator('[data-dashboard-view-panel="outline"]')).toBeVisible()
          await expect(page.locator(".dashboard-data-table")).toHaveCount(1)
        },
      },
      {
        run: async () => {
          await page.getByRole("tab", { name: "Past Performance" }).click()
          await expect(page.locator('[data-dashboard-view-panel="past-performance"]')).toBeVisible()
        },
      },
      {
        run: async () => {
          await page.getByRole("button", { name: "Customize Columns" }).click()
          await page.getByRole("menuitemcheckbox", { name: "reviewer" }).click()
          await expect(page.locator('th[data-dashboard-column="reviewer"]')).toBeHidden()
        },
      },
      {
        run: async () => {
          await page.getByRole("button", { name: "Go to next page" }).click()
          await expect(page.locator(".dashboard-table-pagination")).toContainText("Page 2 of 7")
          await expect(page.locator(".dashboard-data-table tbody tr")).toHaveCount(10)
        },
      },
      {
        run: async () => {
          await page.getByLabel("Rows per page").selectOption("20")
          await expect(page.locator(".dashboard-table-pagination")).toContainText("Page 1 of 4")
          await expect(page.locator(".dashboard-data-table tbody tr")).toHaveCount(20)
        },
      },
    ]

    for (const testCase of cases) {
      await page.goto("/examples/dashboard")
      await waitForClientReady(page)
      await expectDashboardChromeStable(page)
      await testCase.run()
      await expectDashboardChromeStable(page)
    }
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

    await page.getByRole("tab", { name: "Past Performance" }).click()
    await page.getByRole("tab", { name: "Outline", exact: true }).click()
    await expect(rows).toHaveCount(10)
    await expect(rows.first().getByRole("checkbox")).toBeChecked()
    await expect(rows.first()).toHaveAttribute("data-state", "selected")
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
    await expect(page.locator("[data-dashboard-column-toggle]")).toHaveCount(5)
    await expect(reviewerItem).toHaveAttribute("aria-checked", "true")

    await reviewerItem.click()
    await expect(reviewerItem).toHaveAttribute("aria-checked", "false")
    await expect(page.locator('th[data-dashboard-column="reviewer"]')).toBeHidden()
    await expect(page.locator('td[data-dashboard-column="reviewer"]')).toHaveCount(10)
    await expect(page.locator('td[data-dashboard-column="reviewer"]').first()).toBeHidden()

    await page.getByRole("button", { name: "Go to next page" }).click()
    await expect(page.locator('th[data-dashboard-column="reviewer"]')).toBeHidden()

    await page.getByRole("tab", { name: "Past Performance" }).click()
    await page.getByRole("tab", { name: "Outline", exact: true }).click()
    await expect(page.locator('.dashboard-data-table')).toHaveCount(1)
    await expect(page.locator("[data-dashboard-column-toggle]")).toHaveCount(5)
    await expect(page.locator('th[data-dashboard-column="reviewer"]')).toBeHidden()
    await expect(page.locator('td[data-dashboard-column="reviewer"]')).toHaveCount(10)
    await expect(page.locator('td[data-dashboard-column="reviewer"]').first()).toBeHidden()

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
    await waitForClientReady(page)

    const rowHeaders = page.locator("tbody [data-dashboard-drawer-trigger]")
    const dragHandles = page.locator("[data-dashboard-drag-handle]")
    const firstRow = page.locator("[data-dashboard-order-row]").first()
    const secondRow = page.locator("[data-dashboard-order-row]").nth(1)
    await expect(rowHeaders.nth(0)).toHaveText("Cover page")
    await dragHandles.nth(0).scrollIntoViewIfNeeded()

    const handleBox = await dragHandles.nth(0).boundingBox()
    const rowBox = await firstRow.boundingBox()
    expect(handleBox).not.toBeNull()
    expect(rowBox).not.toBeNull()
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    )
    await page.mouse.down()
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2 + 35,
      { steps: 4 },
    )

    await expect(secondRow).toHaveAttribute("data-drag-shifted", "true")
    await expect.poll(async () => secondRow.evaluate((row) => getComputedStyle(row).transform))
      .not.toBe("none")
    await expect.poll(async () => secondRow.evaluate((row) => (
      row.getAnimations().some((animation) => (
        animation instanceof CSSTransition && animation.transitionProperty === "transform"
      ))
    ))).toBe(true)
    await expect(secondRow).not.toHaveAttribute("data-drag-over")
    await expect.poll(async () => secondRow.evaluate((row) => getComputedStyle(row).boxShadow))
      .toBe("none")

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2 + 110,
      { steps: 12 },
    )

    await expect(firstRow).toHaveAttribute("data-dragging", "true")
    await expect(page.locator("[data-dashboard-order-row]").nth(1)).toHaveAttribute(
      "data-drag-shifted",
      "true",
    )
    const draggedRowBox = await firstRow.boundingBox()
    const draggedTransform = await firstRow.evaluate((row) => getComputedStyle(row).transform)
    expect(draggedRowBox).not.toBeNull()
    expect(draggedRowBox!.y - rowBox!.y).toBeGreaterThan(90)
    expect(draggedTransform).not.toBe("none")

    await page.mouse.up()
    await expect(rowHeaders.nth(0)).toHaveText("Table of contents")
    await expect(rowHeaders.nth(1)).toHaveText("Executive summary")
    await expect(rowHeaders.nth(2)).toHaveText("Cover page")

    await page.getByLabel("Go to next page").click()
    await page.getByLabel("Go to previous page").click()
    await expect(rowHeaders.nth(0)).toHaveText("Table of contents")
    await expect(rowHeaders.nth(2)).toHaveText("Cover page")

    await page.getByRole("tab", { name: "Past Performance" }).click()
    await page.getByRole("tab", { name: "Outline", exact: true }).click()
    await expect(rowHeaders).toHaveCount(10)
    await expect(rowHeaders.nth(0)).toHaveText("Table of contents")
    await expect(rowHeaders.nth(2)).toHaveText("Cover page")
    await expect(page.locator("[data-dashboard-order-row]")).toHaveCount(10)
    await expect(page.locator("[data-dashboard-drag-handle]").first()).toHaveAttribute("draggable", "true")

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

    const modelTrigger = page.getByRole("combobox", { name: "Select a model" })
    await expect(modelTrigger).toContainText("text-davinci-003")
    await modelTrigger.click()
    const modelDialog = page.getByRole("dialog", { name: "Model selector" })
    await expect(modelDialog.getByRole("option")).toHaveCount(6)
    await modelDialog.getByPlaceholder("Search Models...").fill("cushman")
    const cushman = modelDialog.getByRole("option", { name: "code-cushman-001" })
    await expect(cushman).toBeVisible()
    await cushman.hover()
    await expect(page.locator("[data-playground-model-peek]")).toContainText("Real-time application")
    await cushman.click()
    await expect(modelTrigger).toContainText("code-cushman-001")

    await editTab.click()
    await expect(page.locator(".playground-edit-stack")).toContainText("Input")
    await expect(page.locator(".playground-edit-stack")).toContainText("Instructions")
  })

  test("playground example matches the React responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 1100 })
    await page.goto("/examples/playground")

    const showcase = page.locator(".example-showcase-surface")
    const liveStage = showcase.locator(".example-live-stage")
    const mobileGallery = showcase.locator(".example-mobile-gallery")
    await expect(mobileGallery).toBeVisible()
    await expect(liveStage).toBeHidden()

    await page.setViewportSize({ width: 768, height: 1100 })
    await expect(mobileGallery).toBeHidden()
    await expect(liveStage).toBeVisible()
    await expect(page.getByRole("heading", { name: "Playground", level: 3 })).toHaveCSS("font-size", "18px")
    await expect(page.getByRole("heading", { name: "Playground", level: 3 })).toHaveCSS("line-height", "28px")
    expect((await page.locator(".playground-header").boundingBox())?.height).toBe(64)
    await expect(page.locator(".playground-shell")).toHaveCSS("padding", "24px 32px")
    await expect(page.locator(".playground-sidebar-panel")).toBeVisible()
    await expect(page.locator("textarea.playground-textarea")).toHaveCSS("min-height", "700px")
    await expect(page.getByRole("button", { name: "Show history" })).not.toContainText("Reset")

    const preset = page.getByRole("combobox", { name: "Load a preset..." })
    expect((await preset.boundingBox())?.width).toBeLessThanOrEqual(200)

    const sliderFields = page.locator(".playground-field[data-slider-scope]")
    await expect(sliderFields).toHaveCount(3)
    for (let index = 0; index < 3; index += 1) {
      expect((await sliderFields.nth(index).boundingBox())?.height).toBe(56)
    }

    await page.getByRole("tab", { name: "Insert", exact: true }).click()
    const insertPanes = page.locator(
      '.playground-editor-grid[data-mode="insert"] > [data-playground-mode-panel]:not([hidden])',
    )
    const narrowFirst = await insertPanes.nth(0).boundingBox()
    const narrowSecond = await insertPanes.nth(1).boundingBox()
    expect(narrowFirst?.height).toBe(300)
    expect(narrowSecond?.height).toBe(300)
    expect(narrowSecond?.y).toBeGreaterThan((narrowFirst?.y ?? 0) + (narrowFirst?.height ?? 0))

    await page.setViewportSize({ width: 1023, height: 1100 })
    expect((await preset.boundingBox())?.width).toBeLessThanOrEqual(200)
    const tabletFirst = await insertPanes.nth(0).boundingBox()
    const tabletSecond = await insertPanes.nth(1).boundingBox()
    expect(tabletSecond?.y).toBeGreaterThan((tabletFirst?.y ?? 0) + (tabletFirst?.height ?? 0))

    await page.setViewportSize({ width: 1024, height: 1100 })
    const desktopFirst = await insertPanes.nth(0).boundingBox()
    const desktopSecond = await insertPanes.nth(1).boundingBox()
    expect(desktopFirst?.height).toBe(700)
    expect(desktopSecond?.height).toBe(700)
    expect(desktopSecond?.x).toBeGreaterThan((desktopFirst?.x ?? 0) + (desktopFirst?.width ?? 0))
    expect(desktopSecond?.y).toBe(desktopFirst?.y)

  })

  test("playground mode changes preserve one set of slider controls", async ({ page }) => {
    await page.goto("/examples/playground")
    await waitForClientReady(page)

    const sliderFields = page.locator(".playground-field[data-slider-scope]")
    const temperature = page.getByRole("slider", { name: "Temperature" })
    await expect(sliderFields).toHaveCount(3)
    await expect(temperature).toHaveCount(1)

    await temperature.press("ArrowRight")
    await expect(temperature).toHaveAttribute("aria-valuenow", "0.7")

    for (const mode of ["Insert", "Edit", "Complete"]) {
      await page.getByRole("tab", { name: mode, exact: true }).click()
      await expect(sliderFields).toHaveCount(3)
      await expect(page.getByRole("slider", { name: "Temperature" })).toHaveCount(1)
      await expect(page.getByRole("slider", { name: "Temperature" })).toHaveAttribute("aria-valuenow", "0.7")
    }

    await page.getByRole("tab", { name: "Complete", exact: true }).press("ArrowRight")
    await expect(page.getByRole("tab", { name: "Insert", exact: true })).toBeFocused()
    await expect(page.getByRole("tab", { name: "Insert", exact: true })).toHaveAttribute("aria-selected", "true")
    await expect(page.locator(".playground-editor-grid")).toHaveAttribute("data-mode", "insert")
    await expect(sliderFields).toHaveCount(3)
    await expect(page.getByRole("slider", { name: "Temperature" })).toHaveAttribute("aria-valuenow", "0.7")
  })

  test("playground save dialog matches the React preset form", async ({ page }) => {
    await page.goto("/examples/playground")
    await waitForClientReady(page)

    const trigger = page.getByRole("button", { name: "Save", exact: true }).first()
    await trigger.click()
    const dialog = page.getByRole("dialog", { name: "Save preset" })
    await expect(dialog).toContainText("This will save the current playground state as a preset")
    await expect(dialog.getByLabel("Name")).toBeFocused()
    await dialog.getByLabel("Name").fill("My preset")
    await dialog.getByLabel("Description").fill("A reusable prompt")
    await expect(dialog.getByRole("button", { name: "Save", exact: true })).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()

    await trigger.click()
    await dialog.getByRole("button", { name: "Close" }).click()
    await expect(dialog).toBeHidden()
  })

  test("playground code dialog matches the React integration example", async ({ page }) => {
    await page.goto("/examples/playground")
    await waitForClientReady(page)

    const trigger = page.getByRole("button", { name: "View code" })
    await trigger.click()
    const dialog = page.getByRole("dialog", { name: "View code" })
    await expect(dialog).toContainText("start integrating your current prompt and settings")
    await expect(dialog.locator("code")).toContainText("import openai")
    await expect(dialog.locator("code")).toContainText("openai.Completion.create")
    await expect(dialog.locator("code")).toContainText("OPENAI_API_KEY")
    await expect(dialog).toContainText("environment variables or a secret management tool")

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("playground share popover exposes and copies the React preset link", async ({ page }) => {
    await page.goto("/examples/playground")
    await waitForClientReady(page)

    const trigger = page.getByRole("button", { name: "Share" })
    await trigger.click()
    const popover = page.getByRole("dialog", { name: "Share preset" })
    await expect(popover).toContainText("Anyone who has this link and an OpenAI account")
    const link = popover.getByLabel("Link")
    await expect(link).toHaveValue("https://platform.openai.com/playground/p/7bbKYQvsVkNmVb8NGcdUOLae?model=text-davinci-003")
    await expect(link).toHaveAttribute("readonly", "")

    await popover.getByRole("button", { name: "Copy" }).click()
    await expect(popover.getByRole("button", { name: "Copied" })).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(popover).toBeHidden()
  })

  test("playground preset actions restore preferences and deletion feedback", async ({ page }) => {
    await page.goto("/examples/playground")
    await waitForClientReady(page)

    const actionsTrigger = page.getByRole("button", { name: "Actions" })
    await actionsTrigger.click()
    const actions = page.getByRole("menu", { name: "Preset actions" })
    await expect(actions.getByRole("menuitem", { name: "Content filter preferences" })).toBeVisible()
    await expect(actions.getByRole("menuitem", { name: "Delete preset" })).toBeVisible()

    await actions.getByRole("menuitem", { name: "Content filter preferences" }).click()
    const preferences = page.getByRole("dialog", { name: "Content filter preferences" })
    await expect(preferences).toContainText("powered by our moderation endpoint")
    const warningSwitch = preferences.getByRole("switch")
    await expect(warningSwitch).toHaveAttribute("aria-checked", "true")
    await warningSwitch.click()
    await expect(warningSwitch).toHaveAttribute("aria-checked", "false")
    await preferences.getByRole("button", { name: "Close" }).last().click()
    await expect(preferences).toBeHidden()
    await expect(actionsTrigger).toBeFocused()

    await actionsTrigger.click()
    await actions.getByRole("menuitem", { name: "Delete preset" }).click()
    const alert = page.getByRole("alertdialog", { name: "Are you absolutely sure?" })
    await expect(alert).toContainText("This action cannot be undone")
    await alert.getByRole("button", { name: "Cancel" }).click()
    await expect(alert).toBeHidden()

    await actionsTrigger.click()
    await actions.getByRole("menuitem", { name: "Delete preset" }).click()
    await alert.getByRole("button", { name: "Delete" }).click()
    await expect(alert).toBeHidden()
    await expect(page.getByRole("status")).toContainText("This preset has been deleted.")
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

  test("home form controls use the React focus ring", async ({ page }) => {
    await page.goto("/")
    await waitForClientReady(page)

    const groupedInput = page.getByPlaceholder("Search...")
    const groupedTextarea = page.getByPlaceholder("Ask, Search or Chat...")

    await expectFocusRing(page.getByPlaceholder("John Doe"))
    await expectFocusRing(page.getByPlaceholder("Add any additional comments"))
    await expectFocusRing(page.getByRole("combobox", { name: "MM" }))
    await expectFocusRing(groupedInput, groupedInput.locator(".."))
    await expectFocusRing(groupedTextarea, groupedTextarea.locator(".."))
    await expectFocusRing(page.locator("[data-counter-input]"))
    await expectFocusRing(page.locator("#checkout-same-as-shipping"))
    await expectFocusRing(page.getByRole("radio", { name: "Kubernetes" }))
    await expectFocusRing(page.getByRole("switch").first())
    await expectFocusRing(page.getByRole("slider", { name: "Minimum price" }))
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

  test("home source submenu opens on pointer hover", async ({ page }) => {
    await page.goto("/")
    await waitForClientReady(page)

    await page.getByRole("button", { name: "All Sources" }).click()
    const submenuTrigger = page.locator(
      ".root-sources-menu .ui-menu-sub > [data-menu-trigger]",
    )
    const submenu = page.locator(".root-knowledge-menu")

    await submenuTrigger.hover()
    await expect(submenu).toBeVisible()
    await expect(submenuTrigger).toHaveAttribute("aria-expanded", "true")
    await expect(submenu.getByRole("textbox", { name: "Find knowledge" })).toBeFocused()
  })

  test("home source submenu selects its first command item", async ({ page }) => {
    await page.goto("/")
    await waitForClientReady(page)

    await page.getByRole("button", { name: "All Sources" }).click()
    await page.locator(
      ".root-sources-menu .ui-menu-sub > [data-menu-trigger]",
    ).hover()

    const submenu = page.locator(".root-knowledge-menu")
    const items = submenu.locator("[data-mention-item]")
    await expect(submenu).toBeVisible()
    await expect(items.nth(0)).toHaveAttribute("data-selected", "true")
    await expect(items.nth(0)).toHaveAttribute("aria-selected", "true")
    await expect(items.nth(1)).toHaveAttribute("data-selected", "false")

    await items.nth(1).hover()
    await expect(items.nth(0)).toHaveAttribute("data-selected", "false")
    await expect(items.nth(1)).toHaveAttribute("data-selected", "true")

    await submenu.getByRole("textbox", { name: "Find knowledge" }).fill("evil")
    await expect(items.nth(0)).toBeHidden()
    await expect(items.nth(1)).toBeHidden()
    await expect(items.nth(2)).toHaveAttribute("data-selected", "true")
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

  test("authentication submission mirrors the React loading state", async ({ page }) => {
    await page.goto("/examples/authentication")
    await waitForClientReady(page)

    const email = page.getByLabel("Email")
    const submit = page.getByRole("button", { name: "Sign In with Email" })
    const provider = page.getByRole("button", { name: "GitHub" })
    await email.fill("person@example.com")
    await submit.click()

    await expect(email).toBeDisabled()
    await expect(submit).toBeDisabled()
    await expect(provider).toBeDisabled()
    await expect(submit.locator("[data-auth-spinner]")).toBeVisible()
    await expect(provider.locator("[data-auth-spinner]")).toBeVisible()
    await expect(provider.locator("[data-auth-provider-icon]")).toBeHidden()

    await expect(submit).toBeEnabled({ timeout: 4000 })
    await expect(email).toBeEnabled()
    await expect(provider).toBeEnabled()
    await expect(provider.locator("[data-auth-spinner]")).toBeHidden()
    await expect(provider.locator("[data-auth-provider-icon]")).toBeVisible()
    await expect(email).toHaveValue("person@example.com")
  })

  test("authentication example matches the React responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 1200 })
    await page.goto("/examples/authentication")

    const showcase = page.locator(".example-showcase-surface")
    const liveStage = showcase.locator(".example-live-stage")
    const mobileGallery = showcase.locator(".example-mobile-gallery")
    const example = page.locator(".auth-example")
    const brand = page.locator(".auth-brand-panel")
    const formPanel = page.locator(".auth-form-panel")
    const shell = page.locator(".auth-form-shell")
    await expect(mobileGallery).toBeVisible()
    await expect(liveStage).toBeHidden()

    await page.setViewportSize({ width: 768, height: 1200 })
    await expect(mobileGallery).toBeHidden()
    await expect(liveStage).toBeVisible()
    expect((await example.boundingBox())?.height).toBe(692)
    await expect(brand).toBeHidden()
    expect((await formPanel.boundingBox())?.width).toBe(350)
    expect((await shell.boundingBox())?.height).toBe(338)
    expect((await page.locator(".auth-methods").boundingBox())?.height).toBe(188)
    expect((await page.locator(".auth-login-link").boundingBox())?.height).toBe(36)
    await expect(page.getByRole("heading", { name: "Create an account", level: 1 })).toHaveCSS("font-size", "24px")
    await expect(page.getByRole("heading", { name: "Create an account", level: 1 })).toHaveCSS("line-height", "32px")

    await page.setViewportSize({ width: 1023, height: 1200 })
    expect((await example.boundingBox())?.height).toBe(692)
    await expect(brand).toBeHidden()
    expect((await formPanel.boundingBox())?.width).toBe(350)

    await page.setViewportSize({ width: 1024, height: 1200 })
    expect((await example.boundingBox())?.height).toBe(1000)
    await expect(brand).toBeVisible()
    expect((await brand.boundingBox())?.height).toBe(1000)
    expect((await formPanel.boundingBox())?.height).toBe(1000)
    expect((await shell.boundingBox())?.height).toBe(338)
  })

  test("authentication example keeps its reference controls", async ({ page }) => {
    await page.goto("/examples/authentication")

    await expect(page.locator(".auth-login-link")).toContainText("Login")
    await expect(page.locator(".auth-form-shell h1")).toContainText("Create an account")
    await expect(page.locator(".auth-provider-button")).toHaveCount(1)
    await expect(page.locator(".auth-provider-button")).toContainText("GitHub")
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign In with Email" })).toBeVisible()
  })

  test("rtl example matches the React component gallery breakpoints", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const showcase = page.locator(".example-showcase-surface")
    const gallery = showcase.locator("[data-slot='rtl-components']")
    const lastColumn = gallery.locator(".examples-root-column-last")
    await expect(showcase.locator(".example-mobile-gallery")).toBeHidden()
    await expect(showcase.locator(".example-live-stage")).toBeVisible()
    await expect(gallery).toHaveAttribute("dir", "rtl")
    await expect(gallery).toHaveAttribute("data-lang", "ar")
    await expect(gallery).toHaveCSS("font-family", /Noto Sans Arabic/)
    await expect(gallery.locator(".examples-root-column")).toHaveCount(4)
    await expect(gallery.locator(".example-root-panel")).toHaveCount(16)
    await expect(gallery).toContainText("طريقة الدفع")
    await expect(gallery).toContainText("لا يوجد أعضاء في الفريق")
    await expect(gallery).toContainText("إعدادات المظهر")
    await expect(gallery).toContainText("جارٍ معالجة طلبك")
    expect(await gallery.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(1)
    await expect(gallery).toHaveCSS("width", "327px")
    await expect(gallery).toHaveCSS("height", "2978.75px")
    await expect(gallery.locator(".root-item-stack")).toHaveCSS("height", "153.25px")
    await expect(lastColumn).toBeVisible()
    await expect(lastColumn).toHaveCSS("order", "-1")
    await expect(page.getByRole("button", { name: "Language" })).toBeHidden()

    await page.setViewportSize({ width: 768, height: 1200 })
    expect(await gallery.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(2)
    await expect(gallery).toHaveCSS("width", "720px")
    await expect(lastColumn).toBeVisible()

    await page.setViewportSize({ width: 1024, height: 1200 })
    expect(await gallery.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(3)
    await expect(gallery).toHaveCSS("width", "944px")
    await expect(lastColumn).toBeHidden()
    await expect(page.getByRole("button", { name: "Language" })).toBeVisible()

    await page.setViewportSize({ width: 1280, height: 1200 })
    expect(await gallery.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(4)
    await expect(gallery).toHaveCSS("width", "1200px")
    await expect(lastColumn).toBeVisible()
    await expect(lastColumn).toHaveCSS("order", "0")
  })

  test("rtl example is localized in the server response", async ({ request }) => {
    const response = await request.get("/examples/rtl")
    expect(response.ok()).toBe(true)
    const html = await response.text()
    const start = html.indexOf('data-slot="rtl-components"')
    const end = html.indexOf("data-rtl-server-end", start)
    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    const gallery = html.slice(start, end)

    expect(gallery).toContain('lang="ar"')
    expect(gallery).toContain("طريقة الدفع")
    expect(gallery).toContain('placeholder="أرسل رسالة..."')
    expect(gallery).toContain('aria-label="الوضع الصوتي"')
    expect(gallery).not.toContain("Payment Method")
    expect(gallery).not.toContain("Send a message...")
  })

  test("rtl example switches all component copy between Arabic and Hebrew", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const gallery = page.locator("[data-slot='rtl-components']")
    await expect(gallery).toHaveAttribute("data-lang", "ar")
    await expect(gallery).toContainText("طريقة الدفع")
    await expect(gallery).toContainText("بيئة الحوسبة")
    await expect(gallery).toContainText("كيف سمعت عنا؟")
    await expect(page.getByPlaceholder("اسأل، ابحث، أو أنشئ أي شيء...")).toBeVisible()
    await expect(page.getByRole("button", { name: "إرفاق ملف" })).toBeVisible()

    await page.getByRole("button", { name: "Language" }).click()
    await page.getByRole("option", { name: "Hebrew (עברית)" }).click()
    await expect(gallery).toHaveAttribute("data-lang", "he")
    await expect(gallery).toHaveAttribute("lang", "he")
    await expect(gallery).toHaveCSS("font-family", /Noto Sans Hebrew/)
    await expect(gallery).toContainText("אמצעי תשלום")
    await expect(gallery).toContainText("סביבת מחשוב")
    await expect(gallery).toContainText("איך שמעת עלינו?")
    await expect(page.getByPlaceholder("שאל, חפש, או צור משהו...")).toBeVisible()
    await expect(page.getByRole("button", { name: "צרף קובץ" })).toBeVisible()

    await page.getByRole("button", { name: "Language" }).click()
    await page.getByRole("option", { name: "Arabic (العربية)" }).click()
    await expect(gallery).toHaveAttribute("data-lang", "ar")
    await expect(gallery).toContainText("طريقة الدفع")
  })

  test("rtl voice mode preserves the active language", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const gallery = page.locator("[data-slot='rtl-components']")
    const voiceToggle = gallery.locator('[data-toggle="voice"]')
    const voiceInput = gallery.locator(".ui-button-group > .ui-input-group-round input")

    await voiceToggle.click()
    await expect(voiceToggle).toHaveAttribute("aria-pressed", "true")
    await expect(voiceInput).toBeDisabled()
    await expect(voiceInput).toHaveAttribute("placeholder", "سجل وأرسل صوتًا...")

    await voiceToggle.click()
    await expect(voiceInput).toBeEnabled()
    await expect(voiceInput).toHaveAttribute("placeholder", "أرسل رسالة...")

    await page.getByRole("button", { name: "Language" }).click()
    await page.getByRole("option", { name: "Hebrew (עברית)" }).click()
    await voiceToggle.click()
    await expect(voiceInput).toBeDisabled()
    await expect(voiceInput).toHaveAttribute("placeholder", "הקלט ושלח אודיו...")
  })

  test("rtl buttons match the React primitive details", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const gallery = page.locator("[data-slot='rtl-components']")
    const invite = gallery.getByRole("button", { name: "دعوة أعضاء" })
    await expect(invite).toHaveCSS("border-top-width", "1px")
    await expect(invite).toHaveCSS("border-radius", "8px")
    await expect(invite).toHaveCSS("gap", "4px")
    await expect(invite).toHaveCSS("line-height", "18.2857px")

    const submit = gallery.getByRole("button", { name: "إرسال", exact: true }).first()
    await expect(submit).toHaveCSS("border-top-width", "1px")

    const archive = gallery.getByRole("button", { name: "أرشفة", exact: true }).first()
    const report = gallery.getByRole("button", { name: "إبلاغ", exact: true })
    await expect(archive).toHaveCSS("border-radius", "0px 10px 10px 0px")
    await expect(report).toHaveCSS("border-radius", "10px 0px 0px 10px")

    await gallery.getByRole("button", { name: "خيارات أخرى" }).click()
    const actionsMenu = gallery.locator(".root-actions-menu")
    await actionsMenu.getByRole("menuitem", { name: "تصنيف كـ..." }).click()
    const labelMenu = actionsMenu.locator(".ui-menu-sub [data-menu-panel]")
    await expect(labelMenu).toBeVisible()
    await expect(labelMenu).toHaveAttribute("data-menu-preferred-side", "left")
    const labelMenuBox = await labelMenu.boundingBox()
    expect(labelMenuBox).not.toBeNull()
    expect(labelMenuBox!.x).toBeGreaterThanOrEqual(0)
    expect(labelMenuBox!.x + labelMenuBox!.width).toBeLessThanOrEqual(1280)
    expect(await actionsMenu.locator(".root-menu-trailing-icon").evaluate((icon) => (
      Number.parseFloat(getComputedStyle(icon).marginRight)
    ))).toBeGreaterThan(0)
  })

  test("rtl verified item matches the React presentation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const title = page.getByText("تم التحقق من ملفك الشخصي.", { exact: true })
    const item = title.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' ui-item ')][1]")
    await expect(item).toHaveCount(1)
    expect(await item.evaluate((element) => element.tagName)).toBe("DIV")
    expect(await item.locator(".ui-item-media").evaluate((element) => (
      getComputedStyle(element).color === getComputedStyle(element.parentElement!).color
    ))).toBe(true)
    expect(await item.locator(".ui-item-actions").evaluate((element) => (
      getComputedStyle(element).color === getComputedStyle(element.parentElement!).color
    ))).toBe(true)

    const directionalIcons = page.locator("[data-slot='rtl-components'] .root-rtl-directional-icon")
    await expect(directionalIcons).toHaveCount(4)
    for (const icon of await directionalIcons.all()) {
      await expect(icon).toHaveCSS("transform", "matrix(-1, 0, 0, -1, 0, 0)")
    }
  })

  test("rtl example matches the current localized input groups", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const gallery = page.locator("[data-slot='rtl-components']")
    await expect(gallery.getByText("https://", { exact: true })).toHaveCount(0)
    await expect(gallery.getByPlaceholder("@shadcn")).toHaveCount(0)
    await expect(gallery.getByPlaceholder("shadcn")).toBeVisible()
    await expect(gallery.locator(".root-input-group-stack").nth(0)).toHaveCSS("height", "272px")

    const searchInput = gallery.getByPlaceholder("بحث...")
    const searchGroup = searchInput.locator("xpath=..")
    const searchGroupBox = await searchGroup.boundingBox()
    const searchAddonBox = await searchGroup.locator(":scope > .ui-input-group-addon:not(.ui-input-group-addon-end)").boundingBox()
    const resultsAddonBox = await searchGroup.locator(":scope > .ui-input-group-addon-end").boundingBox()
    expect(searchGroupBox).not.toBeNull()
    expect(searchAddonBox).not.toBeNull()
    expect(resultsAddonBox).not.toBeNull()
    expect(searchAddonBox!.x + searchAddonBox!.width).toBe(searchGroupBox!.x + searchGroupBox!.width - 1)
    expect(resultsAddonBox!.x).toBe(searchGroupBox!.x + 1)

    const priceInput = gallery.getByRole("textbox", { name: "السعر" })
    await expect(priceInput).toBeVisible()
    await expect(priceInput.locator("xpath=..")).toContainText("ر.س")
    const priceGroup = priceInput.locator("xpath=..")
    const infoAddon = priceGroup.locator(":scope > .ui-menu")
    const favoriteAddon = priceGroup.locator(":scope > .ui-input-group-addon-end")
    const priceBox = await priceInput.boundingBox()
    const infoBox = await infoAddon.boundingBox()
    const favoriteBox = await favoriteAddon.boundingBox()
    expect(priceBox).not.toBeNull()
    expect(infoBox).not.toBeNull()
    expect(favoriteBox).not.toBeNull()
    expect(infoBox!.x).toBeGreaterThan(priceBox!.x)
    expect(favoriteBox!.x + favoriteBox!.width).toBeLessThan(priceBox!.x + priceBox!.width)
    await expect(favoriteAddon.getByRole("button", { name: "مفضل" })).toHaveCSS("color", "oklch(0.556 0 0)")

    await gallery.getByRole("button", { name: "معلومات" }).click()
    const pricePopover = gallery.locator(".root-secure-popover")
    await expect(pricePopover).toBeVisible()
    await expect(pricePopover).toContainText("أدخل السعر بالريال السعودي.")
    await expect(pricePopover).toContainText("سيتم تحويل السعر تلقائياً.")

    const favorite = gallery.getByRole("button", { name: "مفضل" })
    await expect(favorite).toHaveAttribute("aria-pressed", "false")
    await favorite.click()
    await expect(favorite).toHaveAttribute("aria-pressed", "true")

    const promptGroup = gallery.locator(".root-input-group-stack").first().locator(".ui-input-group-block")
    const promptUsage = promptGroup.locator(".root-input-group-usage")
    const promptSend = promptGroup.getByRole("button", { name: "إرسال" })
    const promptAdd = promptGroup.getByRole("button", { name: "إضافة" })
    const promptUsageBox = await promptUsage.boundingBox()
    const promptSendBox = await promptSend.boundingBox()
    const promptAddBox = await promptAdd.boundingBox()
    expect(promptUsageBox).not.toBeNull()
    expect(promptSendBox).not.toBeNull()
    expect(promptAddBox).not.toBeNull()
    expect(promptSendBox!.x + promptSendBox!.width).toBeLessThan(promptUsageBox!.x)
    expect(promptAddBox!.x).toBeGreaterThan(promptUsageBox!.x + promptUsageBox!.width)
  })

  test("rtl payment form matches the localized React controls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const gallery = page.locator("[data-slot='rtl-components']")
    const payment = gallery.locator(".root-field-demo")
    await expect(payment).toHaveCSS("height", "711.25px")
    await expect(payment.getByLabel("رقم البطاقة")).toHaveAttribute(
      "placeholder",
      "١٢٣٤ ٥٦٧٨ ٩٠١٢ ٣٤٥٦",
    )
    await expect(payment.getByLabel("رمز الأمان")).toHaveAttribute("placeholder", "١٢٣")

    const month = payment.getByRole("combobox", { name: "MM" })
    await expect(month).toHaveCSS("padding-top", "8px")
    await expect(month).toHaveCSS("padding-bottom", "8px")
    await expect(month).toHaveCSS("padding-right", "10px")
    await expect(month).toHaveCSS("padding-left", "8px")
    await month.click()
    await payment.getByRole("option", { name: "٠١", exact: true }).click()
    await expect(month.locator("[data-select-value]")).toHaveText("٠١")

    const sameAsShipping = payment.getByRole("checkbox", { name: "نفس عنوان الشحن" })
    await expect(sameAsShipping).toHaveAttribute("aria-checked", "true")
    await payment.getByText("نفس عنوان الشحن", { exact: true }).click()
    await expect(sameAsShipping).toHaveAttribute("aria-checked", "false")
    await expect(payment.getByRole("button", { name: "إرسال" })).toHaveAttribute("type", "submit")
  })

  test("rtl empty states match the React component dimensions", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const emptyStates = page.locator("[data-slot='rtl-components'] .ui-empty")
    await expect(emptyStates).toHaveCount(2)
    await expect(emptyStates.first()).toHaveCSS("height", "224.75px")
    await expect(emptyStates.last()).toHaveCSS("height", "215.5px")
    await expect(emptyStates.last()).toHaveCSS("border-top-style", "dashed")
    await expect(emptyStates.last().locator(".root-empty-media")).toHaveCSS("width", "32px")

    const avatarGroup = emptyStates.first().locator(".ui-avatar-group")
    await expect(avatarGroup).toHaveCSS("width", "80px")
    await expect(avatarGroup.locator("img").first()).toHaveAttribute("src", "https://github.com/shadcn.png")
    const avatarBoxes = await avatarGroup.locator(".ui-avatar").evaluateAll((avatars) => (
      avatars.map((avatar) => avatar.getBoundingClientRect().x)
    ))
    expect(avatarBoxes[0] - avatarBoxes[1]).toBe(24)
    expect(avatarBoxes[1] - avatarBoxes[2]).toBe(24)
  })

  test("rtl price slider matches React geometry and direction", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const sliderField = page.locator("[data-slider-scope='price-range']")
    const slider = sliderField.locator("[data-slider='price-range']")
    const thumbs = slider.locator("[data-slider-thumb]")
    await expect(sliderField).toHaveCSS("height", "64.25px")
    await expect(slider).toHaveCSS("height", "4px")
    await expect(thumbs.first()).toHaveCSS("width", "12px")

    const lowBox = await thumbs.first().boundingBox()
    const highBox = await thumbs.last().boundingBox()
    expect(lowBox).not.toBeNull()
    expect(highBox).not.toBeNull()
    expect(lowBox!.x).toBeGreaterThan(highBox!.x)

    const sliderBox = await slider.boundingBox()
    expect(sliderBox).not.toBeNull()
    await page.mouse.click(sliderBox!.x + sliderBox!.width * 0.75, sliderBox!.y + sliderBox!.height / 2)
    await expect(thumbs.first()).toHaveAttribute("aria-valuenow", "240")
    await expect(sliderField.locator('[data-slider-output="0"]')).toHaveText("٢٤٠")

    await thumbs.first().focus()
    await page.keyboard.press("ArrowRight")
    await expect(thumbs.first()).toHaveAttribute("aria-valuenow", "230")
    await expect(sliderField.locator('[data-slider-output="0"]')).toHaveText("٢٣٠")
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")
    await expect(thumbs.first()).toHaveAttribute("aria-valuenow", "250")
    await expect(sliderField.locator('[data-slider-output="0"]')).toHaveText("٢٥٠")
  })

  test("rtl appearance settings match React controls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const settings = page.locator(".root-appearance-settings")
    await expect(settings).toHaveCSS("height", "408px")

    const radios = settings.getByRole("radio")
    await expect(radios).toHaveCount(2)
    await expect(radios.first()).toHaveAttribute("aria-checked", "true")
    await expect(radios.first()).toHaveCSS("margin-top", "1px")
    await expect(radios.first().locator("span")).toHaveCSS("width", "8px")
    const selectedCard = settings.locator("[data-radio-item]").first()
    await expect(selectedCard).toHaveCSS("border-top-color", "oklab(0.205 0 0 / 0.3)")
    await expect(selectedCard).toHaveCSS("background-color", "oklab(0.205 0 0 / 0.05)")
    await radios.first().focus()
    await page.keyboard.press("ArrowLeft")
    await expect(radios.last()).toHaveAttribute("aria-checked", "true")
    await expect(radios.last()).toBeFocused()
    await page.keyboard.press("ArrowRight")
    await expect(radios.first()).toHaveAttribute("aria-checked", "true")

    const gpuInput = settings.getByRole("textbox", { name: "عدد وحدات GPU" })
    await expect(gpuInput).toHaveValue("8")
    await settings.getByRole("button", { name: "زيادة" }).click()
    await expect(gpuInput).toHaveValue("9")

    const tinting = settings.getByRole("switch", { name: "تلوين الخلفية" })
    await expect(tinting).toHaveAttribute("aria-checked", "true")
    await expect(tinting).toHaveCSS("height", "18.3906px")
    await expect(tinting.locator("span")).toHaveCSS("width", "16px")
    const tintingBox = await tinting.boundingBox()
    const tintingThumbBox = await tinting.locator("span").boundingBox()
    expect(tintingBox).not.toBeNull()
    expect(tintingThumbBox).not.toBeNull()
    expect(tintingThumbBox!.x).toBe(tintingBox!.x + 1)
    const tintingFieldBox = await tinting.locator("xpath=ancestor::*[contains(@class, 'ui-field-horizontal')][1]").boundingBox()
    expect(tintingFieldBox).not.toBeNull()
    expect(tintingBox!.y).toBe(tintingFieldBox!.y)
    await settings.getByText("تلوين الخلفية", { exact: true }).click()
    await expect(tinting).toHaveAttribute("aria-checked", "false")
  })

  test("rtl prompt matches the localized React controls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const prompt = page.locator("#notion-prompt").locator("xpath=../..")
    await expect(prompt).toHaveCSS("height", "158px")
    await expect(prompt.getByRole("button", { name: "أضف سياق" })).toHaveCSS("height", "32px")
    await expect(prompt.getByRole("button", { name: "إرفاق ملف" })).toHaveCSS("width", "32px")
    await expect(prompt.getByRole("button", { name: "إرسال" })).toHaveCSS("width", "32px")

    const model = prompt.locator(".root-pill-button").first()
    await expect(model).toHaveText("تلقائي")
    await model.click()
    await prompt.getByRole("menuitemradio", { name: /وضع الوكيل/ }).click()
    await expect(model).toHaveText("وضع الوكيل")

    await prompt.getByRole("button", { name: "أضف سياق" }).click()
    const mentionSearch = prompt.getByRole("textbox", { name: "البحث في الصفحات..." })
    await mentionSearch.fill("لوحة")
    const visibleMentions = prompt.locator(".root-mention-popover [data-mention-item]:not([hidden])")
    await expect(visibleMentions).toHaveCount(1)
    await visibleMentions.click()
    await expect(prompt.locator("[data-mention-chip]")).toContainText("لوحة المشروع")
  })

  test("rtl terms field matches the React checkbox", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const termsField = page.locator(".root-check-field")
    const checkbox = termsField.getByRole("checkbox", { name: "أوافق على الشروط والأحكام" })
    await expect(termsField).toHaveCSS("height", "41.25px")
    await expect(termsField).toHaveCSS("border-top-color", "oklab(0.205 0 0 / 0.3)")
    await expect(checkbox).toHaveAttribute("aria-checked", "true")
    await termsField.getByText("أوافق على الشروط والأحكام", { exact: true }).click()
    await expect(checkbox).toHaveAttribute("aria-checked", "false")
  })

  test("rtl referral field matches the React checkbox cards", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 })
    await page.goto("/examples/rtl")
    await waitForClientReady(page)

    const referral = page.locator(".root-hear-card")
    await expect(referral).toHaveCSS("height", "167.5px")
    await expect(referral).toHaveCSS("border-top-width", "0px")

    const social = referral.getByRole("checkbox", { name: "التواصل الاجتماعي" })
    const search = referral.getByRole("checkbox", { name: "البحث" })
    await expect(social).toHaveAttribute("aria-checked", "true")
    await social.focus()
    await page.keyboard.press("Space")
    await expect(social).toHaveAttribute("aria-checked", "false")
    await search.focus()
    await page.keyboard.press("Enter")
    await expect(search).toHaveAttribute("aria-checked", "true")
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
