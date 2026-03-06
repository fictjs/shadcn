import { expect, test } from "@playwright/test"

test.describe("shadcn v4 site", () => {
  test("home and docs routes render expected chrome", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { name: "The Foundation for your Design System" })).toBeVisible()
    await expect(page.getByRole("navigation", { name: "Primary" })).toContainText("Docs")
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible()

    await page.goto("/docs")

    await expect(page.locator(".doc-header-main > h1")).toContainText("Introduction")
    await expect(page.getByRole("button", { name: "Copy Page" })).toBeVisible()
  })

  test("dashboard example renders as a live desktop stage", async ({ page }) => {
    await page.goto("/examples/dashboard")

    await expect(page.locator(".example-live-stage .dashboard-example")).toBeVisible()
    await expect(page.locator(".dashboard-stat-card")).toHaveCount(4)
    await expect(page.locator(".example-mobile-gallery")).toBeHidden()
    await expect(page.locator(".dashboard-chart-card")).toContainText("Revenue")
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

  test("authentication and rtl examples stay interactive", async ({ page }) => {
    await page.goto("/examples/authentication")

    await expect(page.locator(".auth-form-shell")).toContainText("Create an account")
    await expect(page.locator(".auth-provider-button")).toHaveCount(2)
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible()

    await page.goto("/examples/rtl")

    await expect(page.locator(".rtl-preview-frame")).toHaveAttribute("dir", "rtl")
    await page.getByRole("button", { name: "LTR" }).click()
    await expect(page.locator(".rtl-preview-frame")).toHaveAttribute("dir", "ltr")
    await expect(page.locator(".rtl-stat-card")).toHaveCount(3)
  })
})
