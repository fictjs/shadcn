import { expect, test } from "@playwright/test"

test.describe("shadcn v4 site", () => {
  test("examples root keeps catalog controls while detail routes stay focused", async ({ page }) => {
    await page.goto("/examples")

    await expect(page.getByLabel("Filter examples")).toBeVisible()
    await expect(page.locator(".pill-grid .pill-item").first()).toBeVisible()

    await page.goto("/examples/dashboard")

    await expect(page.locator(".example-detail-head h2")).toContainText("Dashboard")
    await expect(page.getByLabel("Filter examples")).toHaveCount(0)
    await expect(page.locator(".pill-grid .pill-item")).toHaveCount(0)
    await expect(page.locator(".example-mobile-gallery figcaption")).toHaveCount(0)
    await expect(page.locator(".example-detail-card")).not.toContainText("route:")
  })

  test("home and docs routes render expected chrome", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { name: "The Foundation for your Design System" })).toBeVisible()
    await expect(page.getByRole("navigation", { name: "Primary" })).toContainText("Docs")
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible()
    await expect(page.locator(".home-examples-root .examples-root-grid")).toBeVisible()
    await expect(page.locator(".root-preview-separator")).toContainText("Appearance Settings")

    await page.goto("/docs")

    await expect(page.locator(".doc-header-main > h1")).toContainText("Introduction")
    await expect(page.getByRole("button", { name: "Copy Page" })).toBeVisible()
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
    await expect(page.locator(".dashboard-chart-card")).toContainText("Revenue")
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

  test("tasks example filters rows interactively", async ({ page }) => {
    await page.goto("/examples/tasks")

    const searchInput = page.getByPlaceholder("Search issue, title, or team")
    await expect(searchInput).toBeVisible()
    await expect(page.locator("tbody tr")).toHaveCount(5)

    await searchInput.fill("growth")
    await expect(page.locator("tbody tr")).toHaveCount(1)
    await expect(page.locator("tbody")).toContainText("Growth")

    await page.getByRole("button", { name: "Done" }).click()
    await expect(page.locator("tbody tr")).toHaveCount(0)
    await expect(page.locator(".tasks-empty-state")).toBeVisible()

    await page.getByRole("button", { name: "All" }).click()
    await expect(page.locator("tbody tr")).toHaveCount(1)
  })

  test("playground example switches modes and updates controls", async ({ page }) => {
    await page.goto("/examples/playground")

    const tabs = page.getByRole("tab")
    const insertTab = page.getByRole("tab", { name: "Insert", exact: true })

    await expect(tabs).toHaveCount(3)
    await insertTab.click()
    await expect(insertTab).toHaveClass(/playground-tab-active/)
    await expect(page.locator(".playground-output-muted")).toContainText("Insertion Preview")

    await page.getByRole("button", { name: "gemini-pro" }).click()
    await expect(page.locator(".playground-selection-summary")).toContainText("Model: gemini-pro")
  })

  test("themes route renders the customizer shell", async ({ page }) => {
    await page.goto("/themes")

    await expect(page.getByRole("heading", { name: "Pick a Color. Make it yours." })).toBeVisible()
    await expect(page.locator(".theme-customizer-scroll .theme-customizer-pill").first()).toBeVisible()
    await expect(page.getByRole("button", { name: "Copy Code" })).toBeVisible()
    await expect(page.locator(".theme-preview-gallery .example-preview-card")).toHaveCount(2)
  })

  test("colors route renders the wrapped palette grid", async ({ page }) => {
    await page.goto("/colors")

    await expect(page.getByRole("heading", { name: "Tailwind Colors in Every Format" })).toBeVisible()
    await expect(page.locator(".colors-route-grid .color-palette").first()).toBeVisible()
    await expect(page.locator(".colors-route-grid")).toContainText("amber")
  })

  test("authentication and rtl examples stay interactive", async ({ page }) => {
    await page.goto("/examples/authentication")

    await expect(page.locator(".auth-login-link")).toContainText("Login")
    await expect(page.locator(".auth-form-shell h3")).toContainText("Create an account")
    await expect(page.locator(".auth-provider-button")).toHaveCount(2)
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible()

    await page.goto("/examples/rtl")

    await expect(page.locator(".rtl-preview-frame")).toHaveAttribute("dir", "rtl")
    await page.getByRole("button", { name: "LTR" }).click()
    await expect(page.locator(".rtl-preview-frame")).toHaveAttribute("dir", "ltr")
    await expect(page.locator(".rtl-stat-card")).toHaveCount(3)
  })
})
