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

async function expectIntrinsicWidth(locator: Locator, expected: number) {
  await locator.page().evaluate(() => document.fonts.ready)
  const width = await locator.evaluate((element) => element.getBoundingClientRect().width)
  expect(width).toBeGreaterThanOrEqual(expected * 0.94)
  expect(width).toBeLessThanOrEqual(expected * 1.06)
}

async function expectCodeLinesStackVertically(codeBlock: Locator, minimumLineCount = 2) {
  await expect(codeBlock.locator("code")).toHaveAttribute("data-line-numbers", "")
  const lines = codeBlock.locator(".shiki-line")
  await expect.poll(() => lines.count()).toBeGreaterThanOrEqual(minimumLineCount)

  const renderedLines = await lines.evaluateAll(elements =>
    elements.map(element => ({
      number: element.getAttribute("data-line-number"),
      renderedNumber: getComputedStyle(element, "::before").content.replaceAll('"', ""),
      numberDisplay: getComputedStyle(element, "::before").display,
      numberWidth: getComputedStyle(element, "::before").width,
      top: Math.round(element.getBoundingClientRect().top),
    }))
  )
  for (let index = 0; index < renderedLines.length; index += 1) {
    expect(renderedLines[index].number).toBe(String(index + 1))
    expect(renderedLines[index].renderedNumber).toBe(String(index + 1))
    expect(renderedLines[index].numberDisplay).toBe("inline-block")
    expect(renderedLines[index].numberWidth).toBe("48px")
    if (index > 0) {
      expect(renderedLines[index].top).toBeGreaterThan(renderedLines[index - 1].top)
    }
  }
}

test.describe("Fict shadcn website", () => {
  test("routes use Fict shadcn page titles", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle("The Foundation for your Design System - Fict shadcn")

    await page.goto("/docs")
    await expect(page).toHaveTitle("Introduction - Fict shadcn")

    await page.goto("/blocks")
    await expect(page).toHaveTitle("Building Blocks for the Web - Fict shadcn")

    await page.goto("/themes")
    await expect(page).toHaveTitle("Pick a Color. Make it yours. - Fict shadcn")

    await page.goto("/create")
    await expect(page).toHaveTitle("New Project - Fict shadcn")
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
    await expect(page.getByRole("link", { name: "Fict components, blocks, themes and more" })).toHaveAttribute(
      "href",
      "/docs/installation"
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
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/fictjs/shadcn",
    )

    await page.goto("/docs")

    await expect(page.locator(".doc-header-row > h1")).toContainText("Introduction")
    await expect(page.getByRole("button", { name: "Copy Page" })).toBeVisible()
  })

  test("desktop header exposes Fict shadcn navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto("/")

    const primaryNav = page.getByRole("navigation", { name: "Primary" })
    await expect(primaryNav).toBeVisible()
    await expect(primaryNav.getByRole("link")).toHaveText([
      "Docs",
      "Components",
      "Blocks",
      "Charts",
      "Registry",
      "Create",
    ])

    await expect(page.getByRole("button", { name: "Search documentation..." })).toBeVisible()
    await expect(page.getByRole("banner").getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/fictjs/shadcn")
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

  test("docs layout stays single-column until the desktop sidebar appears", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/docs/components/fict/item")

    const layout = page.locator(".docs-layout")
    const main = page.locator(".doc-main")
    const stage = page.locator('[data-doc-preview-name="item-demo"] .doc-component-preview-stage')
    await expect(layout).toHaveCSS("grid-template-columns", "374px")
    await expect(main).toHaveCSS("width", "374px")
    await expect(stage).toHaveCSS("width", "340px")
    await expect(page.locator(".docs-sidebar")).toBeHidden()

    await page.setViewportSize({ width: 1023, height: 900 })
    await expect(layout).toHaveCSS("grid-template-columns", "1007px")
    await expect(main).toHaveCSS("width", "1007px")
    await expect(page.locator(".docs-sidebar")).toBeHidden()

    await page.setViewportSize({ width: 1024, height: 900 })
    const desktopColumns = await layout.evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").map(Number.parseFloat),
    )
    expect(desktopColumns).toHaveLength(2)
    expect(desktopColumns[0]).toBe(240)
    await expect(page.locator(".docs-sidebar")).toBeVisible()
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

  test("docs pages normalize Fict MDX blocks into readable content", async ({ page }) => {
    await page.goto("/docs/installation")

    await expect(page.getByRole("heading", { name: "Installation" })).toBeVisible()
    await expect(page.locator(".doc-body")).toContainText("@fictjs/shadcn")
    await expect(page.locator(".doc-body")).not.toContainText("<TabsContent")
    await expect(page.locator(".doc-body")).not.toContainText("<Callout")
    const shellCode = page.locator('pre[data-shiki="true"][data-language="bash"]').first()
    await expect(shellCode).toBeVisible()
    await expectCodeLinesStackVertically(shellCode, 1)
    await expect(page.locator('pre[data-language="bash"] .shiki-token').first()).toHaveAttribute("style", /--shiki-dark:/)

    await page.goto("/docs/blocks")
    await expectCodeLinesStackVertically(page.locator('pre[data-shiki="true"][data-language="bash"]').first())
  })

  test("docs pages render structured tabs and registry cards", async ({ page }) => {
    await page.goto("/docs/components/fict/avatar")

    await expect(page.locator(".doc-tabs")).toBeVisible()
    await expect(page.locator(".doc-component-card").first()).toBeVisible()
    await expect(page.locator(".doc-component-preview-stage").first()).toBeVisible()
    await page.getByRole("button", { name: "Manual" }).click()
    await expect(page.locator(".doc-tabs-panel")).toContainText("Copy the Fict shadcn component")
    const source = page.locator(".doc-component-card-source .doc-component-source-code").first()
    await expect(source).toContainText("Avatar")
    await expect(source).toHaveAttribute("data-shiki", "true")
    await expect(source).toHaveAttribute("data-language", "tsx")
    await expectCodeLinesStackVertically(source)
  })

  test("component previews match the compact Fict code card interaction", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText(value: string) {
            ;(globalThis as typeof globalThis & { __copiedCode?: string }).__copiedCode = value
            return Promise.resolve()
          },
        },
      })
    })
    await page.goto("/docs/components/fict/button")
    await waitForClientReady(page)

    const card = page.locator(".doc-component-card:not(.doc-component-card-source)").first()
    const stage = card.locator(".doc-component-preview-stage")
    const code = card.locator(".doc-component-code")
    const snippet = card.locator(".doc-component-snippet")
    const fullCode = card.locator("[data-doc-preview-full-code]")
    const copy = card.locator("[data-doc-preview-code-copy]")
    const toggle = card.getByRole("button", { name: "View Code" })

    await expect(card.locator(".doc-component-head")).toHaveCount(0)
    await expect(stage).toHaveCSS("height", "288px")
    await expect(code).toHaveCSS("height", "104px")
    await expect(snippet).toContainText("import")
    await expect(snippet).toHaveAttribute("data-shiki", "true")
    await expect(snippet).toHaveAttribute("data-language", "tsx")
    await expect(snippet.locator(".shiki-token").first()).toHaveAttribute("style", /--shiki-dark:/)
    await expectCodeLinesStackVertically(snippet)
    await expect(fullCode).toBeHidden()
    await expect(copy).toBeHidden()
    await expect(code).toHaveAttribute("data-doc-preview-code-expanded", "false")

    const collapsedHeight = await card.evaluate((element) => element.getBoundingClientRect().height)
    expect(collapsedHeight).toBe(394)
    await toggle.click()

    await expect(code).toHaveAttribute("data-doc-preview-code-expanded", "true")
    await expect(toggle).toBeHidden()
    await expect(snippet).toBeHidden()
    await expect(fullCode).toBeVisible()
    await expect(fullCode).toContainText("Button")
    await expect(fullCode).toHaveAttribute("data-shiki", "true")
    await expect(copy).toBeVisible()
    await expectCodeLinesStackVertically(fullCode, 4)
    await expect(fullCode.locator("code")).toHaveText(/^import/)
    await copy.click()
    await expect(copy).toHaveText("Copied")
    expect(await page.evaluate(() => (globalThis as typeof globalThis & { __copiedCode?: string }).__copiedCode))
      .toBe(await fullCode.locator("code").textContent())
    expect(await card.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(collapsedHeight)

    const firstToken = fullCode.locator(".shiki-token").first()
    const lightColor = await firstToken.evaluate((element) => getComputedStyle(element).color)
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect.poll(() => firstToken.evaluate((element) => getComputedStyle(element).color)).not.toBe(lightColor)
  })

  test("accordion docs match every Fict preview and interaction", async ({ page }) => {
    await page.goto("/docs/components/fict/accordion")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)

    const expectedStageHeights = [300, 300, 480, 300, 320, 448, 352]
    for (let index = 0; index < expectedStageHeights.length; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS(
        "height",
        `${expectedStageHeights[index]}px`,
      )
    }

    const multipleCard = page.locator('[data-doc-preview-name="accordion-multiple"]')
    await multipleCard.getByRole("button", { name: "View Code" }).click()
    const multipleCode = multipleCard.locator("[data-doc-preview-full-code]")
    await expect(multipleCode).toContainText('type="multiple"')
    await expect(multipleCode).toContainText('defaultValue={["notifications"]}')
    await expect(multipleCode).not.toContainText("import * as UI")

    const demo = page.locator('[data-doc-preview-name="accordion-demo"]')
    const demoTriggers = demo.locator("[data-doc-accordion-trigger]")
    await expect(demoTriggers).toHaveCount(3)
    await expect(demoTriggers.nth(0)).toHaveAttribute("aria-expanded", "true")
    await demoTriggers.nth(1).click()
    await expect(demoTriggers.nth(0)).toHaveAttribute("aria-expanded", "false")
    await expect(demoTriggers.nth(1)).toHaveAttribute("aria-expanded", "true")
    await expect(demo.locator("[data-slot='accordion-content']").nth(1)).toBeVisible()
    await demoTriggers.nth(1).click()
    await expect(demoTriggers.nth(1)).toHaveAttribute("aria-expanded", "false")

    const multiple = page.locator('[data-doc-preview-name="accordion-multiple"]')
    const multipleTriggers = multiple.locator("[data-doc-accordion-trigger]")
    await multipleTriggers.nth(1).click()
    await expect(multipleTriggers.nth(0)).toHaveAttribute("aria-expanded", "true")
    await expect(multipleTriggers.nth(1)).toHaveAttribute("aria-expanded", "true")
    await multipleTriggers.nth(0).click()
    await expect(multipleTriggers.nth(0)).toHaveAttribute("aria-expanded", "false")
    await expect(multipleTriggers.nth(1)).toHaveAttribute("aria-expanded", "true")

    const disabled = page.locator('[data-doc-preview-name="accordion-disabled"]')
    const disabledTrigger = disabled.getByRole("button", { name: "Premium feature information" })
    await expect(disabledTrigger).toBeDisabled()
    await expect(disabledTrigger).toHaveAttribute("aria-expanded", "false")

    const rtl = page.locator('[data-doc-preview-name="accordion-rtl"]')
    await rtl.getByRole("button", { name: "View Code" }).click()
    await expect(rtl.locator("[data-doc-preview-full-code]")).toContainText("سينتهي صلاحية الرابط خلال 24 ساعة.")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator(".doc-rtl-preview")).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator("[data-doc-accordion-label]").first()).toHaveText("איך אני מאפס את הסיסמה שלי?")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-rtl-preview")).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("[data-doc-accordion-label]").first()).toHaveText("How do I reset my password?")

    await page.setViewportSize({ width: 700, height: 900 })
    await expect(previews.nth(2).locator(".doc-component-preview-stage")).toHaveCSS("height", "576px")
    await expect(previews.nth(4).locator(".doc-component-preview-stage")).toHaveCSS("height", "384px")
    await expect(previews.nth(5).locator(".doc-component-preview-stage")).toHaveCSS("height", "512px")
  })

  test("alert docs match every Fict preview and RTL content", async ({ page }) => {
    await page.goto("/docs/components/fict/alert")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(6)
    for (let index = 0; index < 5; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(5).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demoAlerts = page.locator('[data-doc-preview-name="alert-demo"] [data-slot="alert"]')
    await expect(demoAlerts).toHaveCount(2)
    for (let index = 0; index < 2; index += 1) {
      await expect(demoAlerts.nth(index)).toHaveCSS("width", "448px")
      await expect(demoAlerts.nth(index)).toHaveCSS("height", "80px")
    }
    await expect(demoAlerts.nth(0)).toContainText("Payment successful")
    await expect(demoAlerts.nth(1)).toContainText("New feature available")

    const actionAlert = page.locator('[data-doc-preview-name="alert-action"] [data-slot="alert"]')
    await expect(actionAlert).toHaveCSS("width", "448px")
    await expect(actionAlert).toHaveCSS("height", "60px")
    await expect(actionAlert.getByRole("button", { name: "Enable" })).toHaveCSS("width", "56px")
    await expect(actionAlert.getByRole("button", { name: "Enable" })).toHaveCSS("height", "24px")

    const coloredAlert = page.locator('[data-doc-preview-name="alert-colors"] [data-slot="alert"]')
    await expect(coloredAlert).toHaveCSS("background-color", "rgb(255, 251, 235)")
    await expect(coloredAlert).toHaveCSS("border-color", "rgb(253, 230, 138)")

    const rtl = page.locator('[data-doc-preview-name="alert-rtl"]')
    await expect(rtl.locator('[data-slot="alert"]')).toHaveCount(2)
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator(".doc-alert-stack")).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator(".doc-alert-title").first()).toHaveText("התשלום בוצע בהצלחה")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-alert-stack")).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator(".doc-alert-title").first()).toHaveText("Payment successful")

    const expectedSources = [
      ["alert-demo", "Payment successful", "New feature available"],
      ["alert-basic", "Account updated successfully"],
      ["alert-destructive", 'variant="destructive"', "Payment failed"],
      ["alert-action", '<Button size="sm" variant="outline">', "Enable"],
      ["alert-colors", "border-amber-500/50", "to continue using the service."],
      ["alert-rtl", "$state<keyof typeof translations>", "translations[language].map"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) {
        await expect(source).toContainText(marker)
      }
    }
  })

  test("alert dialog docs match Fict modal sizes and focus behavior", async ({ page }) => {
    await page.goto("/docs/components/fict/alert-dialog")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)
    for (let index = 0; index < 6; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "224px")
    }
    await expect(previews.nth(6).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")

    const demoTrigger = page.locator('[data-doc-preview-name="alert-dialog-demo"] [data-slot="alert-dialog-trigger"]')
    await expectIntrinsicWidth(demoTrigger, 104)
    await expect(demoTrigger).toHaveCSS("height", "32px")
    await demoTrigger.click()

    let dialog = page.locator('[data-slot="alert-dialog-content"][data-state="open"]')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveCSS("width", "384px")
    await expect(dialog).toHaveCSS("height", "167px")
    await expect(dialog).toContainText("Are you absolutely sure?")
    await expect(page.locator('[data-slot="alert-dialog-overlay"][data-state="open"]')).toBeVisible()
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden")
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused()

    await page.keyboard.press("Tab")
    await expect(dialog.getByRole("button", { name: "Continue" })).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(demoTrigger).toBeFocused()

    const small = page.locator('[data-doc-preview-name="alert-dialog-small"]')
    await small.getByRole("button", { name: "Show Dialog" }).click()
    dialog = page.locator('[data-slot="alert-dialog-content"][data-state="open"]')
    await expect(dialog).toHaveCSS("width", "320px")
    await expect(dialog).toHaveCSS("height", "167px")
    await expect(dialog.locator('[data-slot="alert-dialog-footer"] button').first()).toHaveCSS("width", "140px")
    await dialog.getByRole("button", { name: "Don't allow" }).click()

    const smallMedia = page.locator('[data-doc-preview-name="alert-dialog-small-media"]')
    await smallMedia.getByRole("button", { name: "Show Dialog" }).click()
    dialog = page.locator('[data-slot="alert-dialog-content"][data-state="open"]')
    await expect(dialog).toHaveCSS("width", "320px")
    await expect(dialog).toHaveCSS("height", "221px")
    await expect(dialog.locator('[data-slot="alert-dialog-media"]')).toHaveCSS("width", "40px")
    await dialog.getByRole("button", { name: "Allow", exact: true }).click()

    const destructive = page.locator('[data-doc-preview-name="alert-dialog-destructive"]')
    await destructive.getByRole("button", { name: "Delete Chat" }).click()
    dialog = page.locator('[data-slot="alert-dialog-content"][data-state="open"]')
    await expect(dialog).toHaveCSS("height", "241px")
    await expect(dialog.getByRole("link", { name: "Settings" })).toBeVisible()
    await expect(dialog.getByRole("button", { name: "Delete" })).toHaveClass(/is-destructive/)
    await page.locator('[data-slot="alert-dialog-overlay"][data-state="open"]').click({ position: { x: 10, y: 10 } })
    await expect(dialog).toBeVisible()
    await dialog.getByRole("button", { name: "Cancel" }).click()

    const rtl = page.locator('[data-doc-preview-name="alert-dialog-rtl"]')
    await rtl.getByLabel("Preview language").selectOption("he")
    await rtl.getByRole("button", { name: "הצג דיאלוג", exact: true }).click()
    dialog = page.locator('[data-slot="alert-dialog-content"][data-state="open"]')
    await expect(dialog).toHaveAttribute("dir", "rtl")
    await expect(dialog).toContainText("האם אתה בטוח לחלוטין?")
    await dialog.getByRole("button", { name: "ביטול" }).click()

    const expectedSources = [
      ["alert-dialog-demo", "Are you absolutely sure?"],
      ["alert-dialog-basic", "<AlertDialogTrigger asChild>"],
      ["alert-dialog-small", '<AlertDialogContent size="sm">'],
      ["alert-dialog-media", "<AlertDialogMedia>", "Share this project?"],
      ["alert-dialog-small-media", "<BluetoothIcon />"],
      ["alert-dialog-destructive", 'variant="destructive"', '<a href="#settings">Settings</a>'],
      ["alert-dialog-rtl", "$state<keyof typeof translations>", "translations[language].map"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("aspect ratio docs match Fict image geometry and RTL caption", async ({ page }) => {
    await page.goto("/docs/components/fict/aspect-ratio")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(4)
    const expectedStageHeights = [288, 288, 384, 448]
    for (let index = 0; index < expectedStageHeights.length; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS(
        "height",
        `${expectedStageHeights[index]}px`,
      )
    }

    const expectedImages = [
      { width: 384, height: 216 },
      { width: 192, height: 192 },
      { width: 160, height: 284.4375 },
      { width: 384, height: 216 },
    ]
    for (let index = 0; index < expectedImages.length; index += 1) {
      const image = previews.nth(index).getByRole("img", { name: "Photo" })
      const rect = await image.evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return { width: bounds.width, height: bounds.height }
      })
      expect(rect.width).toBe(expectedImages[index].width)
      expect(rect.height).toBe(expectedImages[index].height)
      await expect(image).toHaveCSS("object-fit", "cover")
      await expect(image).toHaveCSS("filter", "grayscale(1)")
    }

    const rtl = page.locator('[data-doc-preview-name="aspect-ratio-rtl"]')
    await expect(rtl.locator(".doc-aspect-ratio-rtl-preview")).toHaveCSS("height", "384px")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator("figcaption")).toHaveText("נוף יפה")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-aspect-ratio-figure")).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("figcaption")).toHaveText("Beautiful landscape")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(previews.first().getByRole("img", { name: "Photo" })).toHaveCSS(
      "filter",
      "grayscale(1) brightness(0.2)",
    )

    const expectedSources = [
      ["aspect-ratio-demo", "ratio={16 / 9}"],
      ["aspect-ratio-square", "ratio={1}"],
      ["aspect-ratio-portrait", "ratio={9 / 16}"],
      ["aspect-ratio-rtl", "$state<keyof typeof translations>", "<figcaption"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      await expect(source).toContainText('src="https://avatar.vercel.sh/shadcn1"')
      await expect(source).toContainText('alt="Photo"')
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("avatar docs match Fict geometry, grouping, menu, and RTL behavior", async ({ page }) => {
    await page.goto("/docs/components/fict/avatar")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(10)
    for (let index = 0; index < 9; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(9).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="avatar-demo"]')
    await expect(demo.locator('[data-slot="avatar"]')).toHaveCount(5)
    await expect(demo.locator('[data-slot="avatar-badge"]')).toHaveCSS("width", "10px")
    await expect(demo.locator('[data-slot="avatar-group-count"]')).toHaveCSS("width", "32px")

    for (const previewName of ["avatar-group", "avatar-group-count", "avatar-group-count-icon"]) {
      const avatarXs = await page
        .locator(`[data-doc-preview-name="${previewName}"] [data-slot="avatar"]`)
        .evaluateAll((avatars) => avatars.map((avatar) => avatar.getBoundingClientRect().x))
      expect(avatarXs[1] - avatarXs[0]).toBe(24)
      expect(avatarXs[2] - avatarXs[1]).toBe(24)
    }

    const sizes = await page
      .locator('[data-doc-preview-name="avatar-size"] [data-slot="avatar"]')
      .evaluateAll((avatars) => avatars.map((avatar) => avatar.getBoundingClientRect().width))
    expect(sizes).toEqual([24, 32, 40])

    const dropdown = page.locator('[data-doc-preview-name="avatar-dropdown"]')
    const trigger = dropdown.getByRole("button", { name: "Open user menu" })
    await trigger.click()
    const menu = page.locator("body > [data-doc-avatar-menu]")
    await expect(menu).toBeVisible()
    await expect(menu).toHaveCSS("width", "128px")
    await expect(menu.getByRole("menuitem", { name: "Profile" })).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await expect(menu.getByRole("menuitem", { name: "Billing" })).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(menu).toHaveCount(0)
    await expect(trigger).toBeFocused()

    const rtl = page.locator('[data-doc-preview-name="avatar-rtl"]')
    await expect(rtl.locator('[data-slot="avatar-group-count"]')).toHaveText("+٣")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator(".doc-avatar-demo-layout")).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator('[data-slot="avatar-group-count"]')).toHaveText("+3")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-avatar-demo-layout")).toHaveAttribute("dir", "ltr")

    const expectedSources = [
      ["avatar-demo", "<AvatarGroup", "<AvatarBadge", "<AvatarGroupCount>+3"],
      ["avatar-basic", 'class="grayscale"'],
      ["avatar-badge", "<AvatarBadge", "bg-green-600"],
      ["avatar-badge-icon", "<PlusIcon />"],
      ["avatar-group", "<AvatarGroup", "@maxleiter"],
      ["avatar-group-count", "<AvatarGroupCount>+3"],
      ["avatar-group-count-icon", "<AvatarGroupCount><PlusIcon"],
      ["avatar-size", 'size="sm"', 'size="lg"'],
      ["avatar-dropdown", "<DropdownMenuTrigger asChild>", "Log out"],
      ["avatar-rtl", "$state<keyof typeof translations>", "translations[language]"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("badge docs match Fict variants, icons, colors, link, and RTL behavior", async ({ page }) => {
    await page.goto("/docs/components/fict/badge")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)
    for (let index = 0; index < 6; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(6).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const expectedBadgeCounts = [4, 5, 2, 2, 1, 5, 6]
    for (let index = 0; index < expectedBadgeCounts.length; index += 1) {
      const badges = previews.nth(index).locator('[data-slot="badge"]')
      await expect(badges).toHaveCount(expectedBadgeCounts[index])
      for (let badgeIndex = 0; badgeIndex < expectedBadgeCounts[index]; badgeIndex += 1) {
        await expect(badges.nth(badgeIndex)).toHaveCSS("height", "20px")
        await expect(badges.nth(badgeIndex)).toHaveCSS("border-radius", "26px")
      }
    }

    const iconPreview = page.locator('[data-doc-preview-name="badge-icon"]')
    await expect(iconPreview.locator("svg")).toHaveCount(2)
    await expect(iconPreview.locator("svg").first()).toHaveCSS("width", "12px")
    await expect(iconPreview.locator('[data-variant="secondary"]')).toHaveCSS("padding-left", "6px")
    await expect(iconPreview.locator('[data-variant="outline"]')).toHaveCSS("padding-right", "6px")

    const spinnerPreview = page.locator('[data-doc-preview-name="badge-spinner"]')
    await expect(spinnerPreview.locator(".doc-badge-spinner")).toHaveCount(2)

    const link = page.locator('[data-doc-preview-name="badge-link"] [data-slot="badge"]')
    await expect(link).toHaveJSProperty("tagName", "A")
    await expect(link).toHaveAttribute("href", "#link")
    await link.focus()
    await expect(link).toHaveCSS("border-color", "oklch(0.708 0 0)")
    await expect(link).toHaveCSS("box-shadow", /.+/)

    const colors = page.locator('[data-doc-preview-name="badge-colors"] [data-slot="badge"]')
    await expect(colors).toHaveCount(5)
    await expect(colors.nth(0)).toHaveCSS("background-color", "rgb(239, 246, 255)")
    await expect(colors.nth(4)).toHaveCSS("color", "rgb(185, 28, 28)")

    const rtl = page.locator('[data-doc-preview-name="badge-rtl"]')
    await expect(rtl.locator('[data-slot="badge"]').first()).toHaveText("شارة")
    await expect(rtl.locator(".doc-badge-rtl-preview")).toHaveCSS(
      "font-family",
      '"Noto Sans Arabic Variable", sans-serif',
    )
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator('[data-slot="badge"]').first()).toHaveText("תג")
    await expect(rtl.locator(".doc-badge-row")).toHaveAttribute("dir", "rtl")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator('[data-slot="badge"]').first()).toHaveText("Badge")
    await expect(rtl.locator(".doc-badge-row")).toHaveAttribute("dir", "ltr")

    const expectedSource = [
      ['badge-demo', ['variant="secondary"', 'variant="destructive"', 'variant="outline"']],
      ['badge-variants', ['variant="ghost"', '>Ghost</Badge>']],
      ['badge-icon', ['<VerifiedIcon />Verified', 'Bookmark<BookmarkIcon />']],
      ['badge-spinner', ['<Spinner data-icon="inline-start" />Deleting', 'Generating<Spinner data-icon="inline-end" />']],
      ['badge-link', ['<Badge asChild>', '<a href="#link">']],
      ['badge-colors', ['bg-blue-50 text-blue-700', 'bg-red-50 text-red-700']],
      ['badge-rtl', ["$state<keyof typeof translations>('ar')", 'variant="destructive"']],
    ] as const
    for (const [previewName, markers] of expectedSource) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole('button', { name: 'View Code' }).click()
      const source = preview.locator('[data-doc-preview-full-code]')
      for (const marker of markers) await expect(source).toContainText(marker)
      await expect(source).not.toContainText('import * as UI')
    }
  })

  test("breadcrumb docs match Fict trails, menus, separators, links, and RTL behavior", async ({ page }) => {
    await page.goto("/docs/components/fict/breadcrumb")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)
    for (let index = 0; index < 6; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(6).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const basic = page.locator('[data-doc-preview-name="breadcrumb-basic"]')
    await expect(basic.locator('[data-slot="breadcrumb-item"]')).toHaveCount(3)
    await expect(basic.locator('[data-slot="breadcrumb-separator"]')).toHaveCount(2)
    await expect(basic.locator('[data-slot="breadcrumb-list"]')).toHaveCSS("height", "20px")
    await expect(basic.getByText("Home", { exact: true })).toHaveCSS("font-weight", "400")
    await expect(basic.getByText("Home", { exact: true })).toHaveCSS("text-decoration-line", "none")
    await expect(basic.locator('[data-slot="breadcrumb-page"]')).toHaveAttribute("aria-current", "page")

    const demo = page.locator('[data-doc-preview-name="breadcrumb-demo"]')
    const demoTrigger = demo.getByRole("button", { name: "Toggle menu" })
    await expect(demoTrigger).toHaveCSS("width", "28px")
    await expect(demoTrigger).toHaveCSS("height", "28px")
    await demoTrigger.click()
    const demoMenu = demo.getByRole("menu")
    await expect(demoMenu).toBeVisible()
    await expect(demoMenu.getByRole("menuitem", { name: "Documentation" })).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await expect(demoMenu.getByRole("menuitem", { name: "Themes" })).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(demoMenu).toBeHidden()
    await expect(demoTrigger).toBeFocused()

    const customSeparator = page.locator('[data-doc-preview-name="breadcrumb-separator"]')
    await expect(customSeparator.locator('[data-slot="breadcrumb-separator"] svg').first()).toHaveCSS("width", "14px")
    await expect(customSeparator.locator('[data-slot="breadcrumb-separator"] circle')).toHaveCount(2)

    const dropdown = page.locator('[data-doc-preview-name="breadcrumb-dropdown"]')
    const dropdownTrigger = dropdown.getByRole("button", { name: "Components" })
    await expect(dropdownTrigger.locator("svg")).toHaveCSS("width", "14px")
    await dropdownTrigger.click()
    await expect(dropdown.getByRole("menuitem", { name: "Documentation" })).toBeFocused()
    await page.keyboard.press("Escape")

    const ellipsis = page.locator('[data-doc-preview-name="breadcrumb-ellipsis"]')
    await expect(ellipsis.locator('[data-slot="breadcrumb-ellipsis"]')).toHaveCSS("width", "20px")

    const rtl = page.locator('[data-doc-preview-name="breadcrumb-rtl"]')
    await expect(rtl.locator('[data-slot="breadcrumb-link"]')).toHaveText("الرئيسية")
    await expect(rtl.locator(".doc-breadcrumb-rtl-preview")).toHaveCSS(
      "font-family",
      '"Noto Sans Arabic Variable", sans-serif',
    )
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator('[data-slot="breadcrumb-link"]')).toHaveText("בית")
    await expect(rtl.locator('[data-slot="breadcrumb-page"]')).toHaveText("פירורי לחם")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator('[data-slot="breadcrumb"]')).toHaveAttribute("dir", "ltr")
    await expect(rtl.getByRole("button", { name: "Components" })).toBeVisible()

    const expectedSources = [
      ["breadcrumb-demo", "<DropdownMenuTrigger asChild>", "<BreadcrumbEllipsis />"],
      ["breadcrumb-basic", "<BreadcrumbLink href=\"#\">Components"],
      ["breadcrumb-separator", "<DotIcon />"],
      ["breadcrumb-dropdown", "<ChevronDownIcon />", "Documentation"],
      ["breadcrumb-ellipsis", "<BreadcrumbEllipsis />", 'href="/docs/components"'],
      ["breadcrumb-link", 'href="/components"'],
      ["breadcrumb-rtl", "$state<keyof typeof translations>", "פירורי לחם"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("button docs match Fict variants, sizes, icons, groups, links, and RTL behavior", async ({ page }) => {
    await page.goto("/docs/components/fict/button")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(15)
    for (let index = 0; index < 14; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(14).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="button-demo"]')
    await expectIntrinsicWidth(demo.getByRole("button", { name: "Button" }), 65.7188)
    await expect(demo.getByRole("button", { name: "Submit" })).toHaveCSS("width", "32px")
    await expect(demo.getByRole("button", { name: "Submit" })).toHaveCSS("padding", "0px")

    const sizes = page.locator('[data-doc-preview-name="button-size"] [data-slot="button"]')
    await expect(sizes).toHaveCount(8)
    const expectedSizes = [[82.2188, 24], [24, 24], [55.7656, 28], [28, 28], [69.9844, 32], [32, 32], [59.4219, 36], [36, 36]]
    for (let index = 0; index < expectedSizes.length; index += 1) {
      const rect = await sizes.nth(index).evaluate((element) => element.getBoundingClientRect())
      if (expectedSizes[index][0] === expectedSizes[index][1]) {
        expect(rect.width).toBe(expectedSizes[index][0])
      } else {
        await expectIntrinsicWidth(sizes.nth(index), expectedSizes[index][0])
      }
      expect(rect.height).toBe(expectedSizes[index][1])
    }
    const sizeCard = page.locator('[data-doc-preview-name="button-size"]')
    await sizeCard.getByRole("button", { name: "View Code" }).click()
    const sizeCode = sizeCard.locator("[data-doc-preview-full-code]")
    await expect(sizeCode).toContainText('size="xs"')
    await expect(sizeCode).toContainText('size="icon-xs"')
    await expect(sizeCode).toContainText('size="icon-lg"')
    await expect(sizeCode).not.toContainText("import * as UI")

    await expect(page.locator('[data-doc-preview-name="button-rounded"] [data-slot="button"]')).toHaveCSS("border-radius", "9999px")
    const spinnerButtons = page.locator('[data-doc-preview-name="button-spinner"] [data-slot="button"]')
    await expect(spinnerButtons).toHaveCount(2)
    await expect(spinnerButtons.first()).toBeDisabled()
    await expect(spinnerButtons.first().locator(".doc-button-spinner")).toHaveCSS("width", "16px")

    const group = page.locator('[data-doc-preview-name="button-group-demo"]')
    await expect(group.locator('[data-slot="button"]')).toHaveCount(5)
    await expect(group.getByRole("button", { name: "Archive" })).toHaveCSS("border-top-right-radius", "0px")
    await expect(group.getByRole("button", { name: "Report" })).toHaveCSS("border-top-left-radius", "0px")
    const more = group.getByRole("button", { name: "More Options" })
    await more.click()
    await expect(group.getByRole("menu")).toBeVisible()
    await expect(group.getByRole("menuitem", { name: "Mark as Read" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(group.getByRole("menu")).toBeHidden()

    const asChild = page.locator('[data-doc-preview-name="button-aschild"] [data-slot="button"]')
    await expect(asChild).toHaveJSProperty("tagName", "A")
    await expect(asChild).toHaveAttribute("href", "/login")
    await expect(asChild).toHaveCSS("color", "oklch(0.985 0 0)")
    const asChildCard = page.locator('[data-doc-preview-name="button-aschild"]')
    await asChildCard.getByRole("button", { name: "View Code" }).click()
    await expect(asChildCard.locator("[data-doc-preview-full-code]")).toContainText('<Button asChild><a href="/login">Login</a></Button>')

    const rtl = page.locator('[data-doc-preview-name="button-rtl"]')
    await expect(rtl.locator('[data-slot="button"]')).toHaveCount(5)
    await expectIntrinsicWidth(rtl.getByRole("button", { name: "زر" }), 32.625)
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByRole("button", { name: "כפתור" })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-button-row")).toHaveAttribute("dir", "ltr")
    await expect(rtl.getByRole("button", { name: "Submit" }).locator(".doc-button-rtl-arrow")).toHaveCSS("transform", "none")
  })

  test("button group docs match Fict geometry and composite interactions", async ({ page }) => {
    await page.goto("/docs/components/fict/button-group")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(12)
    for (let index = 0; index < 11; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(11).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="button-group-demo"]')
    await expectIntrinsicWidth(demo.locator('[data-slot="button-group"]').first(), 287.219)
    await demo.getByRole("button", { name: "More Options" }).click()
    await expect(demo.getByRole("menuitem", { name: "Mark as Read" })).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await expect(demo.getByRole("menuitem", { name: "Archive" })).toBeFocused()
    await page.keyboard.press("Escape")

    const orientation = page.locator('[data-doc-preview-name="button-group-orientation"] [data-slot="button-group"]')
    await expect(orientation).toHaveCSS("width", "32px")
    await expect(orientation).toHaveCSS("height", "64px")
    await expect(orientation).toHaveAttribute("data-orientation", "vertical")

    const sizeGroups = page.locator('[data-doc-preview-name="button-group-size"] [data-slot="button-group"]')
    await expect(sizeGroups).toHaveCount(3)
    await expectIntrinsicWidth(sizeGroups.nth(0), 202.078)
    await expectIntrinsicWidth(sizeGroups.nth(1), 227.453)
    await expectIntrinsicWidth(sizeGroups.nth(2), 220.891)

    const nested = page.locator('[data-doc-preview-name="button-group-nested"]')
    await expect(nested.locator('[data-slot="button-group"]').first()).toHaveCSS("width", "232px")
    await expect(nested.getByPlaceholder("Send a message...")).toHaveCSS("width", "190px")

    const separator = page.locator('[data-doc-preview-name="button-group-separator"]')
    await expect(separator.locator('[data-slot="button-group-separator"]')).toHaveCSS("width", "1px")
    await expectIntrinsicWidth(separator.locator('[data-slot="button-group"]'), 109.156)
    await expectIntrinsicWidth(page.locator('[data-doc-preview-name="button-group-split"] [data-slot="button-group"]'), 98.7188)

    const input = page.locator('[data-doc-preview-name="button-group-input"]')
    await expect(input.getByPlaceholder("Search...")).toHaveCSS("width", "192px")
    await expectIntrinsicWidth(input.getByRole("button", { name: "Search" }), 37)

    const voice = page.locator('[data-doc-preview-name="button-group-input-group"]')
    const voiceInput = voice.getByRole("textbox", { name: "Message" })
    const voiceToggle = voice.getByRole("button", { name: "Voice Mode" })
    await expectIntrinsicWidth(voice.locator('[data-slot="button-group"]').first(), 255.203)
    await voiceToggle.click()
    await expect(voiceToggle).toHaveAttribute("aria-pressed", "true")
    await expect(voiceInput).toBeDisabled()
    await expect(voiceInput).toHaveAttribute("placeholder", "Record and send audio...")

    const dropdown = page.locator('[data-doc-preview-name="button-group-dropdown"]')
    await expectIntrinsicWidth(dropdown.locator('[data-slot="button-group"]'), 100.234)
    await dropdown.getByRole("button", { name: "More follow options" }).click()
    await expect(dropdown.getByRole("menuitem", { name: "Mute Conversation" })).toBeFocused()
    await page.keyboard.press("Escape")

    const currency = page.locator('[data-doc-preview-name="button-group-select"]')
    await expectIntrinsicWidth(currency.locator('[data-slot="button-group"]').first(), 281.406)
    await currency.getByLabel("Currency").selectOption("€")
    await expect(currency.getByLabel("Currency")).toHaveValue("€")

    const popover = page.locator('[data-doc-preview-name="button-group-popover"]')
    await popover.getByRole("button", { name: "Open Popover" }).click()
    await expect(popover.getByRole("dialog", { name: "Start a new task with Copilot" })).toBeVisible()
    await expect(popover.getByPlaceholder("I need to...")).toBeVisible()
    await page.keyboard.press("Escape")

    const rtl = page.locator('[data-doc-preview-name="button-group-rtl"]')
    await expectIntrinsicWidth(rtl.locator('[data-slot="button-group"]').first(), 239.078)
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByRole("button", { name: "ארכיון" })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator('[data-slot="button-group"]').first()).toHaveAttribute("dir", "ltr")

    const expectedSources = [
      ["button-group-orientation", 'orientation="vertical"'],
      ["button-group-size", 'size="lg"'],
      ["button-group-separator", "<ButtonGroupSeparator />"],
      ["button-group-input", 'placeholder="Search..."'],
      ["button-group-input-group", "let voiceEnabled = $state(false)"],
      ["button-group-select", "let currency = $state('$')"],
      ["button-group-popover", "<PopoverContent"],
      ["button-group-rtl", "$state<keyof typeof translations>", "ארכיון", "وضع علامة كمقروء", "DropdownMenuItem variant=\"destructive\""],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("calendar docs match Fict geometry and date interactions", async ({ page }) => {
    await page.goto("/docs/components/fict/calendar")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    const calendars = page.locator('[data-slot="calendar"]')
    await expect(previews).toHaveCount(11)
    await expect(calendars).toHaveCount(11)

    const expectedSizes = [
      ["214px", "297.188px"],
      ["250px", "333.188px"],
      ["214px", "297.188px"],
      ["424px", "258.281px"],
      ["214px", "297.188px"],
      ["266px", "348.281px"],
      ["196px", "278.281px"],
      ["212px", "222.281px"],
      ["352px", "378.281px"],
      ["240px", "222.281px"],
      ["270px", "353.188px"],
    ]
    for (let index = 0; index < expectedSizes.length; index += 1) {
      await expect(calendars.nth(index)).toHaveCSS("width", expectedSizes[index][0])
      await expect(calendars.nth(index)).toHaveCSS("height", expectedSizes[index][1])
    }

    const demo = calendars.nth(0)
    const initialDate = await demo.locator('[aria-selected="true"]').getAttribute("data-date")
    expect(initialDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const [initialYear, initialMonth] = initialDate!.split("-").map(Number)
    await expect(demo.getByLabel("Choose the Month")).toHaveValue(String(initialMonth - 1))
    await expect(demo.getByLabel("Choose the Year")).toHaveValue(String(initialYear))
    await demo.getByRole("button", { name: "Go to the Next Month" }).click()
    const nextMonth = new Date(Date.UTC(initialYear, initialMonth, 1))
    const nextMonthValue = String(nextMonth.getUTCMonth())
    const nextYearValue = String(nextMonth.getUTCFullYear())
    await expect(demo.getByLabel("Choose the Month")).toHaveValue(nextMonthValue)
    await expect(demo.getByLabel("Choose the Year")).toHaveValue(nextYearValue)
    const targetDate = `${nextYearValue}-${String(Number(nextMonthValue) + 1).padStart(2, "0")}-12`
    await demo.locator(`[data-date="${targetDate}"]`).click()
    await expect(demo.locator('[aria-selected="true"]')).toHaveAttribute("data-date", targetDate)

    const range = calendars.nth(3)
    await expect(range.locator('[data-doc-calendar-day]')).toHaveCount(63)
    await expect(range.locator(".is-range-start")).toHaveAttribute("data-date", "2026-01-12")
    await expect(range.locator(".is-range-end")).toHaveAttribute("data-date", "2026-02-11")
    await expect(range.locator('[data-doc-calendar-nav="previous"]').first()).toBeVisible()
    await expect(range.locator('[data-doc-calendar-nav="next"]').last()).toBeVisible()
    await range.locator('[data-date="2026-01-20"]').click()
    await range.locator('[data-date="2026-02-05"]').click()
    await expect(range.locator(".is-range-start")).toHaveAttribute("data-date", "2026-01-20")
    await expect(range.locator(".is-range-end")).toHaveAttribute("data-date", "2026-02-05")

    const presets = calendars.nth(5)
    const presetDate = await page.evaluate(() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    })
    await page.locator('[data-doc-calendar-preset="7"]').click()
    await expect(presets.locator('[aria-selected="true"]')).toHaveAttribute("data-date", presetDate)
    const time = page.locator('[data-doc-preview-name="calendar-time"]')
    await expect(time.getByLabel("Start Time")).toHaveValue("10:30:00")
    await expect(time.getByLabel("End Time")).toHaveValue("12:30:00")
    await expect(calendars.nth(7).locator("button:disabled")).toHaveCount(15)
    await expect(calendars.nth(8).locator("small").first()).toHaveText(/\$1(?:00|20)/)
    await expect(calendars.nth(9).locator(".doc-calendar-week-number")).toHaveCount(4)

    const rtl = page.locator('[data-doc-preview-name="calendar-rtl"]')
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator(".doc-calendar-rtl-preview")).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator(".doc-calendar-weekday").first()).toHaveText("א")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-calendar-rtl-preview")).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator(".doc-calendar-weekday").first()).toHaveText("Su")

    const expectedSources = [
      ["calendar-demo", "$state(new Date())", 'captionLayout="dropdown"'],
      ["calendar-hijri", 'locale="fa-IR-u-ca-persian"', 'dir="rtl"'],
      ["calendar-basic", '<Calendar mode="single"'],
      ["calendar-range", "type CalendarDateRange", "numberOfMonths={2}"],
      ["calendar-caption", 'captionLayout="dropdown"'],
      ["calendar-presets", "['In a week', 7]", "month={() => month}"],
      ["calendar-time", 'value="10:30:00"', 'value="12:30:00"'],
      ["calendar-booked-dates", "Array.from({ length: 15 }", "disabled={bookedDates}"],
      ["calendar-custom-days", "dayContent={(day, modifiers) =>", "$120"],
      ["calendar-week-numbers", "showWeekNumber"],
      ["calendar-rtl", "$state<keyof typeof languages>", "locale={() => settings().locale}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("card docs match Fict layouts, fields, image, sizes, and RTL content", async ({ page }) => {
    await page.goto("/docs/components/fict/card")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    const cards = page.locator('[data-slot="card"]')
    await expect(previews).toHaveCount(4)
    await expect(cards).toHaveCount(4)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "480px")
    await expect(previews.nth(1).locator(".doc-component-preview-stage")).toHaveCSS("height", "384px")
    await expect(previews.nth(2).locator(".doc-component-preview-stage")).toHaveCSS("height", "512px")
    await expect(previews.nth(3).locator(".doc-component-preview-stage")).toHaveCSS("height", "544px")

    const expectedHeights = ["357px", "172.25px", "379px", "357px"]
    for (let index = 0; index < expectedHeights.length; index += 1) {
      await expect(cards.nth(index)).toHaveCSS("width", "384px")
      await expect(cards.nth(index)).toHaveCSS("height", expectedHeights[index])
    }

    const demo = cards.nth(0)
    await expect(demo.locator('[data-slot="card-header"]')).toHaveCSS("height", "66px")
    await expect(demo.locator('[data-slot="card-content"]')).toHaveCSS("height", "138px")
    await expect(demo.locator('[data-slot="card-footer"]')).toHaveCSS("height", "105px")
    await expect(demo.getByRole("button", { name: "Login", exact: true })).toHaveCSS("width", "352px")
    await demo.getByLabel("Email").fill("person@example.com")
    await expect(demo.getByLabel("Email")).toHaveValue("person@example.com")
    await demo.getByLabel("Password").fill("secret")
    await expect(demo.getByLabel("Password")).toHaveValue("secret")

    const small = cards.nth(1)
    await expect(small).toHaveAttribute("data-size", "sm")
    await expect(small.getByRole("button", { name: "Action" })).toHaveCSS("height", "32px")
    await expect(small.locator('[data-slot="card-footer"]')).toHaveCSS("border-top-width", "1px")

    const image = cards.nth(2)
    await expect(image.getByRole("img", { name: "Event cover" })).toHaveCSS("height", "216px")
    await expect(image.locator('[data-slot="badge"]')).toHaveText("Featured")
    await expect(image.getByRole("button", { name: "View Event" })).toBeVisible()

    const rtl = page.locator('[data-doc-preview-name="card-rtl"]')
    await expect(rtl.getByRole("button", { name: "تسجيل الدخول", exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByRole("heading", { name: "התחבר לחשבון שלך" })).toBeVisible()
    await expect(cards.nth(3)).toHaveAttribute("dir", "rtl")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.getByRole("heading", { name: "Login to your account" })).toBeVisible()
    await expect(cards.nth(3)).toHaveAttribute("dir", "ltr")

    const expectedSources = [
      ["card-demo", "<CardAction>", '<Input id="password" type="password"'],
      ["card-small", '<Card size="sm"', "Small Card"],
      ["card-image", '<Badge variant="secondary">Featured</Badge>', 'alt="Event cover"'],
      ["card-rtl", "$state<keyof typeof translations>", "התחבר לחשבון שלך"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("carousel docs match Fict geometry, controls, API, autoplay, and RTL", async ({ page }) => {
    await page.goto("/docs/components/fict/carousel")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    const carousels = page.locator('[data-slot="carousel"]')
    await expect(previews).toHaveCount(7)
    await expect(carousels).toHaveCount(7)
    const sizes = [
      ["320px", "352px"],
      ["384px", "149.328px"],
      ["384px", "157.328px"],
      ["320px", "266px"],
      ["320px", "352px"],
      ["320px", "352px"],
      ["320px", "352px"],
    ]
    for (let index = 0; index < sizes.length; index += 1) {
      await expect(carousels.nth(index)).toHaveCSS("width", sizes[index][0])
      await expect(carousels.nth(index)).toHaveCSS("height", sizes[index][1])
      await expect(carousels.nth(index).locator('[data-slot="carousel-item"]')).toHaveCount(5)
    }

    const demo = carousels.nth(0)
    const previous = demo.getByRole("button", { name: "Previous slide" })
    const next = demo.getByRole("button", { name: "Next slide" })
    await expect(previous).toBeDisabled()
    await next.click()
    await expect(demo).toHaveAttribute("data-carousel-index", "1")
    await expect(previous).toBeEnabled()
    await demo.focus()
    await page.keyboard.press("End")
    await expect(demo).toHaveAttribute("data-carousel-index", "4")
    await expect(next).toBeDisabled()
    await page.keyboard.press("Home")
    await page.keyboard.press("ArrowRight")
    await expect(demo).toHaveAttribute("data-carousel-index", "1")

    const orientation = carousels.nth(3)
    await orientation.focus()
    await page.keyboard.press("ArrowDown")
    await expect(orientation).toHaveAttribute("data-carousel-index", "1")
    await expect(orientation.locator(".doc-carousel-track")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -135)")

    const api = carousels.nth(4)
    await api.getByRole("button", { name: "Next slide" }).click()
    await expect(page.locator('[data-doc-preview-name="carousel-api"] [data-doc-carousel-status]')).toHaveText("Slide 2 of 5")

    const plugin = carousels.nth(5)
    await expect.poll(async () => Number(await plugin.getAttribute("data-carousel-index")), { timeout: 3000 }).toBeGreaterThan(0)

    const rtl = page.locator('[data-doc-preview-name="carousel-rtl"]')
    await expect(carousels.nth(6)).toHaveAttribute("dir", "rtl")
    await expect(carousels.nth(6).locator(".doc-carousel-card-content strong").first()).toHaveText("١")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(carousels.nth(6)).toHaveAttribute("dir", "ltr")
    await expect(carousels.nth(6).locator(".doc-carousel-card-content strong").first()).toHaveText("1")

    const expectedSources = [
      ["carousel-demo", "Array.from({ length: 5 }", '<CardContent class="flex aspect-square'],
      ["carousel-size", 'class="basis-1/2 lg:basis-1/3"'],
      ["carousel-spacing", 'class="-ml-1 gap-0"', 'class="basis-1/2 pl-1 lg:basis-1/3"'],
      ["carousel-orientation", 'orientation="vertical"', "<CarouselPrevious>↑</CarouselPrevious>"],
      ["carousel-api", "type CarouselApi", "next.on('select'", "Slide {current} of {count}"],
      ["carousel-plugin", "autoplayMs={2000} stopOnInteraction"],
      ["carousel-rtl", "$state<keyof typeof languages>", "opts={{ direction: settings().dir }}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("chart docs match Fict stages, progressive examples, tooltips, series, and RTL", async ({ page }) => {
    await page.goto("/docs/components/fict/chart")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    const charts = page.locator("[data-doc-chart]")
    await expect(previews).toHaveCount(8)
    await expect(charts).toHaveCount(7)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "438px")
    for (let index = 1; index <= 5; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "320px")
    }
    await expect(previews.nth(6).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(7).locator(".doc-component-preview-stage")).toHaveCSS("height", "432px")

    const demo = page.locator('[data-doc-preview-name="chart-demo"]')
    await expect(demo.locator('[data-slot="card"]')).toHaveCSS("width", "638px")
    await expect(demo.locator('[data-slot="card"]')).toHaveCSS("height", "438px")
    await expect(charts.nth(0)).toHaveCSS("width", "590px")
    await expect(charts.nth(0)).toHaveCSS("height", "250px")
    await expect(charts.nth(0).locator("[data-doc-chart-bar]")).toHaveCount(30)
    const firstBar = charts.nth(0).locator("[data-doc-chart-bar]").first()
    await firstBar.hover()
    await expect(charts.nth(0).getByRole("tooltip")).toContainText("Apr 1")
    await expect(charts.nth(0).getByRole("tooltip")).toContainText("222")
    const initialHeight = await firstBar.locator("rect").getAttribute("height")
    await demo.getByRole("button", { name: /Mobile/ }).click()
    await expect(demo.getByRole("button", { name: /Mobile/ })).toHaveAttribute("aria-pressed", "true")
    expect(await firstBar.locator("rect").getAttribute("height")).not.toBe(initialHeight)

    for (let index = 1; index <= 5; index += 1) {
      await expect(charts.nth(index)).toHaveCSS("width", "509px")
      await expect(charts.nth(index)).toHaveCSS("height", "286.312px")
      await expect(charts.nth(index).locator("[data-doc-chart-bar]")).toHaveCount(6)
    }
    await expect(charts.nth(1).locator(".doc-chart-grid line")).toHaveCount(0)
    await expect(charts.nth(2).locator(".doc-chart-grid line")).toHaveCount(5)
    await expect(charts.nth(2).locator(".doc-chart-axis text")).toHaveCount(0)
    await expect(charts.nth(3).locator(".doc-chart-axis text")).toHaveCount(6)
    await expect(charts.nth(5).locator(".doc-chart-legend span")).toHaveCount(2)
    await expect(page.locator('[data-doc-preview-name="chart-tooltip"] .doc-chart-tooltip-guide > div')).toHaveCount(4)

    const rtl = page.locator('[data-doc-preview-name="chart-rtl"]')
    await expect(charts.nth(6)).toHaveCSS("width", "558px")
    await expect(charts.nth(6)).toHaveAttribute("dir", "rtl")
    await expect(charts.nth(6).locator(".doc-chart-axis text").first()).toHaveText("يون")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(charts.nth(6)).toHaveAttribute("dir", "ltr")
    await expect(charts.nth(6).locator(".doc-chart-axis text").first()).toHaveText("Jun")

    const expectedSources = [
      ["chart-demo", "$state<'desktop' | 'mobile'>('desktop')", "showGrid showAxis showTooltip"],
      ["chart-example", "secondaryValue: 80"],
      ["chart-example-grid", "showGrid"],
      ["chart-example-axis", "showGrid showAxis"],
      ["chart-example-tooltip", "showGrid showAxis showTooltip"],
      ["chart-example-legend", "<ChartLegend items="],
      ["chart-tooltip", "<ChartTooltipContent", "Page Views"],
      ["chart-rtl", "$state<keyof typeof translations>('ar')", "dir={text().dir}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
      await expect(source).not.toContainText("<h3>Example")
    }
  })

  test("combobox docs match Fict controls, filtering, selection, keyboard, popup, and RTL", async ({ page }) => {
    await page.goto("/docs/components/fict/combobox")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(12)
    for (let index = 0; index < 11; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(11).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="combobox-demo"]')
    const demoInput = demo.getByRole("combobox")
    await expect(demo.locator('[data-slot="input-group"]')).toHaveCSS("width", "215.203px")
    await expect(demo.locator('[data-slot="input-group"]')).toHaveCSS("height", "32px")
    await demoInput.click()
    let panel = page.locator("[data-doc-combobox-panel]:visible")
    await expect(panel).toHaveCSS("width", "214px")
    await expect(panel).toHaveCSS("height", "148px")
    await expect(panel.getByRole("option")).toHaveCount(5)
    await expect(panel.locator("[data-highlighted]")).toHaveCount(0)
    await demoInput.fill("nuxt")
    await expect(panel.locator('[role="option"]:visible')).toHaveCount(1)
    await expect(panel.locator('[role="option"]:visible')).toHaveText("Nuxt.js")
    await demoInput.press("ArrowDown")
    await demoInput.press("Enter")
    await expect(demoInput).toHaveValue("Nuxt.js")
    await expect(panel).toBeHidden()

    const multiple = page.locator('[data-doc-preview-name="combobox-multiple"]')
    const multipleInput = multiple.getByRole("combobox")
    await expect(multiple.locator('[data-slot="combobox-chips"]')).toHaveCSS("width", "320px")
    await expect(multiple.locator("[data-doc-combobox-chip]")).toContainText("Next.js")
    await multipleInput.click()
    panel = page.locator("[data-doc-combobox-panel]:visible")
    await expect(panel).toHaveCSS("width", "320px")
    await expect(panel.locator("[data-highlighted]")).toContainText("Next.js")
    await panel.getByRole("option", { name: "SvelteKit" }).click()
    await expect(multiple.locator("[data-doc-combobox-chip]")).toHaveCount(2)
    await multiple.getByRole("button", { name: "Remove Next.js" }).click()
    await expect(multiple.locator("[data-doc-combobox-chip]")).toHaveCount(1)
    await page.keyboard.press("Escape")

    const clear = page.locator('[data-doc-preview-name="combobox-clear"]')
    await expect(clear.getByRole("combobox")).toHaveValue("Next.js")
    await clear.getByRole("button", { name: "Clear selection" }).click()
    await expect(clear.getByRole("combobox")).toHaveValue("")
    await expect(clear.getByRole("button", { name: "Clear selection" })).toBeHidden()
    await page.keyboard.press("Escape")

    const groups = page.locator('[data-doc-preview-name="combobox-groups"]')
    await groups.getByRole("combobox").click()
    panel = page.locator("[data-doc-combobox-panel]:visible")
    await expect(panel).toHaveCSS("height", "252px")
    await expect(panel.locator(".doc-combobox-group-label")).toHaveText(["Americas", "Europe", "Asia/Pacific"])
    await page.keyboard.press("Escape")

    const custom = page.locator('[data-doc-preview-name="combobox-custom"]')
    await custom.getByRole("combobox").click()
    panel = page.locator("[data-doc-combobox-panel]:visible")
    await expect(panel.getByRole("option").first()).toContainText("South America (ar)")
    await page.keyboard.press("Escape")

    await expect(page.locator('[data-doc-preview-name="combobox-invalid"] [data-slot="input-group"]')).toHaveCSS("border-top-color", "oklch(0.577 0.245 27.325)")
    await expect(page.locator('[data-doc-preview-name="combobox-disabled"] [role="combobox"]')).toBeDisabled()

    const auto = page.locator('[data-doc-preview-name="combobox-auto-highlight"]')
    await auto.getByRole("combobox").click()
    panel = page.locator("[data-doc-combobox-panel]:visible")
    await expect(panel.locator("[data-highlighted]")).toHaveText("Next.js")
    await page.keyboard.press("Escape")

    const popup = page.locator('[data-doc-preview-name="combobox-popup"]')
    await popup.getByRole("combobox").click()
    panel = page.locator("[data-doc-combobox-panel]:visible")
    await expect(panel).toHaveCSS("width", "284px")
    await expect(panel).toHaveCSS("height", "288px")
    await expect(panel.getByRole("combobox", { name: "Search countries" })).toBeFocused()
    await panel.getByRole("combobox", { name: "Search countries" }).fill("Japan")
    await expect(panel.locator('[role="option"]:visible')).toHaveCount(1)
    await panel.locator('[role="option"]:visible').click()
    await expect(popup.getByRole("combobox")).toContainText("Japan")

    await expect(page.locator('[data-doc-preview-name="combobox-input-group"] [data-slot="input-group"]')).toHaveCSS("width", "235.203px")

    const rtl = page.locator('[data-doc-preview-name="combobox-rtl"]')
    const rtlRoot = rtl.locator("[data-doc-combobox]")
    const rtlInput = rtl.locator("[data-doc-combobox-input]")
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await expect(rtlInput).toHaveAttribute("placeholder", "أضف فئات")
    await rtlInput.click()
    panel = page.locator("[data-doc-combobox-panel]:visible")
    await expect(panel).toHaveCSS("width", "320px")
    await expect(panel).toHaveCSS("height", "142.125px")
    await expect(panel.getByRole("option").first()).toHaveText("التكنولوجيا")
    await page.keyboard.press("Escape")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await expect(rtlInput).toHaveAttribute("placeholder", "הוסף קטגוריות")
    await expect(rtl.locator("[data-doc-combobox-chip]")).toContainText("טכנולוגיה")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlRoot).toHaveAttribute("dir", "ltr")
    await expect(rtlInput).toHaveAttribute("placeholder", "Add categories")
    await expect(rtl.locator("[data-doc-combobox-chip]")).toContainText("Technology")

    const expectedSources = [
      ["combobox-demo", "['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro']"],
      ["combobox-basic", '<ComboboxInput placeholder="Select a framework" />'],
      ["combobox-multiple", "multiple autoHighlight", "<ComboboxChip value={value}>"],
      ["combobox-clear", "showClear"],
      ["combobox-groups", "<ComboboxLabel>{group}</ComboboxLabel>", "<ComboboxSeparator />", "(GMT-3) São Paulo"],
      ["combobox-custom", "<ItemDescription>{description}</ItemDescription>", "South Korea", "Asia (kr)"],
      ["combobox-invalid", 'aria-invalid="true"'],
      ["combobox-disabled", "disabled />"],
      ["combobox-auto-highlight", "<Combobox autoHighlight>"],
      ["combobox-popup", '<ComboboxTrigger class="w-64">', 'aria-label="Search countries"', "New Zealand"],
      ["combobox-input-group", "<GlobeIcon />", "(GMT-5) Toronto"],
      ["combobox-rtl", "$state<keyof typeof translations>", "dir={text().dir}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("command docs match Fict geometry, filtering, dialogs, keyboard, scrolling, and RTL", async ({ page }) => {
    await page.goto("/docs/components/fict/command")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(6)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "392px")
    for (let index = 1; index <= 4; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(5).locator(".doc-component-preview-stage")).toHaveCSS("height", "456px")

    const demo = page.locator('[data-doc-preview-name="command-demo"]')
    const demoCommand = demo.locator("[data-doc-command]")
    const demoInput = demo.getByRole("textbox", { name: "Command search" })
    await expect(demoCommand).toHaveCSS("width", "384px")
    await expect(demoCommand).toHaveCSS("height", "312px")
    await expect(demo.locator("[data-doc-command-item]")).toHaveCount(6)
    await expect(demo.locator("[data-doc-command-item][data-highlighted]")).toContainText("Calendar")
    await expect(demo.getByRole("option", { name: "Calculator" })).toBeDisabled()
    await demoInput.fill("billing")
    await expect(demo.locator('[data-doc-command-item]:visible')).toHaveCount(1)
    await expect(demo.locator('[data-doc-command-item]:visible')).toContainText("Billing")
    await demoInput.fill("missing command")
    await expect(demo.locator("[data-doc-command-empty]")).toBeVisible()
    await demoInput.fill("")
    await demoInput.press("Home")
    await demoInput.press("ArrowDown")
    await demoInput.press("ArrowDown")
    await expect(demo.locator("[data-doc-command-item][data-highlighted]")).toContainText("Profile")

    const dialogExamples = [
      ["command-basic", "176px"],
      ["command-shortcuts", "176px"],
      ["command-groups", "309px"],
      ["command-scrollable", "332px"],
    ] as const
    for (const [name, height] of dialogExamples) {
      const preview = page.locator(`[data-doc-preview-name="${name}"]`)
      const trigger = preview.getByRole("button", { name: "Open Menu" })
      await trigger.click()
      const portal = page.locator("[data-doc-command-portal]:visible")
      const command = portal.locator("[data-doc-command]")
      await expect(portal).toHaveCount(1)
      await expect(command).toHaveCSS("width", "384px")
      await expect(command).toHaveCSS("height", height)
      await expect(command.getByRole("textbox", { name: "Command search" })).toBeFocused()
      if (name === "command-scrollable") {
        const list = command.locator("[data-doc-command-list]")
        await expect(list).toHaveCSS("height", "288px")
        expect(await list.evaluate((element) => element.scrollHeight)).toBeGreaterThan(288)
      }
      await page.keyboard.press("Escape")
      await expect(portal).toBeHidden()
      await expect(trigger).toBeFocused()
    }

    const rtl = page.locator('[data-doc-preview-name="command-rtl"]')
    const rtlCommand = rtl.locator("[data-doc-command]")
    const rtlInput = rtl.getByRole("textbox", { name: "Command search" })
    await expect(rtlCommand).toHaveAttribute("dir", "rtl")
    await expect(rtlInput).toHaveAttribute("placeholder", "اكتب أمرًا أو ابحث...")
    await expect(rtl.locator("[data-doc-command-item]").first()).toContainText("التقويم")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlCommand).toHaveAttribute("dir", "rtl")
    await expect(rtlInput).toHaveAttribute("placeholder", "הקלד פקודה או חפש...")
    await expect(rtl.locator("[data-doc-command-item]").first()).toContainText("לוח שנה")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlCommand).toHaveAttribute("dir", "ltr")
    await expect(rtlInput).toHaveAttribute("placeholder", "Type a command or search...")
    await expect(rtl.locator("[data-doc-command-item]").first()).toContainText("Calendar")

    const expectedSources = [
      ["command-demo", 'value="calculator" disabled', "Profile <span", "⌘P"],
      ["command-basic", "<CommandTrigger", "Open Menu"],
      ["command-shortcuts", "Profile <span", "⌘P"],
      ["command-groups", "<CommandSeparator />", "Billing"],
      ["command-scrollable", "Help & Support", "<CommandList class=\"max-h-72\">"],
      ["command-rtl", "$state<keyof typeof translations>", "הקלד פקודה או חפש..."],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("context menu docs match Fict triggers, items, state, submenus, placement, keyboard, and RTL", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", (error) => pageErrors.push(error.message))
    await page.goto("/docs/components/fict/context-menu")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(11)
    for (let index = 0; index < 10; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(10).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="context-menu-demo"]')
    const demoTrigger = demo.locator("[data-doc-context-trigger]")
    await expect(demoTrigger).toHaveCSS("width", "320px")
    await expect(demoTrigger).toHaveCSS("height", "180px")
    await demoTrigger.focus()
    await page.keyboard.press("Shift+F10")
    expect(pageErrors).toEqual([])
    let panel = page.locator("[data-doc-context-panel]:visible").first()
    await expect(panel).toHaveCount(1)
    await expect(panel).toHaveCSS("width", "192px")
    await expect(panel.getByRole("menuitem").first()).toContainText("Back")
    await expect(panel.getByRole("menuitem").first()).toBeFocused()
    await expect(panel.getByRole("menuitem", { name: /Forward/ })).toBeDisabled()
    await page.keyboard.press("ArrowDown")
    await expect(panel.getByRole("menuitem", { name: /Reload/ })).toBeFocused()
    const subTrigger = panel.getByRole("menuitem", { name: "More Tools" })
    await subTrigger.focus()
    await page.keyboard.press("ArrowRight")
    let submenu = page.locator('[data-doc-context-panel][data-doc-context-submenu="true"]:visible').first()
    await expect(submenu).toHaveCSS("min-width", "176px")
    await expect(submenu.getByRole("menuitem").first()).toHaveText("Save Page...")
    await expect(submenu.getByRole("menuitem").first()).toBeFocused()
    await page.keyboard.press("ArrowLeft")
    await expect(submenu).toBeHidden()
    await expect(subTrigger).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(panel).toBeHidden()
    await expect(demoTrigger).toBeFocused()

    const checkboxes = page.locator('[data-doc-preview-name="context-menu-checkboxes"]')
    const checkboxTrigger = checkboxes.locator("[data-doc-context-trigger]")
    await checkboxTrigger.click({ button: "right" })
    panel = page.locator("[data-doc-context-panel]:visible").first()
    await expect(panel.getByRole("menuitemcheckbox")).toHaveCount(3)
    await expect(panel.getByRole("menuitemcheckbox").nth(0)).toHaveAttribute("aria-checked", "true")
    await panel.getByRole("menuitemcheckbox").nth(1).click()
    await checkboxTrigger.click({ button: "right" })
    panel = page.locator("[data-doc-context-panel]:visible").first()
    await expect(panel.getByRole("menuitemcheckbox").nth(1)).toHaveAttribute("aria-checked", "true")
    await page.keyboard.press("Escape")

    const radio = page.locator('[data-doc-preview-name="context-menu-radio"]')
    const radioTrigger = radio.locator("[data-doc-context-trigger]")
    await radioTrigger.click({ button: "right" })
    panel = page.locator("[data-doc-context-panel]:visible").first()
    await expect(panel.getByRole("menuitemradio")).toHaveCount(5)
    await panel.getByRole("menuitemradio", { name: "Dark" }).click()
    await radioTrigger.click({ button: "right" })
    panel = page.locator("[data-doc-context-panel]:visible").first()
    await expect(panel.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true")
    await expect(panel.getByRole("menuitemradio", { name: "Light" })).toHaveAttribute("aria-checked", "false")
    await page.keyboard.press("Escape")

    await expect(page.locator('[data-doc-preview-name="context-menu-destructive"] .doc-context-item.is-destructive')).toContainText("Delete")
    await expect(page.locator('[data-doc-preview-name="context-menu-icons"] .doc-context-item > svg')).toHaveCount(4)
    await expect(page.locator('[data-doc-preview-name="context-menu-groups"] .doc-context-label')).toHaveText(["File", "Edit"])
    await expect(page.locator('[data-doc-preview-name="context-menu-shortcuts"] kbd')).toHaveText(["⌘[", "⌘]", "⌘R", "⌘S", "⇧⌘S"])

    const sides = page.locator('[data-doc-preview-name="context-menu-sides"]')
    await expect(sides.locator("[data-doc-context-trigger]")).toHaveCount(4)
    await expect(sides.locator("[data-doc-context-trigger]").first()).toHaveCSS("width", "184px")
    const topTrigger = sides.locator("[data-doc-context-trigger]").nth(0)
    await topTrigger.click({ button: "right", position: { x: 92, y: 50 } })
    panel = page.locator("[data-doc-context-panel]:visible").first()
    expect((await panel.boundingBox())!.y).toBeLessThan((await topTrigger.boundingBox())!.y + 50)
    await page.keyboard.press("Escape")

    const rtl = page.locator('[data-doc-preview-name="context-menu-rtl"]')
    const rtlTrigger = rtl.locator("[data-doc-context-trigger]")
    await expect(rtlTrigger).toContainText("انقر بزر الماوس الأيمن هنا")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlTrigger).toContainText("לחץ לחיצה ימנית כאן")
    await rtlTrigger.click({ button: "right" })
    panel = page.locator("[data-doc-context-panel]:visible").first()
    await expect(panel).toHaveAttribute("dir", "rtl")
    await expect(panel.getByRole("menuitem", { name: "ניווט" })).toBeVisible()
    await page.keyboard.press("Escape")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlTrigger).toContainText("Right click here")

    const expectedSources = [
      ["context-menu-demo", "<ContextMenuCheckboxItem", "<ContextMenuRadioGroup"],
      ["context-menu-submenu", "<ContextMenuSub>"],
      ["context-menu-shortcuts", "<ContextMenuShortcut>"],
      ["context-menu-groups", "<ContextMenuGroup>"],
      ["context-menu-radio", "let person = $state('pedro')"],
      ["context-menu-destructive", 'variant="destructive"'],
      ["context-menu-sides", 'side="right"'],
      ["context-menu-rtl", "$state<keyof typeof translations>", "ניווט", "ContextMenuCheckboxItem checked", "Colm Tuite"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("data table docs match Fict filtering, sorting, selection, visibility, menus, and RTL", async ({ page }) => {
    await page.goto("/docs/components/fict/data-table")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(2)
    const demoStage = previews.nth(0).locator(".doc-component-preview-stage")
    const rtlStage = previews.nth(1).locator(".doc-component-preview-stage")
    expect((await demoStage.boundingBox())!.height).toBeGreaterThan(450)
    expect((await rtlStage.boundingBox())!.height).toBeGreaterThan(400)

    const demo = page.locator('[data-doc-preview-name="data-table-demo"]')
    const rows = demo.locator("[data-doc-data-row]")
    const filter = demo.getByRole("textbox", { name: "Filter emails" })
    await expect(rows).toHaveCount(5)
    await expect(demo.locator("[data-doc-data-row]:visible")).toHaveCount(5)
    await expect(demo.locator("[data-doc-data-summary]")).toHaveText("0 of 5 row(s) selected.")
    await filter.fill("ken99")
    await expect(demo.locator("[data-doc-data-row]:visible")).toHaveCount(1)
    await expect(demo.locator("[data-doc-data-row]:visible")).toContainText("ken99@example.com")
    await filter.fill("missing")
    await expect(demo.locator("[data-doc-data-empty]")).toBeVisible()
    await expect(demo.locator("[data-doc-data-summary]")).toHaveText("0 of 0 row(s) selected.")
    await filter.fill("")

    await demo.getByRole("button", { name: /Email/ }).click()
    await expect(rows.first()).toContainText("Abe45@example.com")
    await demo.getByRole("button", { name: /Email/ }).click()
    await expect(rows.first()).toContainText("Silas22@example.com")

    const rowChecks = demo.getByRole("checkbox", { name: "Select row" })
    await rowChecks.nth(0).click()
    await expect(demo.locator("[data-doc-data-summary]")).toHaveText("1 of 5 row(s) selected.")
    await demo.getByRole("checkbox", { name: "Select all" }).click()
    await expect(demo.locator("[data-doc-data-summary]")).toHaveText("5 of 5 row(s) selected.")
    await expect(demo.locator('[data-doc-data-row][data-state="selected"]')).toHaveCount(5)

    await demo.getByRole("button", { name: /Columns/ }).click()
    const columnsPanel = page.locator(".doc-data-columns-panel:visible")
    await expect(columnsPanel.getByRole("menuitemcheckbox")).toHaveCount(3)
    await columnsPanel.getByRole("menuitemcheckbox", { name: /amount/ }).click()
    await expect(demo.locator('[data-doc-data-col="amount"]:visible')).toHaveCount(0)
    await expect(columnsPanel).toBeVisible()
    await columnsPanel.getByRole("menuitemcheckbox", { name: /amount/ }).click()
    await expect(demo.locator('[data-doc-data-col="amount"]:visible')).toHaveCount(6)
    await page.keyboard.press("Escape")

    await demo.getByRole("button", { name: "Open menu" }).first().click()
    const actionPanel = page.locator(".doc-data-action-panel:visible")
    await expect(actionPanel.getByRole("menuitem")).toHaveText(["Copy payment ID", "View customer", "View payment details"])
    await page.keyboard.press("Escape")
    await expect(demo.getByRole("button", { name: "Previous" })).toBeDisabled()
    await expect(demo.getByRole("button", { name: "Next" })).toBeDisabled()

    const rtl = page.locator('[data-doc-preview-name="data-table-rtl"]')
    const rtlRoot = rtl.locator("[data-doc-data-table]")
    const rtlFilter = rtl.getByRole("textbox", { name: "Filter emails" })
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await expect(rtlFilter).toHaveAttribute("placeholder", "تصفية البريد الإلكتروني...")
    await expect(rtl.locator('th[data-doc-data-col="status"]')).toContainText("الحالة")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await expect(rtlFilter).toHaveAttribute("placeholder", "סנן אימיילים...")
    await expect(rtl.locator('th[data-doc-data-col="status"]')).toContainText("סטטוס")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlRoot).toHaveAttribute("dir", "ltr")
    await expect(rtlFilter).toHaveAttribute("placeholder", "Filter emails...")
    await expect(rtl.locator('th[data-doc-data-col="status"]')).toContainText("Status")

    const expectedSources = [
      ["data-table-demo", "let selected = $state<string[]>([])", "DropdownMenuCheckboxItem", "Copy payment ID"],
      ["data-table-rtl", "$state<keyof typeof translations>", "סנן אימיילים...", "dir={text().dir}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const sourcePreview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await sourcePreview.getByRole("button", { name: "View Code" }).click()
      const source = sourcePreview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })


  test("dialog docs match Fict sizes, focus, close controls, scrolling, footer, and RTL", async ({ page }) => {
    await page.goto("/docs/components/fict/dialog")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(6)
    for (let index = 0; index < 5; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(5).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="dialog-demo"]')
    await demo.getByRole("button", { name: "View Code" }).click()
    const demoCode = demo.locator("[data-doc-preview-full-code]")
    await expect(demoCode).toContainText('<DialogContent class="sm:max-w-sm">')
    await expect(demoCode).toContainText("<DialogTrigger asChild>")
    await expect(demoCode).not.toContainText("import * as UI")
    const demoTrigger = demo.getByRole("button", { name: "Open Dialog" })
    await demoTrigger.click()
    let dialog = page.getByRole("dialog")
    await expect(dialog).toHaveCSS("width", "384px")
    await expect(dialog.getByRole("heading", { name: "Edit profile" })).toBeVisible()
    await expect(dialog.locator('input[value="Pedro Duarte"]')).toBeFocused()
    await expect(dialog.getByRole("button", { name: "Close" })).toBeVisible()
    await dialog.getByRole("button", { name: "Cancel" }).click()
    await expect(dialog).toBeHidden()
    await expect(demoTrigger).toBeFocused()

    const share = page.locator('[data-doc-preview-name="dialog-close-button"]')
    await share.getByRole("button", { name: "Share" }).click()
    dialog = page.getByRole("dialog")
    await expect(dialog).toHaveCSS("width", "448px")
    await expect(dialog.locator('input[value="https://ui.shadcn.com/docs/installation"]')).toHaveAttribute("readonly", "")
    await dialog.getByRole("button", { name: "Close", exact: true }).last().click()

    const noClose = page.locator('[data-doc-preview-name="dialog-no-close-button"]')
    const noCloseTrigger = noClose.getByRole("button", { name: "No Close Button" })
    await noCloseTrigger.click()
    dialog = page.getByRole("dialog")
    await expect(dialog).toHaveCSS("width", "512px")
    await expect(dialog.getByRole("button", { name: "Close" })).toHaveCount(0)
    await page.keyboard.press("Escape")
    await expect(noCloseTrigger).toBeFocused()

    const scrollable = page.locator('[data-doc-preview-name="dialog-scrollable-content"]')
    await scrollable.getByRole("button", { name: "Scrollable Content" }).click()
    dialog = page.getByRole("dialog")
    const scroll = dialog.locator("[data-doc-dialog-scroll]")
    await expect(scroll.locator("p")).toHaveCount(10)
    expect(await scroll.evaluate((element) => element.scrollHeight)).toBeGreaterThan(await scroll.evaluate((element) => element.clientHeight))
    await page.keyboard.press("Escape")

    const sticky = page.locator('[data-doc-preview-name="dialog-sticky-footer"]')
    await sticky.getByRole("button", { name: "Sticky Footer" }).click()
    dialog = page.getByRole("dialog")
    await expect(dialog.locator("footer")).toBeVisible()
    await expect(dialog.getByRole("button", { name: "Close", exact: true })).toHaveCount(2)
    await dialog.locator("footer").getByRole("button", { name: "Close" }).click()

    const rtl = page.locator('[data-doc-preview-name="dialog-rtl"]')
    const rtlTrigger = rtl.locator("[data-doc-dialog-trigger]")
    await expect(rtlTrigger).toContainText("فتح الحوار")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlTrigger).toContainText("פתח דיאלוג")
    await rtlTrigger.click()
    dialog = page.getByRole("dialog")
    await expect(dialog).toHaveAttribute("dir", "rtl")
    await expect(dialog.getByRole("heading")).toHaveText("ערוך פרופיל")
    await page.keyboard.press("Escape")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlTrigger).toContainText("Open Dialog")
  })

  test("drawer docs match Fict content, sides, drag, responsive dialog, and RTL behavior", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/docs/components/fict/drawer")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(5)
    for (let index = 0; index < 4; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(4).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="drawer-demo"]')
    const demoTrigger = demo.getByRole("button", { name: "Open Drawer" })
    await demoTrigger.click()
    let drawer = page.getByRole("dialog", { name: "Move Goal" })
    let box = await drawer.boundingBox()
    expect(box?.x).toBe(0)
    expect(box?.width).toBe(1280)
    expect(box?.height).toBe(439)
    expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(900)
    const bars = drawer.locator(".doc-drawer-chart span")
    await expect(bars).toHaveCount(13)
    await expect(bars.first()).toHaveCSS("width", "21px")
    expect(await bars.first().evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)")
    await expect(drawer.locator("[data-doc-drawer-goal]" )).toHaveText("350")
    const increase = drawer.getByRole("button", { name: "Increase" })
    for (let index = 0; index < 5; index += 1) await increase.click()
    await expect(drawer.locator("[data-doc-drawer-goal]")).toHaveText("400")
    await expect(increase).toBeDisabled()
    await drawer.getByRole("button", { name: "Cancel" }).click()
    await expect(demoTrigger).toBeFocused()

    await demoTrigger.click()
    drawer = page.getByRole("dialog", { name: "Move Goal" })
    const handle = drawer.locator(".doc-drawer-handle")
    const handleBox = await handle.boundingBox()
    await page.mouse.move((handleBox?.x ?? 0) + (handleBox?.width ?? 0) / 2, (handleBox?.y ?? 0) + 2)
    await page.mouse.down()
    await page.mouse.move((handleBox?.x ?? 0) + (handleBox?.width ?? 0) / 2, (handleBox?.y ?? 0) + 110, { steps: 5 })
    await page.mouse.up()
    await expect(drawer).toBeHidden()
    await expect(demoTrigger).toBeFocused()

    const scrollable = page.locator('[data-doc-preview-name="drawer-scrollable-content"]')
    await scrollable.getByRole("button", { name: "Scrollable Content" }).click()
    drawer = page.getByRole("dialog", { name: "Move Goal" })
    box = await drawer.boundingBox()
    expect(box?.width).toBe(384)
    expect(box?.x).toBe(896)
    const scroll = drawer.locator("[data-doc-drawer-scroll]")
    await expect(scroll.locator("p")).toHaveCount(10)
    expect(await scroll.evaluate((element) => element.scrollHeight)).toBeGreaterThan(await scroll.evaluate((element) => element.clientHeight))
    await page.keyboard.press("Escape")

    const sides = page.locator('[data-doc-preview-name="drawer-sides"]')
    for (const side of ["top", "right", "bottom", "left"]) {
      await sides.getByRole("button", { name: side, exact: true }).click()
      drawer = page.getByRole("dialog", { name: "Move Goal" })
      box = await drawer.boundingBox()
      if (side === "top" || side === "bottom") expect(box?.height).toBe(450)
      if (side === "left" || side === "right") expect(box?.width).toBe(384)
      if (side === "top" || side === "left") expect(side === "top" ? box?.y : box?.x).toBe(0)
      if (side === "bottom") expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(900)
      if (side === "right") expect(Math.round((box?.x ?? 0) + (box?.width ?? 0))).toBe(1280)
      await page.keyboard.press("Escape")
    }

    const responsive = page.locator('[data-doc-preview-name="drawer-dialog"]')
    await responsive.getByRole("button", { name: "Edit Profile" }).click()
    drawer = page.getByRole("dialog", { name: "Edit profile" })
    await expect(drawer).toHaveCSS("width", "425px")
    await expect(drawer.locator('input[value="shadcn@example.com"]')).toBeFocused()
    await expect(drawer.getByRole("button", { name: "Close" })).toBeVisible()
    await expect(drawer.getByRole("button", { name: "Cancel" })).toBeHidden()
    await page.keyboard.press("Escape")

    const rtl = page.locator('[data-doc-preview-name="drawer-rtl"]')
    const rtlTrigger = rtl.locator("[data-doc-drawer-trigger]")
    await expect(rtlTrigger).toContainText("فتح الدرج")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlTrigger).toContainText("פתח מגירה")
    await rtlTrigger.click()
    drawer = page.getByRole("dialog", { name: "הזז מטרה" })
    await expect(drawer).toHaveAttribute("dir", "rtl")
    await page.keyboard.press("Escape")
    await rtl.getByLabel("Preview language").selectOption("ar")
    await rtlTrigger.click()
    drawer = page.getByRole("dialog", { name: "نقل الهدف" })
    await expect(drawer.locator("[data-doc-drawer-goal]")).toHaveText("٣٥٠")
    await page.keyboard.press("Escape")

    await page.setViewportSize({ width: 390, height: 844 })
    await responsive.getByRole("button", { name: "Edit Profile" }).click()
    drawer = page.getByRole("dialog", { name: "Edit profile" })
    box = await drawer.boundingBox()
    expect(box?.x).toBe(0)
    expect(box?.width).toBe(390)
    expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(844)
    await expect(drawer.getByRole("button", { name: "Close" })).toBeHidden()
    await expect(drawer.getByRole("button", { name: "Cancel" })).toBeVisible()
    await drawer.getByRole("button", { name: "Cancel" }).click()

    const expectedSources = [
      ["drawer-demo", "let goal = $state(350)", "activity.map"],
      ["drawer-scrollable-content", '<Drawer direction="right">', "Array.from({ length: 10 }"],
      ["drawer-sides", "const sides = ['top', 'right', 'bottom', 'left'] as const", "<Drawer direction={side}>"],
      ["drawer-dialog", '<div class="hidden md:block">', '<div class="md:hidden">'],
      ["drawer-rtl", "$state<keyof typeof translations>('ar')", "goal.toLocaleString(text().locale)"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
      await expect(source).not.toContainText("Open Demo")
    }
  })

  test("dropdown menu docs match Fict geometry, state, submenus, keyboard, avatar, complex, and RTL behavior", async ({ page }) => {
    await page.goto("/docs/components/fict/dropdown-menu")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(13)
    for (let index = 0; index < 12; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(12).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="dropdown-menu-demo"]')
    const demoTrigger = demo.getByRole("button", { name: "Open" })
    await demoTrigger.click()
    let panel = demo.locator("[data-menu-panel]:visible").first()
    await expect(panel).toHaveCSS("width", "160px")
    await expect(panel).toHaveCSS("height", "339px")
    await expect(demo.getByRole("menuitem", { name: /Profile/ })).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await expect(demo.getByRole("menuitem", { name: /Billing/ })).toBeFocused()
    await page.keyboard.press("End")
    await expect(demo.getByRole("menuitem", { name: /Log out/ })).toBeFocused()
    await demo.getByRole("menuitem", { name: /Invite users/ }).hover()
    await expect(demo.locator(".doc-dropdown-sub-panel:visible")).toHaveCount(1)
    await expect(demo.getByRole("menuitem", { name: "Email" })).toBeFocused()
    await page.keyboard.press("ArrowLeft")
    await expect(demo.getByRole("menuitem", { name: /Invite users/ })).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(demoTrigger).toBeFocused()

    const submenu = page.locator('[data-doc-preview-name="dropdown-menu-submenu"]')
    await submenu.getByRole("button", { name: "Open" }).click()
    await submenu.getByRole("menuitem", { name: /Invite users/ }).hover()
    await expect(submenu.getByRole("menuitem", { name: /More options/ })).toBeVisible()
    await submenu.getByRole("menuitem", { name: /More options/ }).hover()
    await expect(submenu.getByRole("menuitem", { name: "Webhook" })).toBeVisible()
    await page.keyboard.press("Escape")

    const checkboxes = page.locator('[data-doc-preview-name="dropdown-menu-checkboxes"]')
    await checkboxes.getByRole("button", { name: "Open" }).click()
    let stateItem = checkboxes.locator('[role="menuitemcheckbox"]').filter({ hasText: "Panel" })
    await expect(stateItem).toHaveAttribute("aria-checked", "false")
    await stateItem.click()
    await expect(stateItem).toHaveAttribute("aria-checked", "true")
    await checkboxes.getByRole("button", { name: "Open" }).click()
    await expect(checkboxes.locator('[role="menuitemcheckbox"]').filter({ hasText: "Activity Bar" })).toBeDisabled()
    await expect(stateItem).toHaveAttribute("aria-checked", "true")
    await page.keyboard.press("Escape")

    const radios = page.locator('[data-doc-preview-name="dropdown-menu-radio-group"]')
    await radios.getByRole("button", { name: "Open" }).click()
    const topRadio = radios.locator('[role="menuitemradio"]').filter({ hasText: "Top" })
    const bottomRadio = radios.locator('[role="menuitemradio"]').filter({ hasText: "Bottom" })
    await expect(bottomRadio).toHaveAttribute("aria-checked", "true")
    await topRadio.click()
    await expect(topRadio).toHaveAttribute("aria-checked", "true")
    await expect(bottomRadio).toHaveAttribute("aria-checked", "false")

    const avatar = page.locator('[data-doc-preview-name="dropdown-menu-avatar"]')
    await expect(avatar.locator(".doc-dropdown-avatar-trigger")).toHaveCSS("width", "32px")
    await expect(avatar.locator(".doc-dropdown-avatar-trigger img")).toHaveAttribute("src", "/avatars/shadcn.jpg")
    await avatar.getByRole("button", { name: "Open account menu" }).click()
    await expect(avatar.getByRole("menuitem", { name: "Sign Out" })).toBeVisible()
    await page.keyboard.press("Escape")

    const complex = page.locator('[data-doc-preview-name="dropdown-menu-complex"]')
    await complex.getByRole("button", { name: "Complex Menu" }).click()
    panel = complex.locator("[data-menu-panel]:visible").first()
    await expect(panel).toHaveCSS("width", "176px")
    expect(await panel.evaluate((element) => element.scrollHeight)).toBeGreaterThan(await panel.evaluate((element) => element.clientHeight))
    await expect(complex.getByRole("menuitem", { name: /New File/ })).toBeVisible()
    await expect(complex.getByRole("menuitem", { name: /Sign Out/ })).toBeAttached()
    await page.keyboard.press("Escape")

    const rtl = page.locator('[data-doc-preview-name="dropdown-menu-rtl"]')
    const rtlTrigger = rtl.locator("[data-menu-trigger]").first()
    await expect(rtlTrigger).toContainText("افتح القائمة")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlTrigger).toContainText("פתח תפריט")
    await rtlTrigger.click()
    panel = rtl.locator("[data-menu-panel]:visible").first()
    await expect(panel).toHaveCSS("width", "144px")
    await expect(panel).toHaveAttribute("dir", "rtl")
    await expect(rtl.getByRole("menuitem", { name: /הזמן משתמשים/ })).toBeVisible()
    await page.keyboard.press("Escape")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlTrigger).toContainText("Open")
    await rtlTrigger.click()
    panel = rtl.locator("[data-menu-panel]:visible").first()
    await expect(panel).toHaveAttribute("dir", "ltr")
    await expect(rtl.getByRole("menuitem", { name: /Invite users/ })).toBeVisible()
    await page.keyboard.press("Escape")

    const expectedSources = [
      ["dropdown-menu-demo", "<DropdownMenuShortcut>"],
      ["dropdown-menu-submenu", "<DropdownMenuSub>"],
      ["dropdown-menu-checkboxes", "let panel = $state(false)"],
      ["dropdown-menu-radio-group", "let position = $state('bottom')"],
      ["dropdown-menu-checkboxes-icons", "Notification Preferences", "Push notifications"],
      ["dropdown-menu-radio-icons", "Select Payment Method", "Bank Transfer"],
      ["dropdown-menu-destructive", 'variant="destructive"'],
      ["dropdown-menu-avatar", "/avatars/shadcn.jpg"],
      ["dropdown-menu-complex", "New File", "Recent Projects", "Notification Types", "Sign Out"],
      ["dropdown-menu-rtl", "$state<keyof typeof translations>", "visibility = $state", "خطاف ويب", "הזמן משתמשים"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("empty docs match Fict layouts, media, actions, search, backgrounds, and RTL content", async ({ page }) => {
    await page.goto("/docs/components/fict/empty")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)
    for (let index = 0; index < 6; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "384px")
    }
    await expect(previews.nth(6).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="empty-demo"]')
    let empty = demo.locator('[data-slot="empty"]')
    await expect(empty).toHaveCSS("width", "638px")
    await expect(empty).toHaveCSS("height", "261.5px")
    await expect(demo.getByRole("heading", { name: "No Projects Yet" })).toBeVisible()
    await expect(demo.getByRole("button", { name: "Create Project" })).toHaveCSS("height", "32px")
    await expect(demo.getByRole("link", { name: /Learn More/ })).toBeVisible()

    const outline = page.locator('[data-doc-preview-name="empty-outline"]')
    empty = outline.locator('[data-slot="empty"]')
    await expect(empty).toHaveCSS("width", "558px")
    await expect(empty).toHaveCSS("height", "215.5px")
    await expect(empty).toHaveCSS("border-top-style", "dashed")
    await expect(outline.getByRole("button", { name: "Upload Files" })).toHaveCSS("height", "28px")

    const background = page.locator('[data-doc-preview-name="empty-background"] [data-slot="empty"]')
    await expect(background).toHaveCSS("width", "638px")
    await expect(background).toHaveCSS("height", "384px")
    expect(await background.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)")

    const avatar = page.locator('[data-doc-preview-name="empty-avatar"]')
    await expect(avatar.locator(".doc-empty-avatar")).toHaveCSS("width", "48px")
    await expect(avatar.locator('[data-slot="empty"]')).toHaveCSS("height", "229.5px")
    await expect(avatar.getByRole("button", { name: "Leave Message" })).toHaveCSS("height", "28px")

    const avatarGroup = page.locator('[data-doc-preview-name="empty-avatar-group"]')
    await expect(avatarGroup.locator(".doc-empty-avatar-group img")).toHaveCount(3)
    await expect(avatarGroup.locator(".doc-empty-avatar-group img").first()).toHaveCSS("width", "48px")
    await expect(avatarGroup.locator('[data-slot="empty"]')).toHaveCSS("height", "206.75px")

    const inputPreview = page.locator('[data-doc-preview-name="empty-input-group"]')
    const inputGroup = inputPreview.locator(".doc-empty-input-group")
    const input = inputPreview.getByRole("searchbox", { name: "Search pages" })
    await expect(inputGroup).toHaveCSS("width", "288px")
    await input.fill("installation")
    await expect(input).toHaveValue("installation")
    await expect(inputPreview.getByRole("link", { name: "Contact support" })).toBeVisible()

    const rtl = page.locator('[data-doc-preview-name="empty-rtl"]')
    empty = rtl.locator('[data-slot="empty"]')
    await expect(empty).toHaveCSS("width", "558px")
    await expect(empty).toHaveCSS("height", "238.75px")
    await expect(empty).toHaveAttribute("dir", "rtl")
    await expect(rtl.getByRole("heading", { name: "لا توجد مشاريع بعد" })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByRole("heading", { name: "אין פרויקטים עדיין" })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(empty).toHaveAttribute("dir", "ltr")
    await expect(rtl.getByRole("button", { name: "Create Project" })).toBeVisible()

    const expectedSources = [
      ["empty-demo", "No Projects Yet", "Create Project"],
      ["empty-outline", "Cloud Storage Empty", "Upload Files"],
      ["empty-background", "No Notifications"],
      ["empty-avatar", '<Avatar size="lg">', "User Offline"],
      ["empty-avatar-group", "<AvatarGroup>", "No Team Members"],
      ["empty-input-group", 'aria-label="Search pages"', "Contact support"],
      ["empty-rtl", "$state<keyof typeof translations>", "אין פרויקטים עדיין"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("field docs match all Fict layouts, control states, responsive behavior, and RTL content", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/field")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(13)
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")
    const expectedStageHeights = ["850px", "288px", "288px", "288px", "288px", "288px", "512px", "288px", "288px", "288px", "384px", "755.25px", "500px"]
    for (let index = 0; index < expectedStageHeights.length; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", expectedStageHeights[index])
    }

    const demo = page.locator('[data-doc-preview-name="field-demo"]')
    await expect(demo.locator(".doc-field-form")).toHaveCSS("width", "448px")
    await expect(demo.locator(".doc-field-form")).toHaveCSS("height", "595.25px")
    await expect(demo.getByPlaceholder("Evil Rabbit")).toBeVisible()
    await expect(demo.getByPlaceholder("1234 5678 9012 3456")).toBeVisible()
    const sameAsShipping = demo.getByRole("checkbox", { name: "Same as shipping address" })
    await expect(sameAsShipping).toHaveAttribute("aria-checked", "true")
    await demo.getByText("Same as shipping address", { exact: true }).click()
    await expect(sameAsShipping).toHaveAttribute("aria-checked", "false")
    const month = demo.getByRole("combobox", { name: "MM" })
    await month.click()
    await demo.getByRole("option", { name: "03", exact: true }).click()
    await expect(month.locator("[data-select-value]")).toHaveText("03")
    await expect(demo.getByRole("button", { name: "Submit" })).toHaveAttribute("type", "submit")

    const input = page.locator('[data-doc-preview-name="field-input"]')
    await expect(input.locator("fieldset")).toHaveCSS("width", "320px")
    await expect(input.locator("fieldset")).toHaveCSS("height", "192.5px")
    await input.getByLabel("Username").fill("evilrabbit")
    await expect(input.getByLabel("Username")).toHaveValue("evilrabbit")

    const textarea = page.locator('[data-doc-preview-name="field-textarea"]')
    await expect(textarea.locator("fieldset")).toHaveCSS("height", "120.25px")
    await expect(textarea.getByLabel("Feedback")).toHaveCSS("height", "64px")
    await textarea.getByLabel("Feedback").fill("Looks aligned")

    const select = page.locator('[data-doc-preview-name="field-select"]')
    await expect(select.locator(".doc-field")).toHaveCSS("height", "88.25px")
    await select.getByRole("combobox", { name: "Department" }).click()
    await select.getByRole("option", { name: "Engineering" }).click()
    await expect(select.locator("[data-select-value]")).toHaveText("Engineering")

    const slider = page.locator('[data-doc-preview-name="field-slider"]')
    await expect(slider.locator(".doc-field")).toHaveCSS("height", "64.25px")
    const minimum = slider.getByRole("slider", { name: "Minimum price" })
    await minimum.focus()
    await page.keyboard.press("ArrowRight")
    await expect(minimum).toHaveAttribute("aria-valuenow", "210")
    await expect(slider.locator('[data-slider-output="0"]')).toHaveText("210")

    await expect(page.locator('[data-doc-preview-name="field-fieldset"] fieldset')).toHaveCSS("height", "199.5px")
    await expect(page.locator('[data-doc-preview-name="field-checkbox"] > .doc-component-preview-stage .doc-field-group').first()).toHaveCSS("height", "321.25px")

    const radio = page.locator('[data-doc-preview-name="field-radio"]')
    await expect(radio.locator("fieldset")).toHaveCSS("height", "132.75px")
    await radio.getByRole("radio", { name: "Yearly ($99.99/year)" }).click()
    await expect(radio.getByRole("radio", { name: "Yearly ($99.99/year)" })).toHaveAttribute("aria-checked", "true")
    await expect(radio.getByRole("radio", { name: "Monthly ($9.99/month)" })).toHaveAttribute("aria-checked", "false")

    const switchPreview = page.locator('[data-doc-preview-name="field-switch"]')
    const authentication = switchPreview.getByRole("switch")
    await expectIntrinsicWidth(switchPreview.locator(".doc-field"), 216.094)
    await switchPreview.getByText("Multi-factor authentication", { exact: true }).click()
    await expect(authentication).toHaveAttribute("aria-checked", "true")

    const choice = page.locator('[data-doc-preview-name="field-choice-card"]')
    await expect(choice.locator("fieldset")).toHaveCSS("height", "195.5px")
    await choice.getByRole("radio", { name: "Virtual Machine" }).click()
    await expect(choice.locator('[data-radio-item]').last()).toHaveAttribute("data-checked", "true")
    await expect(choice.locator('[data-radio-item]').first()).toHaveAttribute("data-checked", "false")

    const group = page.locator('[data-doc-preview-name="field-group"]')
    await expect(group.locator(".doc-field-group").first()).toHaveCSS("height", "276.25px")
    await expect(group.getByRole("checkbox", { name: "Push notifications" }).first()).toBeDisabled()
    const emailTasks = group.getByRole("checkbox", { name: "Email notifications" })
    await group.getByText("Email notifications", { exact: true }).click()
    await expect(emailTasks).toHaveAttribute("aria-checked", "true")

    const rtl = page.locator('[data-doc-preview-name="field-rtl"]')
    await expect(rtl.locator(".doc-field-rtl-preview")).toHaveCSS("height", "691.25px")
    await expect(rtl.locator(".doc-field-rtl-preview")).toHaveCSS("padding-top", "24px")
    await expect(rtl.locator(".doc-field-form")).toHaveCSS("height", "595.25px")
    await expect(rtl.locator(".doc-field-payment")).toHaveAttribute("dir", "rtl")
    await expect(rtl.getByText("طريقة الدفع", { exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByText("אמצעי תשלום", { exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-field-payment")).toHaveAttribute("dir", "ltr")
    await expect(rtl.getByText("Payment Method", { exact: true })).toBeVisible()

    const responsive = page.locator('[data-doc-preview-name="field-responsive"]')
    await expect(responsive.locator(".doc-field-form")).toHaveCSS("width", "512px")
    await expect(responsive.locator(".doc-field-form")).toHaveCSS("height", "155.25px")
    await expect(responsive.locator(".doc-field.is-responsive").first()).toHaveCSS("flex-direction", "row")
    await page.setViewportSize({ width: 390, height: 844 })
    const responsiveField = responsive.locator(".doc-field.is-responsive").first()
    await expect(responsiveField).toHaveCSS("flex-direction", "column")
    const responsiveFieldBox = await responsiveField.boundingBox()
    const responsiveInputBox = await responsive.getByLabel("Name").boundingBox()
    expect(responsiveInputBox?.width).toBe(responsiveFieldBox?.width)

    const expectedSources = [
      ["field-demo", "<FieldLegend>Payment Method</FieldLegend>", "Enter your 16-digit card number", "'11', '12'"],
      ["field-input", "Choose a unique username for your account."],
      ["field-textarea", "Your feedback helps us improve..."],
      ["field-select", "Engineering", "Customer Support"],
      ["field-slider", "$state([200, 800])", "max={1000}"],
      ["field-fieldset", "Address Information", "90502"],
      ["field-checkbox", "Hard disks", "Sync Desktop &amp; Documents folders", "You can access them from other devices."],
      ["field-radio", "Yearly ($99.99/year)"],
      ["field-switch", "Multi-factor authentication"],
      ["field-choice-card", "Run GPU workloads on a K8s cluster."],
      ["field-group", "Get notified when ChatGPT responds"],
      ["field-rtl", "$state<keyof typeof translations>", "אמצעי תשלום", "أدخل رقم البطاقة المكون من 16 رقمًا", "CVV"],
      ["field-responsive", 'orientation="responsive"', "Provide your full name for identification"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      await expect(source).not.toContainText("Fict field composition.")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("form docs render the real Fict field and matching source", async ({ page }) => {
    await page.goto("/docs/components/fict/form")
    await waitForClientReady(page)

    const preview = page.locator('[data-doc-preview-name="form-demo"]')
    await expect(preview).not.toContainText("Registry preview surface")
    const form = preview.locator("[data-doc-form]")
    await expect(form).toBeVisible()
    await expect(form.getByLabel("Username")).toHaveAttribute("name", "username")
    await expect(form.getByLabel("Username")).toHaveAttribute("placeholder", "fict-user")
    await expect(form).toContainText("This is your public display name.")

    await preview.getByRole("button", { name: "View Code" }).click()
    const source = preview.locator("[data-doc-preview-full-code]")
    await expect(source).toContainText('<FormField name="username">')
    await expect(source).toContainText("<FormMessage />")
  })

  test("range calendar docs render the configured Fict months and matching source", async ({ page }) => {
    await page.goto("/docs/components/fict/range-calendar")
    await waitForClientReady(page)

    const preview = page.locator('[data-doc-preview-name="range-calendar-demo"]')
    await expect(preview).not.toContainText("Registry preview surface")
    const calendar = preview.locator("[data-doc-range-calendar]")
    await expect(calendar.locator("[data-doc-calendar]")).toHaveAttribute("data-calendar-mode", "range")
    await expect(calendar.locator("[data-doc-calendar-caption]")).toHaveText(["August 2026", "September 2026"])
    await expect(calendar.locator('[aria-selected="true"]')).toHaveCount(0)

    await preview.getByRole("button", { name: "View Code" }).click()
    const source = preview.locator("[data-doc-preview-full-code]")
    await expect(source).toContainText("startMonth={new Date(2026, 7, 1)}")
    await expect(source).toContainText("endMonth={new Date(2026, 8, 1)}")
  })

  test("toast docs render the real Fict toast and matching source", async ({ page }) => {
    await page.goto("/docs/components/fict/toast")
    await waitForClientReady(page)

    const preview = page.locator('[data-doc-preview-name="toast-demo"]')
    await expect(preview).not.toContainText("Registry preview surface")
    const toast = preview.locator("[data-doc-toast-preview]")
    await expect(toast).toHaveAttribute("role", "status")
    await expect(toast).toContainText("Event created")
    await expect(toast).toContainText("Sunday, August 29 at 9:00 AM")
    await expect(toast.getByRole("button", { name: "Undo" })).toBeVisible()

    await preview.getByRole("button", { name: "View Code" }).click()
    const source = preview.locator("[data-doc-preview-full-code]")
    await expect(source).toContainText("<ToastTitle>Event created</ToastTitle>")
    await expect(source).toContainText('<ToastAction altText="Undo">Undo</ToastAction>')
  })

  test("hover card docs match Fict delays, geometry, sides, pointer transit, focus, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/hover-card")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(3)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "320px")
    await expect(previews.nth(1).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    await expect(previews.nth(2).locator(".doc-component-preview-stage")).toHaveCSS("height", "384px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="hover-card-demo"]').first()
    const trigger = demo.getByRole("button", { name: "Hover Here" })
    await trigger.hover()
    let popup = page.locator("[data-doc-hover-content]:visible")
    await expect(popup).toContainText("@fictjs")
    await expect(popup).toHaveCSS("width", "256px")
    await expect(popup).toHaveCSS("height", "104px")
    await page.waitForTimeout(120)
    const triggerBox = await trigger.boundingBox()
    let popupBox = await popup.boundingBox()
    expect(popupBox?.x).toBeCloseTo((triggerBox?.x ?? 0) + ((triggerBox?.width ?? 0) - (popupBox?.width ?? 0)) / 2 + 4, 3)
    expect(popupBox?.y).toBeCloseTo((triggerBox?.y ?? 0) + (triggerBox?.height ?? 0) + 4, 3)

    await popup.hover()
    await page.waitForTimeout(125)
    await expect(popup).toBeVisible()
    await page.mouse.move(10, 10)
    await expect(popup).toBeHidden({ timeout: 500 })

    await trigger.focus()
    await expect(popup).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(popup).toBeHidden()

    const sides = page.locator('[data-doc-preview-name="hover-card-sides"]')
    for (const side of ["Left", "Top", "Bottom", "Right"]) {
      const sideTrigger = sides.getByRole("button", { name: side, exact: true })
      await sideTrigger.hover()
      popup = page.locator("[data-doc-hover-content]:visible")
      await expect(popup).toContainText(`This hover card appears on the ${side.toLowerCase()} side`)
      await expect(popup).toHaveAttribute("data-side", side.toLowerCase())
      await page.waitForTimeout(120)
      const sideTriggerBox = await sideTrigger.boundingBox()
      popupBox = await popup.boundingBox()
      if (side === "Left") expect((popupBox?.x ?? 0) + (popupBox?.width ?? 0)).toBeCloseTo((sideTriggerBox?.x ?? 0) - 4, 3)
      if (side === "Right") expect(popupBox?.x).toBeCloseTo((sideTriggerBox?.x ?? 0) + (sideTriggerBox?.width ?? 0) + 4, 3)
      if (side === "Top") expect((popupBox?.y ?? 0) + (popupBox?.height ?? 0)).toBeCloseTo((sideTriggerBox?.y ?? 0) - 4, 3)
      if (side === "Bottom") expect(popupBox?.y).toBeCloseTo((sideTriggerBox?.y ?? 0) + (sideTriggerBox?.height ?? 0) + 4, 3)
      await page.mouse.move(10, 10)
      await expect(popup).toBeHidden({ timeout: 500 })
    }

    const rtl = page.locator('[data-doc-preview-name="hover-card-rtl"]')
    await expect(rtl.locator(".doc-hover-rtl-preview")).toHaveCSS("height", "320px")
    await expect(rtl.getByRole("button", { name: "بداية السطر" })).toBeVisible()
    let logicalTrigger = rtl.getByRole("button", { name: "بداية السطر" })
    await logicalTrigger.hover()
    popup = page.locator("[data-doc-hover-content]:visible")
    await expect(popup).toHaveAttribute("data-side", "inline-start")
    await expect(popup).toHaveAttribute("dir", "rtl")
    await page.waitForTimeout(120)
    let logicalTriggerBox = await logicalTrigger.boundingBox()
    popupBox = await popup.boundingBox()
    expect(popupBox?.x).toBeCloseTo((logicalTriggerBox?.x ?? 0) + (logicalTriggerBox?.width ?? 0) + 4, 3)
    await page.mouse.move(10, 10)
    await expect(popup).toBeHidden({ timeout: 500 })

    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByRole("button", { name: "תחילת השורה" })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    logicalTrigger = rtl.getByRole("button", { name: "Inline Start" })
    await logicalTrigger.hover()
    popup = page.locator("[data-doc-hover-content]:visible")
    await expect(popup).toHaveAttribute("dir", "ltr")
    await expect(popup).toContainText("Wireless Headphones")
    await page.waitForTimeout(120)
    logicalTriggerBox = await logicalTrigger.boundingBox()
    popupBox = await popup.boundingBox()
    expect((popupBox?.x ?? 0) + (popupBox?.width ?? 0)).toBeCloseTo((logicalTriggerBox?.x ?? 0) - 4, 3)

    const expectedSources = [
      ["hover-card-demo", "<HoverCard openDelay={10} closeDelay={100}>", "<strong>@fictjs</strong>"],
      ["hover-card-sides", "const sides = ['left', 'top', 'bottom', 'right'] as const", "<HoverCardContent side={side}>"],
      ["hover-card-rtl", "'inline-start', 'inline-end'", "$state<keyof typeof translations>('ar')"],
    ] as const
    await page.mouse.move(10, 10)
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`).first()
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("input docs match all Fict layouts, states, groups, form controls, focus, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/input")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(15)
    for (let index = 0; index < 13; index += 1) await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(13).locator(".doc-component-preview-stage")).toHaveCSS("height", "512px")
    await expect(previews.nth(14).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="input-demo"]')
    await expect(demo.locator(".doc-field")).toHaveCSS("width", "320px")
    await expect(demo.locator(".doc-field")).toHaveCSS("height", "88.25px")
    const apiKey = demo.getByLabel("API Key")
    await expect(apiKey).toHaveAttribute("type", "password")
    await apiKey.fill("sk-secret")
    await expect(apiKey).toHaveValue("sk-secret")
    await expectFocusRing(apiKey)

    const basic = page.locator('[data-doc-preview-name="input-basic"]')
    await expect(basic.getByPlaceholder("Enter text")).toHaveCSS("width", "320px")
    await expect(basic.getByPlaceholder("Enter text")).toHaveCSS("height", "32px")

    const field = page.locator('[data-doc-preview-name="input-field"]')
    await expect(field.locator(".doc-field")).toHaveCSS("height", "88.25px")
    await field.getByLabel("Username").fill("evilrabbit")

    const fieldGroup = page.locator('[data-doc-preview-name="input-fieldgroup"]')
    await expect(fieldGroup.locator(".doc-field-group")).toHaveCSS("height", "219.5px")
    await expect(fieldGroup.getByRole("button", { name: "Reset" })).toHaveAttribute("type", "reset")
    await expect(fieldGroup.getByRole("button", { name: "Submit" })).toHaveAttribute("type", "submit")

    const disabled = page.locator('[data-doc-preview-name="input-disabled"]')
    await expect(disabled.getByLabel("Email")).toBeDisabled()
    await expect(disabled.locator(".doc-field-label")).toHaveCSS("opacity", "0.5")

    const invalid = page.locator('[data-doc-preview-name="input-invalid"]')
    const invalidInput = invalid.getByLabel("Invalid Input")
    await expect(invalidInput).toHaveAttribute("aria-invalid", "true")
    await expect(invalidInput).toHaveCSS("box-shadow", /3px/)
    expect(await invalid.locator(".doc-field-label").evaluate((element) => getComputedStyle(element).color)).not.toBe(await field.locator(".doc-field-label").evaluate((element) => getComputedStyle(element).color))

    const file = page.locator('[data-doc-preview-name="input-file"]')
    const fileInput = file.getByLabel("Picture")
    await fileInput.setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer: Buffer.from("png") })
    expect(await fileInput.evaluate((element) => (element as HTMLInputElement).files?.[0]?.name)).toBe("avatar.png")

    const inline = page.locator('[data-doc-preview-name="input-inline"]')
    await expect(inline.locator(".doc-field")).toHaveCSS("height", "32px")
    await expectIntrinsicWidth(inline.getByRole("searchbox", { name: "Search" }), 243.75)
    await inline.getByRole("searchbox", { name: "Search" }).fill("components")

    const grid = page.locator('[data-doc-preview-name="input-grid"]')
    await expect(grid.locator(".doc-field-group")).toHaveCSS("width", "384px")
    await expect(grid.locator(".doc-field").first()).toHaveCSS("width", "182px")
    await expect(grid.locator(".doc-field").first()).toHaveCSS("height", "59.25px")

    const required = page.locator('[data-doc-preview-name="input-required"]')
    await expect(required.getByLabel(/Required Field/)).toHaveAttribute("required", "")
    await expect(required.locator(".doc-input-required")).toHaveText("*")

    const badge = page.locator('[data-doc-preview-name="input-badge"]')
    await expect(badge.locator(".doc-field")).toHaveCSS("height", "60px")
    await expect(badge.locator(".doc-input-badge")).toHaveCSS("height", "20px")

    const inputGroup = page.locator('[data-doc-preview-name="input-input-group"]')
    const website = inputGroup.getByLabel("Website URL")
    await expect(inputGroup.locator(".ui-input-group")).toHaveCSS("width", "320px")
    await expectIntrinsicWidth(website, 235.797)
    await inputGroup.getByText("https://", { exact: true }).click()
    await expect(website).toBeFocused()
    await expectFocusRing(website, inputGroup.locator(".ui-input-group"))

    const buttonGroup = page.locator('[data-doc-preview-name="input-button-group"]')
    await expect(buttonGroup.locator(".doc-input-button-group")).toHaveCSS("width", "320px")
    await expectIntrinsicWidth(buttonGroup.getByPlaceholder("Type to search..."), 252.75)
    await expect(buttonGroup.getByRole("button", { name: "Search" })).toHaveCSS("height", "32px")

    const form = page.locator('[data-doc-preview-name="input-form"]')
    await expect(form.locator("form")).toHaveCSS("width", "384px")
    await expect(form.locator("form")).toHaveCSS("height", "378px")
    await form.getByRole("combobox", { name: "Country" }).click()
    await form.getByRole("option", { name: "Canada" }).click()
    await expect(form.locator("[data-select-value]")).toHaveText("Canada")
    await form.getByLabel("Name").fill("Evil Rabbit")
    await form.getByRole("button", { name: "Submit" }).click()
    await expect(page).toHaveURL(/\/docs\/components\/fict\/input$/)

    const rtl = page.locator('[data-doc-preview-name="input-rtl"]')
    const rtlField = rtl.locator(".doc-field")
    await expect(rtlField).toHaveCSS("width", "320px")
    await expect(rtlField).toHaveCSS("height", "88.25px")
    await expect(rtlField).toHaveAttribute("dir", "rtl")
    await expect(rtl.getByText("مفتاح API", { exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByText("מפתח API", { exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlField).toHaveAttribute("dir", "ltr")
    await expect(rtl.getByText("Your API key is encrypted and stored securely.", { exact: true })).toBeVisible()

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(disabled.getByLabel("Email")).toBeDisabled()
    await expect(invalidInput).toHaveAttribute("aria-invalid", "true")

    const expectedSources = [
      ["input-demo", 'type="password" placeholder="sk-..."'],
      ["input-fieldgroup", '<Button type="reset" variant="outline">'],
      ["input-disabled", "disabled"],
      ["input-invalid", "aria-invalid"],
      ["input-file", 'type="file"'],
      ["input-required", "required"],
      ["input-badge", '<Badge variant="secondary"'],
      ["input-input-group", "<InputGroupAddon>https://</InputGroupAddon>"],
      ["input-button-group", "<ButtonGroup>"],
      ["input-form", '<SelectItem value="ca">Canada</SelectItem>'],
      ["input-rtl", "$state<keyof typeof translations>", "מפתח ה-API שלך מוצפן"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("input group docs match Fict alignment, content, controls, focus, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/input-group")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(14)
    const stageHeights = [416, 192, 192, 384, 416, 320, 320, 288, 160, 224, 320, 384, 224, 544]
    for (let index = 0; index < stageHeights.length; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", `${stageHeights[index]}px`)
    }
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="input-group-demo"]')
    await expect(demo.locator('[data-slot="input-group"]')).toHaveCSS("width", "320px")
    await expect(demo.locator('[data-slot="input-group"]')).toHaveCSS("height", "32px")
    await expect(demo.getByText("12 results", { exact: true })).toBeVisible()

    for (const name of ["inline-start", "inline-end"]) {
      const preview = page.locator(`[data-doc-preview-name="input-group-${name}"]`)
      await expect(preview.locator(".doc-input-group-field")).toHaveCSS("width", "384px")
      await expect(preview.locator(".doc-input-group-field")).toHaveCSS("height", "88.25px")
      const control = preview.getByLabel("Input")
      await preview.locator('[data-slot="input-group-addon"]').click()
      await expect(control).toBeFocused()
      await expectFocusRing(control, preview.locator('[data-slot="input-group"]'))
    }

    const blockStart = page.locator('[data-doc-preview-name="input-group-block-start"]')
    await expect(blockStart.locator(".doc-input-group-align-stack")).toHaveCSS("height", "306.5px")
    await expect(blockStart.locator('[data-slot="input-group"]').nth(0)).toHaveCSS("height", "70px")
    await expect(blockStart.locator('[data-slot="input-group"]').nth(1)).toHaveCSS("height", "104px")
    await expect(blockStart.getByPlaceholder("console.log('Hello, world!');")).toHaveCSS("font-family", /monospace/)

    const blockEnd = page.locator('[data-doc-preview-name="input-group-block-end"]')
    await expect(blockEnd.locator(".doc-input-group-align-stack")).toHaveCSS("height", "314.5px")
    await expect(blockEnd.locator('[data-slot="input-group"]').nth(0)).toHaveCSS("height", "70px")
    await expect(blockEnd.locator('[data-slot="input-group"]').nth(1)).toHaveCSS("height", "112px")

    const icon = page.locator('[data-doc-preview-name="input-group-icon"]')
    await expect(icon.locator('[data-slot="input-group"]')).toHaveCount(4)
    await expect(icon.locator(".doc-input-group-stack")).toHaveCSS("height", "200px")
    const text = page.locator('[data-doc-preview-name="input-group-text"]')
    await expect(text.locator(".doc-input-group-stack")).toHaveCSS("height", "264px")
    await expect(text.locator('[data-slot="input-group"]').last()).toHaveCSS("height", "96px")

    const buttons = page.locator('[data-doc-preview-name="input-group-button"]')
    await expect(buttons.locator(".doc-input-group-stack")).toHaveCSS("height", "144px")
    await buttons.getByRole("button", { name: "Copy" }).click()
    await expect(buttons.getByRole("button", { name: "Copied" })).toHaveAttribute("data-copied", "true")
    const favorite = buttons.getByRole("button", { name: "Favorite" })
    await favorite.click()
    await expect(favorite).toHaveAttribute("data-active", "true")
    const info = buttons.getByRole("button", { name: "Info" })
    await info.click()
    await expect(buttons.getByRole("dialog")).toBeVisible()
    await expect(buttons.getByRole("dialog")).toContainText("Your connection is not secure.")
    await page.keyboard.press("Escape")
    await expect(buttons.getByRole("dialog")).toBeHidden()

    const kbd = page.locator('[data-doc-preview-name="input-group-kbd"]')
    await expect(kbd.locator('[data-slot="input-group"]')).toHaveCSS("width", "384px")
    await expect(kbd.locator("kbd")).toHaveText("⌘K")
    const dropdown = page.locator('[data-doc-preview-name="input-group-dropdown"]')
    await expect(dropdown.locator(".doc-input-group-stack")).toHaveCSS("height", "80px")
    await expect(dropdown.getByRole("button", { name: "More" })).toBeHidden()
    await expect(dropdown.getByRole("button", { name: "Search In..." })).toBeHidden()

    const spinner = page.locator('[data-doc-preview-name="input-group-spinner"]')
    await expect(spinner.locator('[data-slot="input-group"]')).toHaveCount(4)
    await expect(spinner.locator("input:disabled")).toHaveCount(4)
    await expect(spinner.locator(".ui-spinner").first()).toHaveCSS("animation-name", "ui-spin")

    const code = page.locator('[data-doc-preview-name="input-group-textarea"]')
    await expect(code.locator('[data-slot="input-group"]')).toHaveCSS("width", "448px")
    await expect(code.locator('[data-slot="input-group"]')).toHaveCSS("height", "292px")
    await expect(code.getByRole("button", { name: "Run" })).toHaveCSS("height", "32px")
    const custom = page.locator('[data-doc-preview-name="input-group-custom"]')
    const autoTextarea = custom.getByPlaceholder("Autoresize textarea...")
    await expect(custom.locator('[data-slot="input-group"]')).toHaveCSS("height", "112px")
    await autoTextarea.fill("Line one\nLine two\nLine three\nLine four")
    expect((await custom.locator('[data-slot="input-group"]').boundingBox())?.height).toBeGreaterThan(112)

    const rtl = page.locator('[data-doc-preview-name="input-group-rtl"]')
    await expect(rtl.locator(".doc-input-group-stack")).toHaveCSS("width", "384px")
    await expect(rtl.locator(".doc-input-group-stack")).toHaveCSS("height", "336.25px")
    await expect(rtl.locator('[data-slot="input-group"]').last()).toHaveCSS("height", "112px")
    const rtlSearch = rtl.getByPlaceholder("بحث...", { exact: true })
    await expect(rtlSearch).toHaveAttribute("dir", "rtl")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByPlaceholder("חפש...", { exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.getByPlaceholder("Search...", { exact: true })).toHaveAttribute("dir", "ltr")
    await expect(rtl.getByText("Footer positioned below the textarea.", { exact: true })).toBeVisible()

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(demo.locator('[data-slot="input-group"]')).toHaveCSS("height", "32px")
    await expect(spinner.locator("input:disabled")).toHaveCount(4)

    const expectedSources = [
      ["input-group-demo", "12 results"],
      ["input-group-inline-end", 'type="password"'],
      ["input-group-block-start", 'align="block-start"'],
      ["input-group-block-end", 'align="block-end"'],
      ["input-group-text", "120 characters left"],
      ["input-group-button", "let copied = $state(false)"],
      ["input-group-kbd", "⌘K"],
      ["input-group-spinner", "<Spinner"],
      ["input-group-textarea", "script.js"],
      ["input-group-custom", 'placeholder="Autoresize textarea..."'],
      ["input-group-rtl", "$state<keyof typeof translations>", "כותרת תחתונה ממוקמת"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("input otp docs match Fict slots, patterns, states, form, keyboard input, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/input-otp")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(10)
    for (let index = 0; index < 8; index += 1) await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(8).locator(".doc-component-preview-stage")).toHaveCSS("height", "480px")
    await expect(previews.nth(9).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="input-otp-demo"]')
    const demoInput = demo.locator('[data-slot="input-otp"]')
    await expect(demoInput).toHaveCSS("width", "192px")
    await expect(demo.locator('[data-slot="input-otp-group"]')).toHaveCSS("width", "192px")
    await expect(demo.locator('[data-slot="input-otp-slot"]')).toHaveCount(6)
    await expect(demo.locator('[data-slot="input-otp-slot"]')).toHaveText(["1", "2", "3", "4", "5", "6"])
    await demoInput.fill("654321")
    await expect(demo.locator('[data-slot="input-otp-slot"]')).toHaveText(["6", "5", "4", "3", "2", "1"])
    await expect(demo.locator('[data-slot="input-otp-slot"][data-active="true"]')).toHaveCount(1)

    const pattern = page.locator('[data-doc-preview-name="input-otp-pattern"]')
    await expect(pattern.locator(".doc-input-otp-pattern")).toHaveCSS("height", "59.25px")
    const patternInput = pattern.getByLabel("Digits Only")
    await patternInput.fill("12a34")
    await expect(patternInput).toHaveValue("1234")
    await expect(pattern.locator('[data-slot="input-otp-slot"]')).toHaveText(["1", "2", "3", "4", "", ""])

    const separated = page.locator('[data-doc-preview-name="input-otp-separator"]')
    await expect(separated.locator('[data-slot="input-otp"]')).toHaveCSS("width", "224px")
    await expect(separated.locator('[data-slot="input-otp-group"]')).toHaveCount(3)
    await expect(separated.locator('[data-slot="input-otp-group"]').first()).toHaveCSS("width", "64px")
    await expect(separated.locator(".doc-input-otp-separator")).toHaveCount(2)

    const disabled = page.locator('[data-doc-preview-name="input-otp-disabled"]')
    await expect(disabled.locator('[data-slot="input-otp"]')).toBeDisabled()
    await expect(disabled.locator("[data-doc-input-otp]")).toHaveCSS("width", "208px")
    await expect(disabled.locator("[data-doc-input-otp]")).toHaveCSS("opacity", "0.5")

    const controlled = page.locator('[data-doc-preview-name="input-otp-controlled"]')
    const controlledInput = controlled.locator('[data-slot="input-otp"]')
    await expect(controlled.locator(".doc-input-otp-controlled")).toHaveCSS("width", "196.453px")
    await expect(controlled.getByText("Enter your one-time password.", { exact: true })).toBeVisible()
    await controlledInput.fill("123")
    await expect(controlled.getByText("You entered: 123", { exact: true })).toBeVisible()

    const invalid = page.locator('[data-doc-preview-name="input-otp-invalid"]')
    await expect(invalid.locator('[data-slot="input-otp-slot"]')).toHaveCount(6)
    await expect(invalid.locator('[data-slot="input-otp-slot"]').first()).toHaveAttribute("aria-invalid", "true")
    await expect(invalid.locator('[data-slot="input-otp-group"]').first()).toHaveCSS("box-shadow", /3px/)

    const four = page.locator('[data-doc-preview-name="input-otp-four-digits"]')
    const fourInput = four.locator('[data-slot="input-otp"]')
    await expect(fourInput).toHaveAttribute("maxlength", "4")
    await fourInput.fill("12345")
    await expect(fourInput).toHaveValue("1234")
    await expect(four.locator('[data-slot="input-otp-group"]')).toHaveCSS("width", "128px")

    const alphanumeric = page.locator('[data-doc-preview-name="input-otp-alphanumeric"]')
    const alphaInput = alphanumeric.locator('[data-slot="input-otp"]')
    await alphaInput.fill("aB-12")
    await expect(alphaInput).toHaveValue("aB12")
    await expect(alphanumeric.locator('[data-slot="input-otp-slot"]')).toHaveText(["a", "B", "1", "2", "", ""])

    const form = page.locator('[data-doc-preview-name="input-otp-form"]')
    await expect(form.locator(".doc-input-otp-card")).toHaveCSS("width", "336px")
    await expect(form.locator(".doc-input-otp-card")).toHaveCSS("height", "316px")
    await expect(form.locator('[data-slot="input-otp"]')).toHaveCSS("width", "304px")
    await expect(form.locator('[data-slot="input-otp-slot"]').first()).toHaveCSS("width", "44px")
    await expect(form.locator('[data-slot="input-otp-slot"]').first()).toHaveCSS("height", "48px")
    await form.getByLabel("Verification code").fill("438921")
    await form.getByRole("button", { name: "Verify" }).click()
    await expect(page).toHaveURL(/\/docs\/components\/fict\/input-otp$/)

    const rtl = page.locator('[data-doc-preview-name="input-otp-rtl"]')
    await expect(rtl.locator(".doc-input-otp-rtl-field")).toHaveCSS("width", "320px")
    const rtlInput = rtl.locator('[data-slot="input-otp"]')
    await expect(rtlInput).toHaveCSS("width", "320px")
    await expect(rtlInput).toHaveAttribute("dir", "rtl")
    const rtlSlots = rtl.locator('[data-slot="input-otp-slot"]')
    expect((await rtlSlots.nth(0).boundingBox())?.x).toBeGreaterThan((await rtlSlots.nth(5).boundingBox())?.x ?? 0)
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByText("קוד אימות", { exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.getByText("Verification code", { exact: true })).toBeVisible()
    await expect(rtlInput).toHaveAttribute("dir", "ltr")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(invalid.locator('[data-slot="input-otp-group"]').first()).toHaveCSS("box-shadow", /3px/)

    const expectedSources = [
      ["input-otp-demo", 'defaultValue="123456" maxLength={6}'],
      ["input-otp-pattern", "pattern={/^[0-9]$/}"],
      ["input-otp-separator", "<InputOTPSeparator />"],
      ["input-otp-disabled", '<InputOTP disabled defaultValue="123456"'],
      ["input-otp-controlled", "$state('')", "value={() => value}", "You entered: ${value}"],
      ["input-otp-invalid", 'aria-invalid="true"'],
      ["input-otp-four-digits", "maxLength={4}"],
      ["input-otp-alphanumeric", "pattern={/^[a-zA-Z0-9]$/}"],
      ["input-otp-form", "<CardTitle>Verify your login</CardTitle>", "<InputOTP required value={() => code}"],
      ["input-otp-rtl", "$state<keyof typeof translations>", "dir={text().dir}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("item docs match Fict layouts, variants, media, links, dropdown, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/item")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(11)
    const stageHeights = [288, 384, 384, 288, 288, 288, 384, 384, 288, 288, 352]
    for (let index = 0; index < stageHeights.length; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS(
        "height",
        `${stageHeights[index]}px`,
      )
    }
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const expectBox = async (locator: ReturnType<typeof page.locator>, width: number, height: number) => {
      const box = await locator.boundingBox()
      await expectIntrinsicWidth(locator, width)
      expect(box?.height).toBeCloseTo(height, 2)
    }

    const demo = page.locator('[data-doc-preview-name="item-demo"]')
    const demoItems = demo.locator('[data-slot="item"]')
    await expectBox(demo.locator(".doc-item-stack"), 448, 132.25)
    await expectBox(demoItems.nth(0), 448, 66.25)
    await expectBox(demoItems.nth(1), 448, 42)
    await expect(demoItems.nth(0)).toHaveClass(/is-outline/)
    await expect(demo.getByRole("button", { name: "Action" })).toHaveCSS("height", "28px")
    await expect(demoItems.nth(1)).toHaveAttribute("href", "#")
    await expect(demoItems.nth(1)).toHaveCSS("text-decoration-line", "none")

    const variants = page.locator('[data-doc-preview-name="item-variant"]')
    await expectBox(variants.locator(".doc-item-stack"), 448, 246.75)
    await expect(variants.locator('[data-slot="item"]')).toHaveCount(3)
    await expect(variants.locator('[data-slot="item"]').nth(0)).toHaveClass(/is-default/)
    await expect(variants.locator('[data-slot="item"]').nth(1)).toHaveClass(/is-outline/)
    await expect(variants.locator('[data-slot="item"]').nth(2)).toHaveClass(/is-muted/)

    const sizes = page.locator('[data-doc-preview-name="item-size"]')
    const sizeItems = sizes.locator('[data-slot="item"]')
    await expectBox(sizes.locator(".doc-item-stack"), 448, 235.75)
    await expectBox(sizeItems.nth(0), 448, 66.25)
    await expectBox(sizeItems.nth(1), 448, 66.25)
    await expectBox(sizeItems.nth(2), 448, 55.25)

    const icon = page.locator('[data-doc-preview-name="item-icon"]')
    await expectBox(icon.locator('[data-slot="item"]'), 512, 66.25)
    await expectBox(icon.locator(".doc-item-media.is-icon"), 32, 32)
    await expect(icon.getByRole("button", { name: "Review" })).toBeVisible()

    const avatar = page.locator('[data-doc-preview-name="item-avatar"]')
    await expectBox(avatar.locator(".doc-item-stack"), 512, 156.5)
    await expect(avatar.locator('[data-slot="item"]')).toHaveCount(2)
    await expectBox(avatar.locator(".doc-item-avatar.is-large"), 40, 40)
    await expect(avatar.locator(".doc-item-avatar.is-large")).toHaveAttribute(
      "src",
      "https://github.com/evilrabbit.png",
    )
    await expect(avatar.locator(".doc-item-avatar-group img")).toHaveCount(3)
    await expect(avatar.getByRole("button", { name: "Invite" })).toHaveCount(2)

    const image = page.locator('[data-doc-preview-name="item-image"]')
    await expectBox(image.locator(".doc-item-stack"), 448, 230.75)
    const imageStageBox = await image.locator(".doc-component-preview-stage").boundingBox()
    const imageStackBox = await image.locator(".doc-item-stack").boundingBox()
    expect((imageStackBox?.y ?? 0) - (imageStageBox?.y ?? 0)).toBeCloseTo(28.625, 2)
    await expect(image.locator('[data-slot="item"]')).toHaveCount(3)
    await expectBox(image.locator(".doc-item-song-image").first(), 40, 40)
    await expect(image).toContainText("Midnight City Lights - Electric Nights")
    await expect(image).toContainText("Neon Dreams")
    await expect(image).toContainText("3:45")

    const group = page.locator('[data-doc-preview-name="item-group"]')
    await expectBox(group.locator(".doc-item-stack"), 384, 230.75)
    await expect(group.locator('[data-slot="item"]')).toHaveCount(3)
    await expect(group).toContainText("shadcn@vercel.com")

    const header = page.locator('[data-doc-preview-name="item-header"]')
    await expectBox(header.locator(".doc-item-header-grid"), 558, 246.578125)
    const headerItems = header.locator('[data-slot="item"]')
    await expect(headerItems).toHaveCount(3)
    await expectBox(headerItems.first(), 175.328125, 246.578125)
    await expect(header.locator(".doc-item-header img")).toHaveCount(3)

    const links = page.locator('[data-doc-preview-name="item-link"]')
    await expectBox(links.locator(".doc-item-stack"), 448, 148.5)
    await expect(links.locator('a[data-slot="item"]')).toHaveCount(2)
    await expect(links.locator('a[data-slot="item"]').nth(1)).toHaveAttribute("target", "_blank")
    await expect(links.locator('a[data-slot="item"]').nth(1)).toHaveAttribute("rel", "noopener noreferrer")

    const dropdown = page.locator('[data-doc-preview-name="item-dropdown"]')
    const trigger = dropdown.getByRole("button", { name: "Select" })
    await expectBox(trigger, 86.296875, 32)
    await trigger.click()
    const menu = dropdown.getByRole("menu")
    await expect(menu).toBeVisible()
    await expect(menu.getByRole("menuitem")).toHaveCount(3)
    await expect(menu).toContainText("evilrabbit@vercel.com")
    await page.keyboard.press("Escape")
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()

    const rtl = page.locator('[data-doc-preview-name="item-rtl"]')
    const rtlStack = rtl.locator(".doc-item-stack")
    await expectBox(rtlStack, 448, 132.25)
    await expect(rtlStack).toHaveAttribute("dir", "rtl")
    await expect(rtl.getByText("عنصر أساسي", { exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByText("פריט בסיסי", { exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.getByText("Basic Item", { exact: true })).toBeVisible()
    await expect(rtlStack).toHaveAttribute("dir", "ltr")

    const expectedSources = [
      ["item-demo", "Your profile has been verified.", "asChild"],
      ["item-variant", "Muted Variant", "variant={variant}"],
      ["item-size", "Extra Small Size", "size={size}"],
      ["item-icon", "New login detected from unknown device."],
      ["item-avatar", "https://github.com/evilrabbit.png", "<AvatarGroup>"],
      ["item-image", "Midnight City Lights", "Neon Dreams"],
      ["item-group", "shadcn@vercel.com"],
      ["item-header", "Everyday tasks and UI generation.", "<ItemHeader>"],
      ["item-link", 'rel="noopener noreferrer"'],
      ["item-dropdown", '<DropdownMenuContent align="end">', "evilrabbit@vercel.com"],
      ["item-rtl", "$state<keyof typeof translations>", "פריט בסיסי"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      await expect(source).not.toContainText("A composable Fict list item.")
      for (const marker of markers) await expect(source).toContainText(marker)
    }

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(variants.locator('[data-slot="item"]').nth(2)).not.toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    )
    await expect(demoItems.nth(0)).toHaveCSS("border-top-width", "1px")
  })

  test("item docs preserve Fict wrapping and media at mobile widths", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/docs/components/fict/item")
    await waitForClientReady(page)

    const demo = page.locator('[data-doc-preview-name="item-demo"]')
    const demoItems = demo.locator('[data-slot="item"]')
    await expect(demo.locator(".doc-component-preview-stage")).toHaveCSS("width", "340px")
    await expect(demo.locator(".doc-item-stack")).toHaveCSS("width", "260px")
    await expect(demoItems.nth(0)).toHaveCSS("height", "87.25px")
    await expect(demoItems.nth(1)).toHaveCSS("height", "60.5px")
    await expect(demoItems.nth(1).locator(".doc-item-title")).toHaveCSS("height", "38.5px")

    const variants = page.locator('[data-doc-preview-name="item-variant"] [data-slot="item"]')
    await expect(variants).toHaveCount(3)
    for (let index = 0; index < 3; index += 1) {
      await expect(variants.nth(index)).toHaveCSS("width", "260px")
      await expect(variants.nth(index)).toHaveCSS("height", "87.25px")
    }

    const avatar = page.locator('[data-doc-preview-name="item-avatar"]')
    await expect(avatar.locator(".doc-item-avatar-group img").nth(0)).toBeHidden()
    await expect(avatar.locator(".doc-item-avatar-group img").nth(1)).toBeHidden()
    await expect(avatar.locator(".doc-item-avatar-group img").nth(2)).toBeVisible()

    const headerItems = page.locator(
      '[data-doc-preview-name="item-header"] [data-slot="item"]',
    )
    await expect(headerItems).toHaveCount(3)
    for (let index = 0; index < 3; index += 1) {
      await expect(headerItems.nth(index)).toHaveCSS("width", "76px")
      await expect(headerItems.nth(index)).toHaveCSS("height", "166.5px")
    }
  })

  test("label docs match Fict geometry, association, checkbox interaction, field reuse, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/label")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(3)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(1).locator(".doc-component-preview-stage")).toHaveCSS("height", "704px")
    await expect(previews.nth(2).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="label-demo"]')
    const root = demo.locator(".doc-label-demo")
    const checkbox = demo.getByRole("checkbox")
    const label = demo.locator(".doc-label-text")
    await expectIntrinsicWidth(root, 211.453)
    await expect(root).toHaveCSS("height", "16px")
    await expect(checkbox).toHaveCSS("width", "16px")
    await expect(checkbox).toHaveCSS("height", "16px")
    await expectIntrinsicWidth(label, 187.453)
    await expect(label).toHaveCSS("height", "16px")
    await expect(label).toHaveAttribute("for", "label-terms")
    await expect(checkbox).toHaveAttribute("id", "label-terms")
    await expect(checkbox).toHaveAttribute("aria-checked", "false")
    await label.click()
    await expect(checkbox).toHaveAttribute("aria-checked", "true")
    await checkbox.focus()
    await page.keyboard.press("Space")
    await expect(checkbox).toHaveAttribute("aria-checked", "false")

    const field = page.locator('[data-doc-preview-name="field-demo"]')
    await expect(field.locator(".doc-field-form")).toHaveCSS("width", "448px")
    await expect(field.locator(".doc-field-form")).toHaveCSS("height", "595.25px")
    await expect(field.getByRole("textbox")).toHaveCount(4)
    await expect(field).not.toContainText("Registry preview surface")

    const rtl = page.locator('[data-doc-preview-name="label-rtl"]')
    const rtlRoot = rtl.locator(".doc-label-demo")
    await expectIntrinsicWidth(rtlRoot, 147.922)
    await expect(rtlRoot).toHaveCSS("height", "16px")
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await expect(rtl.getByText("قبول الشروط والأحكام", { exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByText("קבל תנאים והגבלות", { exact: true })).toBeVisible()
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.getByText("Accept terms and conditions", { exact: true })).toBeVisible()
    await expect(rtlRoot).toHaveAttribute("dir", "ltr")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await checkbox.focus()
    await page.keyboard.press("Shift+Tab")
    await page.keyboard.press("Tab")
    await expect(checkbox).toBeFocused()
    await expect(checkbox).toHaveCSS("box-shadow", /3px/)

    for (const [previewName, markers] of [
      ["label-demo", ['<Checkbox id="label-terms" />', '<Label for="label-terms">Accept terms and conditions</Label>']],
      ["label-rtl", ["$state<keyof typeof translations>", '<Label for="label-terms-rtl">']],
    ] as const) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("menubar docs match Fict menus, state, submenus, keyboard navigation, icons, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/menubar")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(6)
    for (let index = 0; index < 5; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(5).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    const bars = page.locator("[data-slot=menubar]")
    await expect(bars).toHaveCount(6)
    for (let index = 0; index < 6; index += 1) {
      await expect(bars.nth(index)).toHaveCSS("width", "288px")
      await expect(bars.nth(index)).toHaveCSS("height", "32px")
    }

    const demo = page.locator('[data-doc-preview-name="menubar-demo"]')
    await expect(demo.locator("[data-doc-menubar-trigger]")).toHaveText(["File", "Edit", "View", "Profiles"])
    const file = demo.getByRole("menuitem", { name: "File", exact: true })
    await expect(file).toHaveCSS("height", "24px")
    await file.click()
    const filePanel = demo.locator('[data-slot="menubar-content"]:visible')
    await expectIntrinsicWidth(filePanel, 167.672)
    await expect(filePanel).toHaveCSS("height", "166px")
    await expect(filePanel.getByRole("menuitem")).toHaveCount(5)
    await expect(filePanel.getByRole("menuitem", { name: "New Tab ⌘T" })).toBeFocused()
    await expect(filePanel.getByRole("menuitem", { name: "New Incognito Window" })).toBeDisabled()
    await expect(filePanel.getByText("⌘T", { exact: true })).toHaveCSS("font-size", "12px")

    await demo.getByRole("menuitem", { name: "Edit", exact: true }).hover()
    await expect(demo.locator('[data-slot="menubar-content"]:visible')).toContainText("Undo")
    await expect(demo.getByRole("menuitem", { name: "Undo ⌘Z" })).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(demo.locator('[data-slot="menubar-content"]:visible')).toHaveCount(0)
    await expect(demo.getByRole("menuitem", { name: "Edit", exact: true })).toBeFocused()

    await file.focus()
    await page.keyboard.press("ArrowDown")
    await expect(demo.getByRole("menuitem", { name: "New Tab ⌘T" })).toBeFocused()
    await page.keyboard.press("ArrowRight")
    await expect(demo.getByRole("menuitem", { name: "Undo ⌘Z" })).toBeFocused()
    await page.keyboard.press("Escape")

    const checkbox = page.locator('[data-doc-preview-name="menubar-checkbox"]')
    await checkbox.getByRole("menuitem", { name: "View", exact: true }).click()
    const bookmarks = checkbox.getByRole("menuitemcheckbox", { name: "Always Show Bookmarks Bar" })
    await expect(checkbox.locator('[data-slot="menubar-content"]:visible')).toHaveCSS("width", "256px")
    await expect(bookmarks).toHaveAttribute("aria-checked", "false")
    await bookmarks.click()
    await expect(checkbox.locator('[data-slot="menubar-content"]:visible')).toHaveCount(0)
    await checkbox.getByRole("menuitem", { name: "View", exact: true }).click()
    await expect(checkbox.getByRole("menuitemcheckbox", { name: "Always Show Bookmarks Bar" })).toHaveAttribute("aria-checked", "true")
    await page.keyboard.press("Escape")

    const radio = page.locator('[data-doc-preview-name="menubar-radio"]')
    await radio.getByRole("menuitem", { name: "Profiles", exact: true }).click()
    await expect(radio.locator('[data-slot="menubar-content"]:visible')).toHaveCSS("width", "144px")
    const andy = radio.getByRole("menuitemradio", { name: "Andy" })
    const benoit = radio.getByRole("menuitemradio", { name: "Benoit" })
    await expect(benoit).toHaveAttribute("aria-checked", "true")
    await andy.click()
    await radio.getByRole("menuitem", { name: "Profiles", exact: true }).click()
    await expect(radio.getByRole("menuitemradio", { name: "Andy" })).toHaveAttribute("aria-checked", "true")
    await expect(radio.getByRole("menuitemradio", { name: "Benoit" })).toHaveAttribute("aria-checked", "false")
    await page.keyboard.press("Escape")

    const submenu = page.locator('[data-doc-preview-name="menubar-submenu"]')
    await submenu.getByRole("menuitem", { name: "File", exact: true }).click()
    await submenu.getByRole("menuitem", { name: "Share", exact: true }).hover()
    await expect(submenu.getByRole("menuitem", { name: "Email link" })).toBeVisible()
    await page.keyboard.press("Escape")

    const icons = page.locator('[data-doc-preview-name="menubar-icons"]')
    await icons.getByRole("menuitem", { name: "File", exact: true }).click()
    await expect(icons.locator('[data-slot="menubar-content"]:visible svg')).toHaveCount(3)
    await expect(icons.getByRole("menuitem", { name: "New File ⌘N" })).toContainText("New File")
    await page.keyboard.press("Escape")

    const rtl = page.locator('[data-doc-preview-name="menubar-rtl"]')
    const rtlBar = rtl.locator("[data-slot=menubar]")
    await expect(rtlBar).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator("[data-doc-menubar-trigger]")).toHaveText(["ملف", "تعديل", "عرض", "الملفات الشخصية"])
    await rtl.getByRole("menuitem", { name: "ملف", exact: true }).click()
    await expectIntrinsicWidth(rtl.locator('[data-slot="menubar-content"]:visible'), 186.719)
    await expect(rtl.getByRole("menuitem", { name: "علامة تبويب جديدة ⌘T" })).toBeVisible()
    await page.keyboard.press("Escape")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator("[data-doc-menubar-trigger]")).toHaveText(["קובץ", "ערוך", "תצוגה", "פרופילים"])
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlBar).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("[data-doc-menubar-trigger]")).toHaveText(["File", "Edit", "View", "Profiles"])

    const expectedSources = [
      ["menubar-demo", "<MenubarCheckboxItem checked>Full URLs", '<MenubarRadioGroup value="benoit">', "Search the web", "Hide Sidebar"],
      ["menubar-checkbox", "Always Show Bookmarks Bar", "Force Reload"],
      ["menubar-radio", "$state('benoit')", 'value="system"'],
      ["menubar-submenu", "<MenubarSubTrigger>Share</MenubarSubTrigger>", "Find Previous"],
      ["menubar-icons", 'variant="destructive"', '<Icon name="Trash" />'],
      ["menubar-rtl", "$state<keyof typeof translations>", "כרטיסייה חדשה", "البحث على الويب", "MenubarCheckboxItem checked"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await file.click()
    await expect(demo.locator('[data-slot="menubar-content"]:visible')).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
  })

  test("native select docs match Fict sizing, options, groups, states, focus, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/native-select")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(5)
    for (let index = 0; index < 4; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(4).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const expectedWidths = ["129px", "188px", "106px", "111px", "104px"]
    for (let index = 0; index < 5; index += 1) {
      const select = previews.nth(index).locator('[data-slot="native-select"]')
      const icon = previews.nth(index).locator('[data-slot="native-select-icon"]')
      await expect(select).toHaveCSS("width", expectedWidths[index])
      await expect(select).toHaveCSS("height", "32px")
      await expect(select).toHaveCSS("font-size", "14px")
      await expect(select).toHaveCSS("line-height", "20px")
      await expect(select).toHaveCSS("border-radius", "10px")
      await expect(icon).toHaveCSS("width", "16px")
      await expect(icon).toHaveCSS("height", "16px")
    }

    const demo = page.locator('[data-doc-preview-name="native-select-demo"]')
    const demoSelect = demo.locator("select")
    await expect(demoSelect.locator("option")).toHaveText(["Select status", "Todo", "In Progress", "Done", "Cancelled"])
    await expect(demoSelect).toHaveValue("")
    await demoSelect.selectOption("done")
    await expect(demoSelect).toHaveValue("done")
    await expectFocusRing(demoSelect)

    const groups = page.locator('[data-doc-preview-name="native-select-groups"] select')
    await expect(groups.locator("optgroup")).toHaveCount(3)
    await expect(groups.locator("optgroup").nth(0)).toHaveAttribute("label", "Engineering")
    await expect(groups.locator("optgroup").nth(1)).toHaveAttribute("label", "Sales")
    await expect(groups.locator("optgroup").nth(2)).toHaveAttribute("label", "Operations")
    await expect(groups.locator("option")).toHaveCount(10)
    await groups.selectOption("ops-manager")
    await expect(groups).toHaveValue("ops-manager")

    const disabled = page.locator('[data-doc-preview-name="native-select-disabled"]')
    await expect(disabled.locator("select")).toBeDisabled()
    await expect(disabled.locator('[data-slot="native-select-wrapper"]')).toHaveCSS("opacity", "0.5")

    const invalid = page.locator('[data-doc-preview-name="native-select-invalid"] select')
    await expect(invalid).toHaveAttribute("aria-invalid", "true")
    await expect(invalid).toHaveCSS("box-shadow", /3px/)

    const rtl = page.locator('[data-doc-preview-name="native-select-rtl"]')
    const rtlRoot = rtl.locator('[data-slot="native-select-wrapper"]')
    const rtlSelect = rtl.locator('[data-slot="native-select"]')
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await expect(rtlSelect).toHaveCSS("padding", "4px 10px 4px 32px")
    await expect(rtlSelect.locator("option")).toHaveText(["اختر الحالة", "مهام", "قيد التنفيذ", "منجز", "ملغي"])
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlSelect.locator("option")).toHaveText(["בחר סטטוס", "לעשות", "בתהליך", "הושלם", "בוטל"])
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlRoot).toHaveAttribute("dir", "ltr")
    await expect(rtlSelect).toHaveCSS("width", "129px")
    await expect(rtlSelect.locator("option")).toHaveText(["Select status", "Todo", "In Progress", "Done", "Cancelled"])

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(demoSelect).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
    await expect(invalid).toHaveCSS("box-shadow", /3px/)

    const expectedSources = [
      ["native-select-demo", "Select status", "In Progress", "Cancelled"],
      ["native-select-groups", '<NativeSelectOptGroup label="Operations">', "Operations Manager"],
      ["native-select-disabled", "<NativeSelect disabled>"],
      ["native-select-invalid", 'aria-invalid="true"'],
      ["native-select-rtl", "$state<keyof typeof translations>", "בחר סטטוס"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("navigation menu docs match Fict geometry, links, hover, keyboard, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/navigation-menu")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(2)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "384px")
    await expect(previews.nth(1).locator(".doc-component-preview-stage")).toHaveCSS("height", "448px")

    const demo = page.locator('[data-doc-preview-name="navigation-menu-demo"]')
    const nav = demo.locator('[data-slot="navigation-menu"]')
    const triggers = demo.locator("[data-doc-navigation-trigger]")
    await expectIntrinsicWidth(nav, 307.656)
    await expect(nav).toHaveCSS("height", "36px")
    await expect(triggers).toHaveText(["Getting started", "Components"])
    await expectIntrinsicWidth(triggers.nth(0), 134.953)
    await expectIntrinsicWidth(triggers.nth(1), 119.359)
    await expectIntrinsicWidth(demo.getByRole("link", { name: "Docs", exact: true }), 53.3438)

    await triggers.nth(0).click()
    const started = demo.locator(".doc-navigation-panel.is-started:visible")
    await expect(started).toHaveCSS("width", "392px")
    await expect(started).toHaveCSS("height", "170px")
    await expect(started.locator("a")).toHaveCount(3)
    await expect(started.locator("a").nth(0)).toHaveCSS("width", "384px")
    await expect(started.locator("a").nth(0)).toHaveCSS("height", "54px")
    await expect(started.getByRole("link", { name: /Introduction/ })).toHaveAttribute("href", "/docs")
    await expect(started.getByRole("link", { name: /Installation/ })).toHaveAttribute("href", "/docs/installation")

    await triggers.nth(1).hover()
    const components = demo.locator(".doc-navigation-panel.is-components:visible")
    await expect(components).toHaveCSS("width", "608px")
    await expect(components).toHaveCSS("height", "246px")
    await expect(components.locator("a")).toHaveCount(6)
    await expect(components.locator("a").nth(0)).toHaveCSS("width", "296px")
    await expect(components.locator("a").nth(0)).toHaveCSS("height", "74px")
    await expect(components).toContainText("Alert Dialog")
    await expect(components).toContainText("Tooltip")
    await page.keyboard.press("Escape")
    await expect(demo.locator("[data-doc-navigation-panel]:visible")).toHaveCount(0)
    await expect(triggers.nth(1)).toBeFocused()

    await triggers.nth(0).focus()
    await page.keyboard.press("ArrowDown")
    await expect(started.getByRole("link", { name: /Introduction/ })).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(triggers.nth(0)).toBeFocused()

    const rtl = page.locator('[data-doc-preview-name="navigation-menu-rtl"]')
    const rtlNav = rtl.locator('[data-slot="navigation-menu"]')
    await expectIntrinsicWidth(rtlNav, 207.719)
    await expect(rtlNav).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator("[data-doc-navigation-trigger]")).toHaveText(["البدء", "المكونات"])
    await expect(rtl.getByRole("link", { name: "الوثائق", exact: true })).toBeVisible()
    await rtl.locator("[data-doc-navigation-trigger]").first().click()
    await expect(rtl.getByRole("link", { name: /مقدمة/ })).toBeVisible()
    await page.keyboard.press("Escape")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator("[data-doc-navigation-trigger]")).toHaveText(["התחלה", "רכיבים"])
    await expect(rtl.getByRole("link", { name: "תיעוד", exact: true })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlNav).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("[data-doc-navigation-trigger]")).toHaveText(["Getting started", "Components"])

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await triggers.nth(0).click()
    await expect(started).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["navigation-menu-demo", "Re-usable components built with Tailwind CSS.", "Alert Dialog", "Tooltip"],
      ["navigation-menu-rtl", "$state<keyof typeof translations>", "כיצד להתקין תלויות ולבנות את האפליקציה שלך"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("pagination docs match Fict layouts, links, selector, focus, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/pagination")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(4)
    for (let index = 0; index < 3; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(3).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="pagination-demo"]')
    const demoLinks = demo.locator(".doc-pagination-link")
    await expect(demo.getByRole("navigation", { name: "pagination" })).toBeVisible()
    await expect(demoLinks).toHaveCount(5)
    await expect(demoLinks).toHaveText(["Previous", "1", "2", "3", "Next"])
    await expect(demo.locator('[aria-current="page"]')).toHaveText("2")
    await expect(demo.locator('[aria-current="page"]')).toHaveCSS("width", "32px")
    await expect(demo.locator('[aria-current="page"]')).toHaveCSS("height", "32px")
    await expect(demo.locator(".doc-pagination-ellipsis svg")).toHaveCSS("width", "16px")
    await expect(demo.getByRole("link", { name: "Go to previous page" })).toHaveAttribute("href", "#")
    await expectFocusRing(demo.getByRole("link", { name: "1" }))

    const simple = page.locator('[data-doc-preview-name="pagination-simple"]')
    await expect(simple.locator(".doc-pagination-link")).toHaveText(["1", "2", "3", "4", "5"])
    await expect(simple.locator('[aria-current="page"]')).toHaveText("2")

    const icons = page.locator('[data-doc-preview-name="pagination-icons-only"]')
    await expect(icons.locator(".doc-pagination-icons-layout")).toHaveCSS("justify-content", "space-between")
    await expect(icons.locator(".doc-pagination-field")).toContainText("Rows per page")
    await expect(icons.locator(".doc-pagination-link")).toHaveCount(2)
    const select = icons.locator(".doc-pagination-select")
    await expect(select.locator("[data-menu-trigger]")).toHaveCSS("width", "80px")
    await expect(select.locator("[data-menu-trigger]")).toHaveCSS("height", "32px")
    await select.locator("[data-menu-trigger]").click()
    await expect(select.getByRole("menu")).toBeVisible()
    await expect(select.getByRole("menuitemradio")).toHaveText(["10", "25", "50", "100"])
    await expect(select.getByRole("menuitemradio", { name: "25" })).toBeFocused()
    await select.getByRole("menuitemradio", { name: "50" }).click()
    await expect(select.locator("[data-doc-pagination-value]")).toHaveText("50")
    await expect(select.locator('[data-doc-pagination-option="50"]')).toHaveAttribute("aria-checked", "true")
    await expect(select.locator("[data-menu-panel]")).toBeHidden()

    const rtl = page.locator('[data-doc-preview-name="pagination-rtl"]')
    const rtlNav = rtl.getByRole("navigation", { name: "pagination" })
    await expect(rtlNav).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator(".doc-pagination-link")).toHaveText(["السابق", "١", "٢", "٣", "التالي"])
    await expect(rtl.locator(".doc-pagination-icon").first()).toHaveCSS("transform", /matrix\(-1/)
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator(".doc-pagination-link")).toHaveText(["הקודם", "1", "2", "3", "הבא"])
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlNav).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator(".doc-pagination-link")).toHaveText(["Previous", "1", "2", "3", "Next"])

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(demo.locator('[aria-current="page"]')).not.toHaveCSS("border-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["pagination-demo", '<PaginationLink href="#" isActive>2</PaginationLink>', "<PaginationEllipsis />"],
      ["pagination-simple", "[1, 2, 3, 4, 5].map"],
      ["pagination-icons-only", "let rows = $state('25')", '<ArrowIcon direction="previous" />'],
      ["pagination-rtl", "$state<keyof typeof translations>('ar')", "dir={text().dir}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("popover docs match Fict content, alignment, form focus, dismissal, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/popover")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(5)
    for (let index = 0; index < 4; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(4).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="popover-demo"]')
    const demoTrigger = demo.getByRole("button", { name: "Open popover" })
    await demoTrigger.click()
    const demoPanel = demo.getByRole("dialog")
    await expect(demoPanel).toBeVisible()
    await expect(demoPanel).toHaveCSS("width", "320px")
    await expect(demoPanel).toContainText("Dimensions")
    await expect(demoPanel).toContainText("Set the dimensions for the layer.")
    await expect(demoPanel.locator("input")).toHaveCount(4)
    for (const [index, value] of ["100%", "300px", "25px", "none"].entries()) {
      await expect(demoPanel.locator("input").nth(index)).toHaveValue(value)
    }
    await expect(demoPanel.locator("input").first()).toBeFocused()
    await expectFocusRing(demoPanel.locator("input").first())
    await page.keyboard.press("Escape")
    await expect(demoPanel).toBeHidden()
    await expect(demoTrigger).toBeFocused()

    const basic = page.locator('[data-doc-preview-name="popover-basic"]')
    const basicTrigger = basic.getByRole("button", { name: "Open Popover" })
    await basicTrigger.click()
    const basicPanel = basic.getByRole("dialog")
    await expect(basicPanel).toHaveCSS("width", "320px")
    await expect(basicPanel).toBeFocused()
    const basicBoxes = await Promise.all([basicTrigger.boundingBox(), basicPanel.boundingBox()])
    expect(basicBoxes[0]?.x).toBeCloseTo(basicBoxes[1]?.x ?? 0, 0)
    await page.locator("main h1").click()
    await expect(basic.locator("[data-doc-popover-panel]")).toBeHidden()

    const alignments = page.locator('[data-doc-preview-name="popover-alignments"]')
    await expect(alignments.locator("[data-doc-popover-trigger]")).toHaveText(["Start", "Center", "End"])
    await expect(alignments.locator(".doc-popover-alignments")).toHaveCSS("gap", "24px")
    for (const alignment of ["start", "center", "end"]) {
      const popover = alignments.locator(`[data-doc-popover]:has([data-align="${alignment}"])`)
      await popover.locator("[data-doc-popover-trigger]").click()
      await expect(popover.getByRole("dialog")).toBeVisible()
      await expect(popover.getByRole("dialog")).toHaveCSS("width", "160px")
      await page.keyboard.press("Escape")
    }

    const form = page.locator('[data-doc-preview-name="popover-form"]')
    await form.getByRole("button", { name: "Open Popover" }).click()
    const formPanel = form.getByRole("dialog")
    await expect(formPanel).toHaveCSS("width", "256px")
    await expect(formPanel.locator("input").nth(0)).toHaveValue("100%")
    await expect(formPanel.locator("input").nth(1)).toHaveValue("25px")
    await expect(formPanel.locator("input").first()).toBeFocused()
    await page.keyboard.press("Escape")

    const rtl = page.locator('[data-doc-preview-name="popover-rtl"]')
    const rtlRoot = rtl.locator(".doc-popover-rtl-group")
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator("[data-doc-popover-trigger]")).toHaveText(["يسار", "أعلى", "أسفل", "يمين"])
    for (const [index, side] of ["left", "top", "bottom", "right"].entries()) {
      await rtl.locator("[data-doc-popover-trigger]").nth(index).click()
      await expect(rtl.locator(`[data-doc-popover-panel][data-side="${side}"]`)).toBeVisible()
      await expect(rtl.getByRole("dialog")).toContainText("الأبعاد")
      await page.keyboard.press("Escape")
    }
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator("[data-doc-popover-trigger]")).toHaveText(["שמאל", "למעלה", "למטה", "ימין"])
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlRoot).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("[data-doc-popover-trigger]")).toHaveText(["Left", "Top", "Bottom", "Right"])

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await rtl.getByRole("button", { name: "Bottom" }).click()
    await expect(rtl.getByRole("dialog")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["popover-demo", "Max. width", "['max-height', 'Max. height', 'none']"],
      ["popover-basic", '<PopoverContent align="start">'],
      ["popover-alignments", "(['start', 'center', 'end'] as const).map"],
      ["popover-form", '<Input id="height" defaultValue="25px" />'],
      ["popover-rtl", "$state<keyof typeof translations>", "הגדר את המימדים לשכבה"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("progress docs match Fict values, labels, controlled slider, animation, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/progress")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(4)
    for (let index = 0; index < 3; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(3).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="progress-demo"]')
    const demoProgress = demo.getByRole("progressbar")
    await expect(demo.locator(".doc-progress-demo")).toHaveCSS("width", "334.797px")
    await expect(demoProgress).toHaveCSS("height", "8px")
    await expect(demoProgress).toHaveAttribute("aria-valuemin", "0")
    await expect(demoProgress).toHaveAttribute("aria-valuemax", "100")
    await expect(demoProgress).toHaveAttribute("aria-valuenow", "66", { timeout: 1500 })
    await expect(demo.locator(".doc-progress-indicator")).toHaveAttribute("style", /translateX\(-34%\)/)

    const label = page.locator('[data-doc-preview-name="progress-label"]')
    await expect(label.locator(".doc-progress-field")).toHaveCSS("width", "384px")
    await expect(label.locator("label")).toHaveText("Upload progress66%")
    await expect(label.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "66")

    const controlled = page.locator('[data-doc-preview-name="progress-controlled"]')
    const slider = controlled.getByRole("slider", { name: "Progress" })
    const controlledProgress = controlled.getByRole("progressbar")
    await expect(controlled.locator(".doc-progress-field")).toHaveCSS("gap", "12px")
    await expect(slider).toHaveAttribute("aria-valuenow", "50")
    await expect(controlledProgress).toHaveAttribute("aria-valuenow", "50")
    await slider.focus()
    await page.keyboard.press("ArrowRight")
    await expect(slider).toHaveAttribute("aria-valuenow", "51")
    await expect(controlledProgress).toHaveAttribute("aria-valuenow", "51")
    await expect(controlled.locator(".doc-progress-indicator")).toHaveAttribute("style", /translateX\(-49%\)/)

    const rtl = page.locator('[data-doc-preview-name="progress-rtl"]')
    const rtlField = rtl.locator(".doc-progress-field")
    await expect(rtlField).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator("label")).toHaveText("تقدم الرفع٦٦%")
    await expect(rtl.getByRole("progressbar")).toHaveCSS("transform", /matrix\(-1/)
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator("label")).toHaveText("התקדמות העלאה66%")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlField).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("label")).toHaveText("Upload progress66%")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(rtl.locator(".doc-progress-indicator")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["progress-demo", "<Progress value={66} max={100}"],
      ["progress-label", '<label for="upload-progress"', "<span>66%</span>"],
      ["progress-controlled", "let value = $state(50)", "onValueChange={next => { value = next[0] }}"],
      ["progress-rtl", "$state<keyof typeof translations>('ar')", "dir={text().dir}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("radio group docs match Fict selection, cards, states, keyboard, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/radio-group")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)
    for (let index = 0; index < 6; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(6).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="radio-group-demo"]')
    const demoRadios = demo.getByRole("radio")
    await expect(demoRadios).toHaveCount(3)
    await expect(demo.locator("label")).toHaveText(["Default", "Comfortable", "Compact"])
    await expect(demo.getByRole("radio", { name: "Comfortable" })).toBeChecked()
    await expect(demo.getByRole("radio", { name: "Default" })).not.toBeChecked()
    await demo.getByRole("radio", { name: "Comfortable" }).focus()
    await page.keyboard.press("ArrowDown")
    await expect(demo.getByRole("radio", { name: "Compact" })).toBeChecked()
    await expect(demo.getByRole("radio", { name: "Compact" })).toBeFocused()
    await expectFocusRing(demo.getByRole("radio", { name: "Compact" }))

    const description = page.locator('[data-doc-preview-name="radio-group-description"]')
    await expect(description.locator("small")).toHaveText(["Standard spacing for most use cases.", "More space between elements.", "Minimal spacing for dense layouts."])
    await description.locator("label").filter({ hasText: "Default" }).click()
    await expect(description.getByRole("radio", { name: /^Default/ })).toBeChecked()

    const cards = page.locator('[data-doc-preview-name="radio-group-choice-card"]')
    await expect(cards.locator(".doc-radio-card")).toHaveCount(3)
    await expect(cards.locator(".doc-radio-card").first()).toHaveCSS("width", "384px")
    await expect(cards.getByRole("radio", { name: /Plus/ })).toBeChecked()
    await cards.locator(".doc-radio-card").filter({ hasText: "Pro" }).click()
    await expect(cards.getByRole("radio", { name: /Pro/ })).toBeChecked()

    const fieldset = page.locator('[data-doc-preview-name="radio-group-fieldset"]')
    await expect(fieldset.getByRole("group").first()).toContainText("Subscription Plan")
    await expect(fieldset.getByRole("radio", { name: /Monthly/ })).toBeChecked()
    await fieldset.getByRole("radio", { name: /Yearly/ }).check()
    await expect(fieldset.getByRole("radio", { name: /Yearly/ })).toBeChecked()

    const disabled = page.locator('[data-doc-preview-name="radio-group-disabled"]')
    await expect(disabled.getByRole("radio", { name: "Disabled" })).toBeDisabled()
    await expect(disabled.getByRole("radio", { name: "Option 2" })).toBeChecked()

    const invalid = page.locator('[data-doc-preview-name="radio-group-invalid"]')
    await expect(invalid.getByRole("radio")).toHaveCount(3)
    for (let index = 0; index < 3; index += 1) {
      await expect(invalid.getByRole("radio").nth(index)).toHaveAttribute("aria-invalid", "true")
      await expect(invalid.getByRole("radio").nth(index)).not.toHaveCSS("border-color", "rgba(0, 0, 0, 0)")
    }

    const rtl = page.locator('[data-doc-preview-name="radio-group-rtl"]')
    const rtlGroup = rtl.getByRole("radiogroup")
    await expect(rtlGroup).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator("label > span")).toHaveText(["افتراضي", "مريح", "مضغوط"])
    await expect(rtl.locator("label > small")).toHaveText(["تباعد قياسي لمعظم حالات الاستخدام.", "مساحة أكبر بين العناصر.", "تباعد أدنى للتخطيطات الكثيفة."])
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator("label > span")).toHaveText(["ברירת מחדל", "נוח", "קומפקטי"])
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlGroup).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("label > span")).toHaveText(["Default", "Comfortable", "Compact"])

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(rtl.getByRole("radio", { name: /^Comfortable/ })).toBeChecked()

    const expectedSources = [
      ["radio-group-demo", 'defaultValue="comfortable"', "Compact"],
      ["radio-group-description", "Minimal spacing for dense layouts."],
      ["radio-group-choice-card", "For large teams and enterprises."],
      ["radio-group-fieldset", "Lifetime ($299.99)"],
      ["radio-group-disabled", '<RadioGroupItem value="option1" disabled />'],
      ["radio-group-invalid", 'aria-invalid="true"'],
      ["radio-group-rtl", "$state<keyof typeof translations>", "ריווח מינימלי לפריסות צפופות"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("resizable docs match Fict layouts, handles, pointer, keyboard, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/resizable")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(4)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "320px")
    await expect(previews.nth(1).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(2).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(3).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="resizable-demo"]')
    const demoGroup = demo.locator(".doc-resizable-group.is-complex")
    await expect(demoGroup).toHaveCSS("width", "384px")
    await expect(demoGroup).toHaveCSS("height", "202px")
    await expect(demoGroup.locator("strong")).toHaveText(["One", "Two", "Three"])
    await expect(demo.getByRole("separator")).toHaveCount(2)
    const outerHandle = demoGroup.locator(":scope > [data-doc-resizable-handle]")
    await expect(outerHandle).toHaveAttribute("aria-orientation", "vertical")
    await expect(outerHandle).toHaveAttribute("aria-valuenow", "50")
    await outerHandle.focus()
    await page.keyboard.press("ArrowRight")
    await expect(outerHandle).toHaveAttribute("aria-valuenow", "52")
    await expect(demoGroup.locator(":scope > [data-doc-resizable-panel]").first()).toHaveAttribute("style", /52%/)
    await expect(outerHandle).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const vertical = page.locator('[data-doc-preview-name="resizable-vertical"]')
    const verticalGroup = vertical.locator("[data-doc-resizable-group]")
    await expect(verticalGroup).toHaveCSS("width", "384px")
    await expect(verticalGroup).toHaveCSS("height", "200px")
    await expect(verticalGroup.locator("strong")).toHaveText(["Header", "Content"])
    const verticalHandle = vertical.getByRole("separator")
    await expect(verticalHandle).toHaveAttribute("aria-orientation", "horizontal")
    await verticalHandle.focus()
    await page.keyboard.press("ArrowDown")
    await expect(verticalHandle).toHaveAttribute("aria-valuenow", "27")

    const handle = page.locator('[data-doc-preview-name="resizable-handle"]')
    const handleGroup = handle.locator("[data-doc-resizable-group]")
    await expect(handleGroup).toHaveCSS("width", "450px")
    await expect(handle.locator(".doc-resizable-handle > span")).toHaveCSS("width", "12px")
    const handleBox = await handleGroup.boundingBox()
    const separatorBox = await handle.locator(".doc-resizable-handle > span").boundingBox()
    if (!handleBox || !separatorBox) throw new Error("Resizable handle group is not measurable")
    const handleSeparator = handle.getByRole("separator")
    await handleSeparator.dispatchEvent("pointerdown", { pointerId: 1, clientX: separatorBox.x + separatorBox.width / 2, clientY: separatorBox.y + separatorBox.height / 2 })
    await handleSeparator.dispatchEvent("pointermove", { pointerId: 1, clientX: handleBox.x + handleBox.width * 0.4, clientY: handleBox.y + handleBox.height / 2 })
    await handleSeparator.dispatchEvent("pointerup", { pointerId: 1 })
    await expect(handle.getByRole("separator")).toHaveAttribute("aria-valuenow", /^(39|40)$/)

    const rtl = page.locator('[data-doc-preview-name="resizable-rtl"]')
    const rtlGroup = rtl.locator(".doc-resizable-group.is-complex")
    await expect(rtlGroup).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator("strong")).toHaveText(["واحد", "اثنان", "ثلاثة"])
    const rtlHandle = rtlGroup.locator(":scope > [data-doc-resizable-handle]")
    await rtlHandle.focus()
    await page.keyboard.press("ArrowLeft")
    await expect(rtlHandle).toHaveAttribute("aria-valuenow", "52")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator("strong")).toHaveText(["אחד", "שניים", "שלושה"])
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlGroup).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("strong")).toHaveText(["One", "Two", "Three"])

    const expectedSources = [
      ["resizable-demo", "<strong>Three</strong>", '<ResizablePanelGroup direction="vertical">'],
      ["resizable-vertical", "<strong>Header</strong>", "<ResizableHandle />"],
      ["resizable-handle", "<strong>Sidebar</strong>", "<ResizableHandle withHandle />"],
      ["resizable-rtl", "$state<keyof typeof translations>", "dir={text().dir}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("scroll area docs match Fict dimensions, content, scrolling, bars, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/scroll-area")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(3)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "384px")
    await expect(previews.nth(1).locator(".doc-component-preview-stage")).toHaveCSS("height", "512px")
    await expect(previews.nth(2).locator(".doc-component-preview-stage")).toHaveCSS("height", "432px")

    const demo = page.locator('[data-doc-preview-name="scroll-area-demo"]')
    const demoArea = demo.locator("[data-doc-scroll-area]")
    const demoViewport = demo.locator("[data-doc-scroll-viewport]")
    await expect(demoArea).toHaveCSS("width", "192px")
    await expect(demoArea).toHaveCSS("height", "288px")
    await expect(demo.locator(".doc-scroll-tags h4")).toHaveText("Tags")
    await expect(demo.locator(".doc-scroll-tags > div")).toHaveCount(50)
    await expect(demo.locator(".doc-scroll-tags > div").first()).toHaveText("v1.2.0-beta.50")
    await expect(demo.locator(".doc-scroll-tags > div").last()).toHaveText("v1.2.0-beta.1")
    await expect(demo.locator(".doc-scrollbar.is-vertical")).toHaveCSS("width", "10px")
    await demoViewport.evaluate((element) => { element.scrollTop = 400 })
    await expect.poll(() => demoViewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)

    const horizontal = page.locator('[data-doc-preview-name="scroll-area-horizontal-demo"]')
    const horizontalArea = horizontal.locator("[data-doc-scroll-area]")
    const horizontalViewport = horizontal.locator("[data-doc-scroll-viewport]")
    await expect(horizontalArea).toHaveCSS("width", "384px")
    await expect(horizontal.locator("figure")).toHaveCount(3)
    await expect(horizontal.locator("img").first()).toHaveCSS("width", "300px")
    await expect(horizontal.locator("img").first()).toHaveCSS("height", "400px")
    await expect(horizontal.locator("figcaption")).toHaveText(["Photo by Ornella Binni", "Photo by Tom Byrom", "Photo by Vladimir Malyavko"])
    await expect(horizontal.locator(".doc-scrollbar.is-horizontal")).toHaveCSS("height", "10px")
    await horizontalViewport.evaluate((element) => { element.scrollLeft = 300 })
    await expect.poll(() => horizontalViewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)

    const rtl = page.locator('[data-doc-preview-name="scroll-area-rtl"]')
    const rtlArea = rtl.locator("[data-doc-scroll-area]")
    await expect(rtlArea).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator(".doc-scroll-tags h4")).toHaveText("العلامات")
    await expect(rtl.locator(".doc-scrollbar.is-vertical")).toHaveCSS("left", "0px")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator(".doc-scroll-tags h4")).toHaveText("תגיות")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlArea).toHaveAttribute("dir", "ltr")

    const expectedSources = [
      ["scroll-area-demo", "v1.2.0-beta.${50 - index}", ">Tags</h4>"],
      ["scroll-area-horizontal-demo", "Ornella Binni", '<ScrollBar orientation="horizontal" />'],
      ["scroll-area-rtl", "$state<keyof typeof translations>", "תגיות"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const sourcePreview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await sourcePreview.getByRole("button", { name: "View Code" }).click()
      const source = sourcePreview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
    await expect(rtl.locator(".doc-scroll-tags h4")).toHaveText("Tags")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(demoArea).not.toHaveCSS("border-color", "rgba(0, 0, 0, 0)")
  })

  test("select docs match Fict options, groups, scrolling, states, keyboard, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/select")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)
    for (let index = 0; index < 6; index += 1) await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(6).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="select-demo"]')
    const demoTrigger = demo.locator("[data-doc-select-trigger]")
    await expect(demoTrigger).toHaveCSS("width", "192px")
    await expect(demoTrigger).toHaveCSS("height", "32px")
    await expect(demoTrigger).toContainText("Select a fruit")
    await demoTrigger.click()
    await expect(demo.getByRole("listbox")).toBeVisible()
    await expect(demo.locator(".doc-select-label")).toHaveText("Fruits")
    await expect(demo.getByRole("option")).toHaveText(["Apple✓", "Banana✓", "Blueberry✓", "Grapes✓", "Pineapple✓"])
    await expect(demo.getByRole("option", { name: /Apple/ })).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await expect(demo.locator("[data-doc-select-value]")).toHaveText("Banana")
    await expect(demo.getByRole("option", { name: /Banana/, includeHidden: true })).toHaveAttribute("aria-selected", "true")
    await expect(demoTrigger).toBeFocused()
    await expectFocusRing(demoTrigger)

    const align = page.locator('[data-doc-preview-name="select-align-item"]')
    await expect(align.getByRole("switch")).toHaveAttribute("aria-checked", "true")
    await align.getByRole("switch").click()
    await expect(align.getByRole("switch")).toHaveAttribute("aria-checked", "false")
    await align.locator("[data-doc-select-trigger]").click()
    await expect(align.getByRole("option", { name: /Banana/ })).toBeFocused()
    await page.keyboard.press("Escape")

    const groups = page.locator('[data-doc-preview-name="select-groups"]')
    await groups.locator("[data-doc-select-trigger]").click()
    await expect(groups.locator(".doc-select-label")).toHaveText(["Fruits", "Vegetables"])
    await expect(groups.getByRole("option")).toHaveCount(8)
    await groups.getByRole("option", { name: /Spinach/ }).click()
    await expect(groups.locator("[data-doc-select-value]")).toHaveText("Spinach")

    const scrollable = page.locator('[data-doc-preview-name="select-scrollable"]')
    await scrollable.locator("[data-doc-select-trigger]").click()
    const scrollPanel = scrollable.getByRole("listbox")
    await expect(scrollPanel).toHaveCSS("max-height", "240px")
    await expect(scrollable.getByRole("option")).toHaveCount(27)
    await scrollPanel.evaluate((element) => { element.scrollTop = element.scrollHeight })
    await expect.poll(() => scrollPanel.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
    await page.keyboard.press("Escape")

    const disabled = page.locator('[data-doc-preview-name="select-disabled"]')
    await expect(disabled.locator("[data-doc-select-trigger]")).toBeDisabled()

    const invalid = page.locator('[data-doc-preview-name="select-invalid"]')
    await expect(invalid.locator("[data-doc-select-trigger]")).toHaveAttribute("aria-invalid", "true")
    await expect(invalid).toContainText("Please select a fruit.")

    const rtl = page.locator('[data-doc-preview-name="select-rtl"]')
    const rtlSelect = rtl.locator("[data-doc-select]")
    await expect(rtlSelect).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator("[data-doc-select-value]")).toHaveText("اختر فاكهة")
    await rtl.locator("[data-doc-select-trigger]").click()
    await expect(rtl.locator(".doc-select-label")).toHaveText(["الفواكه", "الخضروات"])
    await rtl.getByRole("option", { name: /موز/ }).click()
    await expect(rtl.locator("[data-doc-select-value]")).toHaveText("موز")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator("[data-doc-select-value]")).toHaveText("בננה")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlSelect).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("[data-doc-select-value]")).toHaveText("Banana")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(demoTrigger).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["select-demo", '<SelectValue placeholder="Select a fruit" />'],
      ["select-align-item", "position={aligned ? 'item-aligned' : 'popper'}"],
      ["select-groups", "<SelectLabel>Vegetables</SelectLabel>"],
      ["select-scrollable", "Indonesia Central Standard Time", "Chile Standard Time"],
      ["select-disabled", "<Select disabled>"],
      ["select-invalid", 'aria-invalid="true"', "Please select a fruit."],
      ["select-rtl", "$state<keyof typeof translations>", "אוכמניה"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("separator docs match Fict horizontal, vertical, menu, list, and RTL layouts", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/separator")
    await waitForClientReady(page)
    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(5)
    for (let index = 0; index < 4; index += 1) await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(4).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="separator-demo"]')
    await expect(demo.locator(".doc-separator-demo")).toHaveCSS("width", "384px")
    await expect(demo.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal")
    await expect(demo.getByRole("separator")).toHaveCSS("height", "1px")
    await expect(demo).toContainText("The Foundation for your Design System")

    const vertical = page.locator('[data-doc-preview-name="separator-vertical"]')
    await expect(vertical.locator(".doc-separator-vertical")).toHaveText("BlogDocsSource")
    await expect(vertical.getByRole("separator")).toHaveCount(2)
    await expect(vertical.getByRole("separator").first()).toHaveCSS("width", "1px")
    await expect(vertical.getByRole("separator").first()).toHaveCSS("height", "20px")

    const menu = page.locator('[data-doc-preview-name="separator-menu"]')
    await expect(menu.locator("strong")).toHaveText(["Settings", "Account", "Help"])
    await expect(menu.locator("small")).toHaveText(["Manage preferences", "Profile & security", "Support & docs"])
    await expect(menu.getByRole("separator")).toHaveCount(2)

    const list = page.locator('[data-doc-preview-name="separator-list"]')
    await expect(list.locator("dt")).toHaveText(["Item 1", "Item 2", "Item 3"])
    await expect(list.locator("dd")).toHaveText(["Value 1", "Value 2", "Value 3"])
    await expect(list.getByRole("separator")).toHaveCount(2)

    const rtl = page.locator('[data-doc-preview-name="separator-rtl"]')
    const rtlDemo = rtl.locator(".doc-separator-demo")
    await expect(rtlDemo).toHaveAttribute("dir", "rtl")
    await expect(rtlDemo).toContainText("الأساس لنظام التصميم الخاص بك")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlDemo).toContainText("הבסיס למערכת העיצוב שלך")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlDemo).toHaveAttribute("dir", "ltr")
    await expect(rtlDemo).toContainText("The Foundation for your Design System")

    const expectedSources = [
      ["separator-demo", "The Foundation for your Design System"],
      ["separator-vertical", 'orientation="vertical"'],
      ["separator-menu", "Manage preferences"],
      ["separator-list", "Item 1", "Value 3"],
      ["separator-rtl", "$state<keyof typeof translations>", "הבסיס למערכת העיצוב שלך"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("sheet docs match Fict sides, forms, focus, dismissal, close controls, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/sheet")
    await waitForClientReady(page)
    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(4)
    for (let index = 0; index < 3; index += 1) await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(3).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="sheet-demo"]')
    const demoTrigger = demo.getByRole("button", { name: "Open" })
    await demoTrigger.click()
    const demoDialog = page.getByRole("dialog", { name: "Edit profile" })
    await expect(demoDialog).toBeVisible()
    await expect(demoDialog).toHaveClass(/is-right/)
    await expect(demoDialog).toHaveCSS("width", "400px")
    await expect(demoDialog.locator("input")).toHaveCount(2)
    await expect(demoDialog.locator("input").first()).toBeFocused()
    await expectFocusRing(demoDialog.locator("input").first())
    await expect(demoDialog.getByRole("button", { name: "Save changes" })).toBeVisible()
    await demoDialog.locator("footer").getByRole("button", { name: "Close", exact: true }).click()
    await expect(demoDialog).toBeHidden()
    await expect(demoTrigger).toBeFocused()

    const sides = page.locator('[data-doc-preview-name="sheet-side"]')
    await expect(sides.locator("[data-doc-dialog-trigger]")).toHaveText(["top", "right", "bottom", "left"])
    for (const side of ["top", "right", "bottom", "left"]) {
      await sides.getByRole("button", { name: side, exact: true }).click()
      const dialog = page.getByRole("dialog", { name: `Edit profile ${side}` })
      await expect(dialog).toHaveClass(new RegExp(`is-${side}`))
      await expect(dialog.locator(".doc-sheet-scroll p")).toHaveCount(10)
      await dialog.getByRole("button", { name: "Cancel" }).click()
    }

    const noClose = page.locator('[data-doc-preview-name="sheet-no-close-button"]')
    const noCloseTrigger = noClose.getByRole("button", { name: "Open Sheet" })
    await noCloseTrigger.click()
    const noCloseDialog = page.getByRole("dialog", { name: "No Close Button" })
    await expect(noCloseDialog.getByRole("button", { name: "Close" })).toHaveCount(0)
    await expect(noCloseDialog).toBeFocused()
    await page.locator("[data-doc-dialog-overlay]:visible").click({ position: { x: 10, y: 10 } })
    await expect(noCloseDialog).toBeHidden()
    await expect(noCloseTrigger).toBeFocused()

    const rtl = page.locator('[data-doc-preview-name="sheet-rtl"]')
    await rtl.getByRole("button", { name: "فتح" }).click()
    const rtlDialog = page.getByRole("dialog", { name: "تعديل الملف الشخصي" })
    await expect(rtlDialog).toHaveClass(/is-left/)
    await expect(rtlDialog).toHaveAttribute("dir", "rtl")
    await expect(rtlDialog).toContainText("حفظ التغييرات")
    await page.keyboard.press("Escape")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByRole("button", { name: "פתח" })).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await rtl.getByRole("button", { name: "Open" }).click()
    const englishDialog = page.getByRole("dialog", { name: "Edit profile" })
    await expect(englishDialog).toHaveClass(/is-right/)
    await expect(englishDialog).toHaveAttribute("dir", "ltr")
    await page.keyboard.press("Escape")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await demoTrigger.click()
    await expect(page.getByRole("dialog", { name: "Edit profile" })).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
    await page.keyboard.press("Escape")

    const expectedSources = [
      ["sheet-demo", '<Input id="sheet-demo-name" value="Pedro Duarte" />', "Save changes"],
      ["sheet-side", "const sides = ['top', 'right', 'bottom', 'left'] as const", "<SheetContent side={side}"],
      ["sheet-no-close-button", "This sheet doesn't have a close button", "<SheetContent>"],
      ["sheet-rtl", "$state<keyof typeof translations>('ar')", "side={text().dir === 'rtl' ? 'left' : 'right'}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
      await expect(source).not.toContainText("Open Demo")
    }
  })

  test("sidebar docs match Fict layout, navigation, collapse, shortcut, and dark theme", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/sidebar")
    await waitForClientReady(page)

    const preview = page.locator('[data-doc-preview-name="sidebar-demo"]')
    const stage = preview.locator(".doc-component-preview-stage")
    const root = preview.locator("[data-doc-sidebar-root]")
    const panel = preview.locator(".doc-sidebar-panel")
    await expect(stage).toHaveCSS("height", "400px")
    await expect(preview.locator(".doc-component-code")).toBeVisible()
    await expect(panel).toHaveCSS("width", "252px")
    await expect(panel).toContainText("Acme Inc")
    await expect(panel).toContainText("Enterprise")
    await expect(panel).toContainText("Platform")
    await expect(panel.locator("[data-doc-sidebar-group]")).toHaveCount(4)
    await expect(panel.getByRole("link", { name: "History" })).toBeVisible()

    const models = panel.getByRole("button", { name: /Models/ })
    await expect(models).toHaveAttribute("aria-expanded", "false")
    await models.click()
    await expect(models).toHaveAttribute("aria-expanded", "true")
    await expect(panel.getByRole("link", { name: "Genesis" })).toBeVisible()

    const trigger = preview.getByRole("button", { name: "Toggle Sidebar" })
    await trigger.click()
    await expect(root).toHaveAttribute("data-state", "collapsed")
    await expect(panel).toHaveCSS("width", "48px")
    await expect(panel.locator(".doc-sidebar-copy").first()).toBeHidden()
    await page.keyboard.press("Control+b")
    await expect(root).toHaveAttribute("data-state", "expanded")
    await expect(panel).toHaveCSS("width", "252px")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(panel).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    await preview.getByRole("button", { name: "View Code" }).click()
    const source = preview.locator("[data-doc-preview-full-code]")
    for (const marker of ["let collapsed = $state(false)", "Acme Inc", "Genesis", "event.ctrlKey && event.key === 'b'", "SidebarLink"]) {
      await expect(source).toContainText(marker)
    }

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(stage).toHaveCSS("height", "320px")
    await expect(panel).toHaveCSS("width", "220px")
  })

  test("skeleton docs match Fict profile, card, text, form, table, animation, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/skeleton")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)
    for (const name of ["skeleton-demo", "skeleton-avatar", "skeleton-text", "skeleton-form", "skeleton-table"]) {
      await expect(page.locator(`[data-doc-preview-name="${name}"] .doc-component-preview-stage`)).toHaveCSS("height", "288px")
    }
    await expect(page.locator('[data-doc-preview-name="skeleton-card"] .doc-component-preview-stage')).toHaveCSS("height", "320px")
    await expect(page.locator('[data-doc-preview-name="skeleton-rtl"] .doc-component-preview-stage')).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="skeleton-demo"]')
    await expect(demo.locator('[data-slot="skeleton"]')).toHaveCount(3)
    await expect(demo.locator(".is-avatar-lg")).toHaveCSS("width", "48px")
    await expect(demo.locator(".is-avatar-lg")).toHaveCSS("height", "48px")
    await expect(demo.locator(".is-w-250")).toHaveCSS("width", "250px")
    await expect(demo.locator(".is-w-200")).toHaveCSS("width", "200px")
    await expect(demo.locator(".doc-skeleton").first()).toHaveCSS("animation-name", "doc-skeleton-pulse")

    const avatar = page.locator('[data-doc-preview-name="skeleton-avatar"]')
    await expect(avatar.locator(".is-avatar-sm")).toHaveCSS("width", "40px")
    await expect(avatar.locator(".is-w-150")).toHaveCSS("width", "150px")

    const card = page.locator('[data-doc-preview-name="skeleton-card"] .doc-skeleton-card')
    await expect(card).toHaveCSS("width", "320px")
    await expect(card).toHaveCSS("height", "246px")
    await expect(card.locator(".is-card-media")).toHaveCSS("width", "288px")
    await expect(card.locator(".is-card-media")).toHaveCSS("height", "162px")

    const text = page.locator('[data-doc-preview-name="skeleton-text"]')
    await expect(text.locator(".doc-skeleton").first()).toHaveCSS("width", "320px")
    await expect(text.locator(".doc-skeleton").last()).toHaveCSS("width", "240px")
    const form = page.locator('[data-doc-preview-name="skeleton-form"]')
    await expect(form.locator('[data-slot="skeleton"]')).toHaveCount(5)
    await expect(form.locator(".is-input").first()).toHaveCSS("width", "320px")
    const table = page.locator('[data-doc-preview-name="skeleton-table"]')
    await expect(table.locator('[data-slot="skeleton"]')).toHaveCount(15)
    await expect(table.locator(".doc-skeleton-table")).toHaveCSS("width", "384px")

    const rtl = page.locator('[data-doc-preview-name="skeleton-rtl"]')
    await expect(rtl.locator(".doc-skeleton-rtl-preview")).toHaveAttribute("dir", "rtl")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-skeleton-rtl-preview")).toHaveAttribute("dir", "ltr")
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(rtl.locator(".doc-skeleton").first()).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["skeleton-demo", 'class="size-12 rounded-full"', 'class="h-4 w-[250px]"'],
      ["skeleton-avatar", 'class="size-10 rounded-full"'],
      ["skeleton-card", 'class="aspect-video w-72"'],
      ["skeleton-text", 'class="h-4 w-60"'],
      ["skeleton-form", 'class="h-9 w-80"'],
      ["skeleton-table", "Array.from({ length: 5 }"],
      ["skeleton-rtl", "$state<keyof typeof directions>('ar')", "dir={directions[language]}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("slider docs match Fict values, ranges, vertical controls, disabled state, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/slider")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)
    for (let index = 0; index < 6; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(6).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="slider-demo"]')
    const demoSlider = demo.locator(".doc-slider")
    const demoThumb = demo.getByRole("slider")
    await expect(demoSlider).toHaveCSS("width", "320px")
    await expect(demoSlider.locator(".ui-slider-track")).toHaveCSS("height", "4px")
    await expect(demoThumb).toHaveCSS("width", "12px")
    await expect(demoThumb).toHaveCSS("height", "12px")
    await expect(demoThumb).toHaveAttribute("aria-valuenow", "75")
    await demoThumb.focus()
    await page.keyboard.press("ArrowRight")
    await expect(demoThumb).toHaveAttribute("aria-valuenow", "76")
    await expect(demoThumb).not.toHaveCSS("box-shadow", "none")

    const range = page.locator('[data-doc-preview-name="slider-range"]')
    await expect(range.getByRole("slider")).toHaveCount(2)
    await expect(range.getByRole("slider").nth(0)).toHaveAttribute("aria-valuenow", "25")
    await expect(range.getByRole("slider").nth(1)).toHaveAttribute("aria-valuenow", "50")
    const multiple = page.locator('[data-doc-preview-name="slider-multiple"]')
    await expect(multiple.getByRole("slider")).toHaveCount(3)
    for (const [index, value] of ["10", "20", "70"].entries()) {
      await expect(multiple.getByRole("slider").nth(index)).toHaveAttribute("aria-valuenow", value)
    }

    const vertical = page.locator('[data-doc-preview-name="slider-vertical"]')
    await expect(vertical.locator(".doc-slider.is-vertical")).toHaveCount(2)
    await expect(vertical.locator(".doc-slider.is-vertical").first()).toHaveCSS("height", "160px")
    await expect(vertical.locator(".doc-slider.is-vertical").first()).toHaveCSS("width", "12px")
    const firstVertical = vertical.getByRole("slider").first()
    await firstVertical.focus()
    await page.keyboard.press("ArrowUp")
    await expect(firstVertical).toHaveAttribute("aria-valuenow", "51")

    const controlled = page.locator('[data-doc-preview-name="slider-controlled"]')
    const controlledThumb = controlled.getByRole("slider").first()
    await expect(controlled).toContainText("0.3, 0.7")
    await controlledThumb.focus()
    await page.keyboard.press("ArrowRight")
    await expect(controlled).toContainText("0.4, 0.7")

    const disabled = page.locator('[data-doc-preview-name="slider-disabled"]')
    const disabledThumb = disabled.getByRole("slider")
    await expect(disabledThumb).toHaveAttribute("aria-disabled", "true")
    await expect(disabledThumb).toHaveAttribute("tabindex", "-1")
    await expect(disabled.locator(".doc-slider")).toHaveCSS("opacity", "0.5")

    const rtl = page.locator('[data-doc-preview-name="slider-rtl"]')
    const rtlSlider = rtl.locator(".doc-slider")
    const rtlThumb = rtl.getByRole("slider")
    await expect(rtlSlider).toHaveAttribute("dir", "rtl")
    await rtlThumb.focus()
    await page.keyboard.press("ArrowRight")
    await expect(rtlThumb).toHaveAttribute("aria-valuenow", "74")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlSlider).toHaveAttribute("dir", "ltr")
    await page.keyboard.press("ArrowRight")
    await expect(rtlThumb).toHaveAttribute("aria-valuenow", "75")
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(rtlThumb).toHaveCSS("background-color", "rgb(255, 255, 255)")

    const expectedSources = [
      ["slider-demo", "defaultValue={[75]}"],
      ["slider-range", "defaultValue={[25, 50]}", "step={5}"],
      ["slider-multiple", "defaultValue={[10, 20, 70]}"],
      ["slider-vertical", 'orientation="vertical"'],
      ["slider-controlled", "let values = $state([0.3, 0.7])", "onValueChange={next => { values = next }}"],
      ["slider-disabled", "<Slider disabled"],
      ["slider-rtl", "$state<keyof typeof directions>('ar')", "dir={directions[language]}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("sonner docs match Fict toast content, types, actions, promise, positions, and theme", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/sonner")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(4)
    for (let index = 0; index < 4; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="sonner-demo"]')
    const demoButton = demo.getByRole("button", { name: "Show Toast" })
    await expect(demoButton).toHaveCSS("height", "32px")
    await demoButton.click()
    const demoToast = page.locator('[data-sonner-toast][data-toast-type="default"]')
    await expect(demoToast).toContainText("Event has been created")
    await expect(demoToast).toContainText("Sunday, December 03, 2023 at 9:00 AM")
    await expect(demoToast).toHaveCSS("width", "356px")
    await expect(demoToast).toHaveCSS("border-radius", "10px")
    await expect(demoToast).toHaveCSS("padding", "16px")
    await demoToast.getByRole("button", { name: "Undo" }).click()
    await expect(demoToast).toHaveCount(0)

    const types = page.locator('[data-doc-preview-name="sonner-types"]')
    await expect(types.locator("[data-doc-sonner-trigger]")).toHaveCount(6)
    for (const [label, type, message] of [
      ["Success", "success", "Event has been created"],
      ["Info", "info", "Be at the area 10 minutes before the event time"],
      ["Warning", "warning", "Event start time cannot be earlier than 8am"],
      ["Error", "error", "Event has not been created"],
    ] as const) {
      await types.getByRole("button", { name: label }).click()
      const toast = page.locator(`[data-sonner-toast][data-toast-type="${type}"]`).last()
      await expect(toast).toContainText(message)
      await expect(toast.locator(".doc-sonner-icon")).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(toast).toHaveCount(0)
    }
    await types.getByRole("button", { name: "Promise" }).click()
    const promise = page.locator('[data-sonner-toast][data-toast-type="promise"]')
    await expect(promise).toContainText("Loading...")
    await expect(page.locator('[data-sonner-toast][data-toast-type="success"]')).toContainText("Event has been created", { timeout: 3000 })
    await page.keyboard.press("Escape")

    const description = page.locator('[data-doc-preview-name="sonner-description"]')
    await description.getByRole("button", { name: "Show Toast" }).click()
    await expect(page.locator('[data-sonner-toast]').last()).toContainText("Monday, January 3rd at 6:00pm")
    await page.keyboard.press("Escape")

    const positions = page.locator('[data-doc-preview-name="sonner-position"]')
    await positions.getByRole("button", { name: "Bottom Right" }).click()
    const bottomRight = page.locator('[data-doc-sonner-toaster="bottom-right"]')
    await expect(bottomRight).toHaveCSS("right", "16px")
    await expect(bottomRight).toHaveCSS("bottom", "16px")
    await page.keyboard.press("Escape")
    await positions.getByRole("button", { name: "Top Left" }).click()
    const topLeft = page.locator('[data-doc-sonner-toaster="top-left"]')
    await expect(topLeft).toHaveCSS("top", "16px")
    await expect(topLeft).toHaveCSS("left", "16px")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(topLeft.locator("[data-sonner-toast]")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["sonner-demo", "useSonner()", "Sunday, December 03, 2023 at 9:00 AM", "action: { label: 'Undo' }"],
      ["sonner-types", "variant: 'promise'", "Loading...", "variant: 'success'"],
      ["sonner-description", "Monday, January 3rd at 6:00pm"],
      ["sonner-position", "['Bottom Right', 'bottom-right']", "position })"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("spinner docs match Fict item, custom, sizes, buttons, badges, inputs, empty, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/spinner")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(8)
    for (let index = 0; index < 7; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(7).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="spinner-demo"]')
    await expect(demo.locator(".doc-spinner-item")).toHaveCSS("width", "320px")
    await expect(demo.locator(".doc-spinner-item")).toHaveCSS("height", "52px")
    await expect(demo.getByRole("status", { name: "Loading" })).toHaveCSS("width", "16px")
    await expect(demo.getByRole("status", { name: "Loading" })).toHaveCSS("animation-name", "doc-spinner-spin")
    await expect(demo).toContainText("Processing payment...")
    await expect(demo).toContainText("$100.00")

    const custom = page.locator('[data-doc-preview-name="spinner-custom"]')
    await expect(custom.getByRole("status", { name: "Loading" })).toHaveCount(1)
    const sizes = page.locator('[data-doc-preview-name="spinner-size"]')
    const sizeSpinners = sizes.getByRole("status", { name: "Loading" })
    await expect(sizeSpinners).toHaveCount(4)
    for (const [index, size] of [12, 16, 24, 32].entries()) {
      await expect(sizeSpinners.nth(index)).toHaveCSS("width", `${size}px`)
      await expect(sizeSpinners.nth(index)).toHaveCSS("height", `${size}px`)
    }

    const buttons = page.locator('[data-doc-preview-name="spinner-button"]')
    await expect(buttons.locator("button:disabled")).toHaveCount(3)
    await expect(buttons.getByRole("status", { name: "Loading" })).toHaveCount(3)
    await expect(buttons).toContainText("Loading...")
    await expect(buttons).toContainText("Please wait")
    await expect(buttons).toContainText("Processing")

    const badges = page.locator('[data-doc-preview-name="spinner-badge"]')
    await expect(badges.locator(".doc-badge")).toHaveCount(3)
    await expect(badges.getByRole("status", { name: "Loading" }).first()).toHaveCSS("width", "12px")

    const inputs = page.locator('[data-doc-preview-name="spinner-input-group"]')
    await expect(inputs.locator("input:disabled")).toHaveCount(1)
    await expect(inputs.locator("textarea:disabled")).toHaveCount(1)
    await expect(inputs.getByRole("status", { name: "Loading" })).toHaveCount(2)
    await expect(inputs.getByRole("button", { name: "Send" })).toBeVisible()

    const empty = page.locator('[data-doc-preview-name="spinner-empty"]')
    await expect(empty).toContainText("Processing your request")
    await expect(empty).toContainText("Do not refresh the page.")
    await expect(empty.getByRole("button", { name: "Cancel" })).toBeVisible()

    const rtl = page.locator('[data-doc-preview-name="spinner-rtl"]')
    await expect(rtl.locator(".doc-spinner-item")).toHaveAttribute("dir", "rtl")
    await expect(rtl).toContainText("جاري معالجة الدفع...")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl).toContainText("מעבד תשלום...")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-spinner-item")).toHaveAttribute("dir", "ltr")
    await expect(rtl).toContainText("Processing payment...")
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(rtl.locator(".doc-spinner-item")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["spinner-demo", "Processing payment...", "$100.00"],
      ["spinner-custom", 'aria-label="Loading"'],
      ["spinner-size", 'size="sm"', 'size="lg"', 'class="size-8"'],
      ["spinner-button", "Loading...", "Please wait", "Processing"],
      ["spinner-badge", '<Badge variant="secondary">', '<Badge variant="outline">'],
      ["spinner-input-group", "<textarea", "Validating..."],
      ["spinner-empty", "Do not refresh the page."],
      ["spinner-rtl", "$state<keyof typeof translations>", "מעבד תשלום..."],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("switch docs match Fict fields, cards, disabled, invalid, sizes, keyboard, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/switch")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(7)
    for (let index = 0; index < 6; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(6).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const demo = page.locator('[data-doc-preview-name="switch-demo"]')
    const airplane = demo.getByRole("switch", { name: "Airplane Mode" })
    await expect(airplane).toHaveCSS("width", "32px")
    await expect(airplane).toHaveCSS("height", "18.3906px")
    await expect(airplane.locator("span")).toHaveCSS("width", "16px")
    await expect(airplane).toHaveAttribute("aria-checked", "false")
    await airplane.click()
    await expect(airplane).toHaveAttribute("aria-checked", "true")
    await airplane.focus()
    await page.keyboard.press("Space")
    await expect(airplane).toHaveAttribute("aria-checked", "false")
    await expectFocusRing(airplane)

    const description = page.locator('[data-doc-preview-name="switch-description"]')
    await expect(description.locator(".doc-switch-field")).toHaveCSS("width", "384px")
    await expect(description).toContainText("Focus is shared across devices")

    const cards = page.locator('[data-doc-preview-name="switch-choice-card"]')
    await expect(cards.locator(".doc-switch-field.is-card")).toHaveCount(2)
    const cardSwitches = cards.getByRole("switch")
    await expect(cardSwitches.nth(0)).toHaveAttribute("aria-checked", "false")
    await expect(cardSwitches.nth(1)).toHaveAttribute("aria-checked", "true")
    await cardSwitches.nth(0).click()
    await expect(cardSwitches.nth(0)).toHaveAttribute("aria-checked", "true")
    await expect(cardSwitches.nth(1)).toHaveAttribute("aria-checked", "true")

    const disabled = page.locator('[data-doc-preview-name="switch-disabled"]')
    const disabledSwitch = disabled.getByRole("switch", { name: "Disabled" })
    await expect(disabledSwitch).toBeDisabled()
    await expect(disabled.locator(".doc-switch-inline")).toHaveCSS("opacity", "0.5")

    const invalid = page.locator('[data-doc-preview-name="switch-invalid"]')
    const invalidSwitch = invalid.getByRole("switch", { name: "Accept terms and conditions" })
    await expect(invalidSwitch).toHaveAttribute("aria-invalid", "true")
    await expect(invalid.locator(".doc-switch-field")).toHaveClass(/is-invalid/)

    const sizes = page.locator('[data-doc-preview-name="switch-sizes"]')
    const small = sizes.getByRole("switch", { name: "Small" })
    const normal = sizes.getByRole("switch", { name: "Default" })
    await expect(small).toHaveCSS("width", "24px")
    await expect(small).toHaveCSS("height", "14px")
    await expect(small.locator("span")).toHaveCSS("width", "12px")
    await expect(normal).toHaveCSS("width", "32px")

    const rtl = page.locator('[data-doc-preview-name="switch-rtl"]')
    const rtlField = rtl.locator(".doc-switch-field")
    const rtlSwitch = rtl.getByRole("switch")
    await expect(rtlField).toHaveAttribute("dir", "rtl")
    await expect(rtl).toContainText("المشاركة عبر الأجهزة")
    await rtlSwitch.click()
    await expect(rtlSwitch.locator("span")).toHaveCSS("transform", "matrix(1, 0, 0, 1, -14, 0)")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlField).toHaveAttribute("dir", "ltr")
    await expect(rtl).toContainText("Share across devices")
    await expect(rtlSwitch.locator("span")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 14, 0)")
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(rtlSwitch).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["switch-demo", '<Switch id="airplane-mode" /> Airplane Mode'],
      ["switch-description", "Focus is shared across devices, and turns off when you leave the app."],
      ["switch-choice-card", '<Switch id="switch-notifications" defaultChecked />'],
      ["switch-disabled", '<Switch id="switch-disabled-unchecked" disabled />'],
      ["switch-invalid", 'aria-invalid="true"'],
      ["switch-sizes", 'size="sm"'],
      ["switch-rtl", "$state<keyof typeof translations>", "המיקוד משותף בין מכשירים"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("table docs match Fict invoices, footer, action menus, row geometry, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/table")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(4)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "480px")
    await expect(previews.nth(1).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(2).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    await expect(previews.nth(3).locator(".doc-component-preview-stage")).toHaveCSS("height", "451.5px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Done Design CN")

    const demo = page.locator('[data-doc-preview-name="table-demo"]')
    const demoTable = demo.locator("table")
    await expect(demoTable).toHaveCSS("width", "558px")
    await expect(demoTable.locator("thead tr")).toHaveCSS("height", "40px")
    await expect(demoTable.locator("tbody tr")).toHaveCount(7)
    await expect(demoTable.locator("tbody tr").first()).toHaveCSS("height", "37px")
    await expect(demoTable.locator("tfoot")).toHaveCount(1)
    await expect(demoTable.locator("caption")).toContainText("A list of your recent invoices.")
    await expect(demoTable.locator("th")).toHaveText(["Invoice", "Status", "Method", "Amount"])
    await expect(demoTable.locator("tbody tr").first().locator("td")).toHaveText(["INV001", "Paid", "Credit Card", "$250.00"])
    await expect(demoTable.locator("tfoot tr td")).toHaveText(["Total", "$2,500.00"])

    const footer = page.locator('[data-doc-preview-name="table-footer"]')
    await expect(footer.locator("tbody tr")).toHaveCount(3)
    await expect(footer.locator("tfoot")).toContainText("$2,500.00")

    const actions = page.locator('[data-doc-preview-name="table-actions"]')
    await expect(actions.locator("tbody tr")).toHaveCount(3)
    await expect(actions.locator("tbody tr").first()).toContainText("Wireless Mouse")
    const actionTrigger = actions.getByRole("button", { name: "Open menu for Wireless Mouse" })
    await actionTrigger.click()
    const menu = page.getByRole("menu")
    await expect(menu).toBeVisible()
    await expect(menu.getByRole("menuitem")).toHaveText(["Edit", "Duplicate", "Delete"])
    await expect(menu.getByRole("menuitem", { name: "Delete" })).toHaveClass(/is-destructive/)
    await page.keyboard.press("Escape")
    await expect(menu).toBeHidden()
    await expect(actionTrigger).toBeFocused()

    const rtl = page.locator('[data-doc-preview-name="table-rtl"]')
    const rtlTable = rtl.locator("table")
    await expect(rtlTable).toHaveAttribute("dir", "rtl")
    await expect(rtlTable.locator("th")).toHaveText(["الفاتورة", "الحالة", "الطريقة", "المبلغ"])
    await expect(rtlTable.locator("tbody tr")).toHaveCount(7)
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlTable.locator("th")).toHaveText(["חשבונית", "סטטוס", "שיטה", "סכום"])
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlTable).toHaveAttribute("dir", "ltr")
    await expect(rtlTable.locator("th")).toHaveText(["Invoice", "Status", "Method", "Amount"])
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(rtlTable.locator("tfoot")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["table-demo", "INV007", "<TableFooter>", "$2,500.00"],
      ["table-footer", "INV003", "Bank Transfer"],
      ["table-actions", "Wireless Mouse", '<DropdownMenuContent align="end">', "text-destructive"],
      ["table-rtl", "$state<keyof typeof translations>", "חשבונית", "העברה בנקאית"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("tabs docs match Fict cards, line, vertical, disabled, icons, keyboard, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/tabs")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(6)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "384px")
    for (let index = 1; index < 5; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(5).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Structured navigation")

    const demo = page.locator('[data-doc-preview-name="tabs-demo"]')
    const demoTabs = demo.getByRole("tab")
    await expect(demo.locator("[data-doc-preview-tabs]")).toHaveCSS("width", "400px")
    await expect(demoTabs).toHaveCount(4)
    await expect(demoTabs.nth(0)).toHaveAttribute("aria-selected", "true")
    await expect(demo.getByRole("tabpanel")).toHaveCount(1)
    await expect(demo.getByRole("tabpanel")).toContainText("You have 12 active projects")
    await demo.getByRole("tab", { name: "Analytics" }).click()
    await expect(demo.getByRole("tabpanel")).toContainText("Page views are up 25%")
    await expect(demo.getByRole("tab", { name: "Analytics" })).toHaveAttribute("aria-selected", "true")
    await page.keyboard.press("ArrowRight")
    await expect(demo.getByRole("tab", { name: "Reports" })).toBeFocused()
    await expect(demo.getByRole("tabpanel")).toContainText("5 reports ready")
    await page.keyboard.press("End")
    await expect(demo.getByRole("tab", { name: "Settings" })).toBeFocused()

    const line = page.locator('[data-doc-preview-name="tabs-line"]')
    await expect(line.locator(".doc-preview-tabs-list")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
    await expect(line.getByRole("tab")).toHaveText(["Overview", "Analytics", "Reports"])
    await line.getByRole("tab", { name: "Reports" }).click()
    await expect(line.getByRole("tab", { name: "Reports" })).toHaveAttribute("aria-selected", "true")

    const vertical = page.locator('[data-doc-preview-name="tabs-vertical"]')
    const verticalRoot = vertical.locator("[data-doc-preview-tabs]")
    await expect(verticalRoot).toHaveAttribute("data-orientation", "vertical")
    await expect(vertical.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical")
    await vertical.getByRole("tab", { name: "Account" }).focus()
    await page.keyboard.press("ArrowDown")
    await expect(vertical.getByRole("tab", { name: "Password" })).toBeFocused()

    const disabled = page.locator('[data-doc-preview-name="tabs-disabled"]')
    await expect(disabled.getByRole("tab", { name: "Disabled" })).toBeDisabled()
    await disabled.getByRole("tab", { name: "Home" }).focus()
    await page.keyboard.press("ArrowRight")
    await expect(disabled.getByRole("tab", { name: "Home" })).toBeFocused()

    const icons = page.locator('[data-doc-preview-name="tabs-icons"]')
    await expect(icons.getByRole("tab")).toHaveCount(2)
    await expect(icons.locator(".doc-preview-tab svg")).toHaveCount(2)

    const rtl = page.locator('[data-doc-preview-name="tabs-rtl"]')
    const rtlRoot = rtl.locator("[data-doc-preview-tabs]")
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await expect(rtl.getByRole("tab")).toHaveText(["نظرة عامة", "التحليلات", "التقارير", "الإعدادات"])
    await rtl.getByRole("tab", { name: "نظرة عامة" }).focus()
    await page.keyboard.press("ArrowLeft")
    await expect(rtl.getByRole("tab", { name: "التحليلات" })).toBeFocused()
    await expect(rtl.getByRole("tabpanel")).toContainText("زادت مشاهدات الصفحة")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByRole("tab")).toHaveText(["סקירה כללית", "אנליטיקה", "דוחות", "הגדרות"])
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlRoot).toHaveAttribute("dir", "ltr")
    await expect(rtl.getByRole("tab")).toHaveText(["Overview", "Analytics", "Reports", "Settings"])
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(rtl.locator(".doc-preview-tabs-card").first()).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["tabs-demo", "You have 12 active projects and 3 pending tasks.", "<CardContent"],
      ["tabs-line", 'variant="line"'],
      ["tabs-vertical", 'orientation="vertical"', 'value="notifications"'],
      ["tabs-disabled", 'value="settings" disabled'],
      ["tabs-icons", "<AppWindowIcon />Preview", "<CodeIcon />Code"],
      ["tabs-rtl", "$state<keyof typeof translations>", "צפיות בדף עלו ב-25%"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("typography docs expose the rendered Fict markup for every example", async ({ page }) => {
    await page.goto("/docs/components/fict/typography")
    await waitForClientReady(page)

    const expectedSources = [
      ["typography-demo", "Taxing Laughter: The Joke Tax Chronicles", "<blockquote", "<table"],
      ["typography-h1", "text-4xl font-extrabold"],
      ["typography-h2", "The People of the Kingdom"],
      ["typography-h3", "The Joke Tax"],
      ["typography-h4", "People stopped telling jokes"],
      ["typography-p", "repealed the joke tax"],
      ["typography-blockquote", "<blockquote"],
      ["typography-table", "People&apos;s happiness", "Ecstatic"],
      ["typography-list", "1st level of puns: 5 gold coins"],
      ["typography-inline-code", "@fictjs/radix-ui"],
      ["typography-lead", "expects a response"],
      ["typography-large", "Are you absolutely sure?"],
      ["typography-small", "Email address"],
      ["typography-muted", "Enter your email address."],
      ["typography-rtl", "$state<keyof typeof translations>", "מיסוי הצחוק"],
    ] as const
    await expect(page.locator(".doc-component-card:not(.doc-component-card-source)")).toHaveCount(expectedSources.length)
    const inlineCode = page.locator('[data-doc-preview-name="typography-inline-code"]')
    await expect(inlineCode).toContainText("@fictjs/radix-ui")
    await expect(inlineCode).not.toContainText("@radix-ui/react-alert-dialog")
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      await expect(source).not.toContainText("Semantic typography rendered by Fict.")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("textarea docs match Fict base, field, disabled, invalid, button, focus, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/textarea")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(6)
    for (let index = 0; index < 5; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(5).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Email name@example.com")

    const demo = page.locator('[data-doc-preview-name="textarea-demo"]')
    const demoTextarea = demo.getByPlaceholder("Type your message here.")
    await expect(demoTextarea).toHaveCSS("width", "320px")
    await expect(demoTextarea).toHaveCSS("min-height", "64px")
    await expect(demoTextarea).toHaveCSS("border-radius", "10px")
    await expect(demoTextarea).toHaveCSS("padding", "8px 10px")
    await demoTextarea.fill("A detailed message")
    await expect(demoTextarea).toHaveValue("A detailed message")
    await expectFocusRing(demoTextarea)

    const field = page.locator('[data-doc-preview-name="textarea-field"]')
    await expect(field.locator("label")).toHaveText("Message")
    await expect(field).toContainText("Enter your message below.")
    await expect(field.locator("label")).toHaveAttribute("for", "textarea-message")

    const disabled = page.locator('[data-doc-preview-name="textarea-disabled"]')
    await expect(disabled.locator("textarea")).toBeDisabled()
    await expect(disabled.locator(".doc-textarea-field")).toHaveCSS("opacity", "0.5")

    const invalid = page.locator('[data-doc-preview-name="textarea-invalid"]')
    const invalidTextarea = invalid.locator("textarea")
    await expect(invalidTextarea).toHaveAttribute("aria-invalid", "true")
    await expect(invalid).toContainText("Please enter a valid message.")
    await expect(invalid.locator(".doc-textarea-field")).toHaveClass(/is-invalid/)

    const button = page.locator('[data-doc-preview-name="textarea-button"]')
    await expect(button.locator("textarea")).toHaveCSS("width", "320px")
    await expect(button.getByRole("button", { name: "Send message" })).toHaveCSS("width", "320px")

    const rtl = page.locator('[data-doc-preview-name="textarea-rtl"]')
    const rtlTextarea = rtl.locator("textarea")
    await expect(rtlTextarea).toHaveAttribute("dir", "rtl")
    await expect(rtlTextarea).toHaveAttribute("placeholder", "تعليقاتك تساعدنا على التحسين...")
    await expect(rtl).toContainText("شاركنا أفكارك حول خدمتنا.")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlTextarea).toHaveAttribute("placeholder", "המשוב שלך עוזר לנו להשתפר...")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlTextarea).toHaveAttribute("dir", "ltr")
    await expect(rtlTextarea).toHaveAttribute("placeholder", "Your feedback helps us improve...")
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await rtlTextarea.focus()
    await expectFocusRing(rtlTextarea)

    const expectedSources = [
      ["textarea-demo", 'placeholder="Type your message here."'],
      ["textarea-field", '<Label for="message">Message</Label>', "Enter your message below."],
      ["textarea-disabled", 'disabled placeholder="Type your message here."'],
      ["textarea-invalid", 'aria-invalid="true"', "Please enter a valid message."],
      ["textarea-button", "<Button>Send message</Button>"],
      ["textarea-rtl", "$state<keyof typeof translations>", "placeholder={text().placeholder}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("toggle docs match Fict variants, text, sizes, disabled, pressed state, focus, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/toggle")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(6)
    for (let index = 0; index < 5; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(5).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Primary Outline Ghost")

    const demo = page.locator('[data-doc-preview-name="toggle-demo"]')
    const bookmark = demo.getByRole("button", { name: "Toggle bookmark" })
    await expect(bookmark).toHaveCSS("height", "28px")
    await expect(bookmark).toHaveCSS("border-radius", "8px")
    await expect(bookmark).toHaveAttribute("aria-pressed", "false")
    await bookmark.click()
    await expect(bookmark).toHaveAttribute("aria-pressed", "true")
    await expect(bookmark.locator("svg")).not.toHaveCSS("fill", "none")
    await bookmark.focus()
    await page.keyboard.press("Space")
    await expect(bookmark).toHaveAttribute("aria-pressed", "false")
    await expectFocusRing(bookmark)

    const outline = page.locator('[data-doc-preview-name="toggle-outline"]')
    await expect(outline.locator(".doc-toggle.is-outline")).toHaveCount(2)
    await expect(outline.getByRole("button")).toHaveText(["Italic", "Bold", "View Code"])
    await outline.getByRole("button", { name: "Toggle italic" }).click()
    await expect(outline.getByRole("button", { name: "Toggle italic" })).toHaveAttribute("aria-pressed", "true")
    await expect(outline.getByRole("button", { name: "Toggle bold" })).toHaveAttribute("aria-pressed", "false")

    const text = page.locator('[data-doc-preview-name="toggle-text"]')
    await expect(text.getByRole("button", { name: "Toggle italic" })).not.toHaveClass(/is-outline/)

    const sizes = page.locator('[data-doc-preview-name="toggle-sizes"]')
    await expect(sizes.getByRole("button", { name: "Toggle small" })).toHaveCSS("height", "28px")
    await expect(sizes.getByRole("button", { name: "Toggle default" })).toHaveCSS("height", "32px")
    await expect(sizes.getByRole("button", { name: "Toggle large" })).toHaveCSS("height", "36px")

    const disabled = page.locator('[data-doc-preview-name="toggle-disabled"]')
    await expect(disabled.locator(".doc-toggle:disabled")).toHaveCount(2)
    await expect(disabled.locator(".doc-toggle:disabled").first()).toHaveCSS("opacity", "0.5")

    const rtl = page.locator('[data-doc-preview-name="toggle-rtl"]')
    const rtlToggle = rtl.getByRole("button", { name: "Toggle bookmark" })
    await expect(rtlToggle).toHaveAttribute("dir", "rtl")
    await expect(rtl).toContainText("إشارة مرجعية")
    await rtlToggle.click()
    await expect(rtlToggle).toHaveAttribute("aria-pressed", "true")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl).toContainText("סימנייה")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlToggle).toHaveAttribute("dir", "ltr")
    await expect(rtl).toContainText("Bookmark")
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(rtlToggle).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["toggle-demo", "<BookmarkIcon />Bookmark"],
      ["toggle-outline", 'aria-label="Toggle bold"'],
      ["toggle-text", 'aria-label="Toggle italic">Italic'],
      ["toggle-sizes", 'size="sm"', 'size="lg"'],
      ["toggle-disabled", '<Toggle disabled', 'disabled variant="outline"'],
      ["toggle-rtl", "$state<keyof typeof translations>", "dir={text().dir}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("toggle group docs match Fict single, multiple, sizes, spacing, vertical, font, keyboard, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/toggle-group")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(8)
    for (let index = 0; index < 7; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(7).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Primary Outline Ghost")

    const demo = page.locator('[data-doc-preview-name="toggle-group-demo"]')
    const demoItems = demo.locator("[data-doc-toggle-group-item]")
    await expect(demoItems).toHaveCount(3)
    await expect(demo.locator("[data-doc-toggle-group]")).toHaveAttribute("data-type", "multiple")
    await demoItems.nth(0).click()
    await demoItems.nth(1).click()
    await expect(demoItems.nth(0)).toHaveAttribute("aria-pressed", "true")
    await expect(demoItems.nth(1)).toHaveAttribute("aria-pressed", "true")
    await expect(demoItems.nth(2)).toHaveAttribute("aria-pressed", "false")

    const outline = page.locator('[data-doc-preview-name="toggle-group-outline"]')
    const all = outline.getByRole("button", { name: "All" })
    const missed = outline.getByRole("button", { name: "Missed" })
    await expect(all).toHaveAttribute("aria-pressed", "true")
    await missed.click()
    await expect(all).toHaveAttribute("aria-pressed", "false")
    await expect(missed).toHaveAttribute("aria-pressed", "true")
    await page.keyboard.press("ArrowLeft")
    await expect(all).toBeFocused()
    await page.keyboard.press("Space")
    await expect(all).toHaveAttribute("aria-pressed", "true")
    await expectFocusRing(all)

    const sizes = page.locator('[data-doc-preview-name="toggle-group-sizes"]')
    const sizeGroups = sizes.locator("[data-doc-toggle-group]")
    await expect(sizeGroups).toHaveCount(2)
    await expect(sizeGroups.nth(0).locator("button").first()).toHaveCSS("height", "28px")
    await expect(sizeGroups.nth(1).locator("button").first()).toHaveCSS("height", "32px")

    const spacing = page.locator('[data-doc-preview-name="toggle-group-spacing"] [data-doc-toggle-group]')
    await expect(spacing).toHaveAttribute("data-spacing", "2")
    await expect(spacing).toHaveCSS("gap", "8px")

    const vertical = page.locator('[data-doc-preview-name="toggle-group-vertical"]')
    const verticalGroup = vertical.locator("[data-doc-toggle-group]")
    await expect(verticalGroup).toHaveAttribute("data-orientation", "vertical")
    await expect(vertical.locator("[data-doc-toggle-group-item]").nth(0)).toHaveAttribute("aria-pressed", "true")
    await expect(vertical.locator("[data-doc-toggle-group-item]").nth(1)).toHaveAttribute("aria-pressed", "true")
    await vertical.locator("[data-doc-toggle-group-item]").nth(0).focus()
    await page.keyboard.press("ArrowDown")
    await expect(vertical.locator("[data-doc-toggle-group-item]").nth(1)).toBeFocused()

    const disabled = page.locator('[data-doc-preview-name="toggle-group-disabled"]')
    await expect(disabled.locator("[data-doc-toggle-group-item]:disabled")).toHaveCount(3)

    const font = page.locator('[data-doc-preview-name="toggle-group-font-weight-selector"]')
    await expect(font.locator("[data-doc-toggle-group-item]")).toHaveCount(4)
    await expect(font.getByRole("button", { name: "Normal" })).toHaveAttribute("aria-pressed", "true")
    await font.getByRole("button", { name: "Bold" }).click()
    await expect(font.locator("[data-doc-toggle-font-output]")).toHaveText("font-bold")
    await expect(font.getByRole("button", { name: "Normal" })).toHaveAttribute("aria-pressed", "false")

    const rtl = page.locator('[data-doc-preview-name="toggle-group-rtl"]')
    const rtlGroup = rtl.locator("[data-doc-toggle-group]")
    await expect(rtlGroup).toHaveAttribute("dir", "rtl")
    await expect(rtl.locator("[data-doc-toggle-group-item]")).toHaveText(["قائمة", "شبكة", "بطاقات"])
    await rtl.getByRole("button", { name: "قائمة" }).focus()
    await page.keyboard.press("ArrowLeft")
    await expect(rtl.getByRole("button", { name: "شبكة" })).toBeFocused()
    await page.keyboard.press("Space")
    await expect(rtl.getByRole("button", { name: "شبكة" })).toHaveAttribute("aria-pressed", "true")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.locator("[data-doc-toggle-group-item]")).toHaveText(["רשימה", "רשת", "כרטיסים"])
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlGroup).toHaveAttribute("dir", "ltr")
    await expect(rtl.locator("[data-doc-toggle-group-item]")).toHaveText(["List", "Grid", "Cards"])
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(rtl.getByRole("button", { name: "Grid" })).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

    const expectedSources = [
      ["toggle-group-demo", 'variant="outline" type="multiple"', '<FormatIcon kind="underline" />'],
      ["toggle-group-outline", 'defaultValue="all"'],
      ["toggle-group-sizes", 'size="sm"', "directions.map"],
      ["toggle-group-spacing", "spacing={2}"],
      ["toggle-group-vertical", 'orientation="vertical"', "defaultValue={['bold', 'italic']}"],
      ["toggle-group-disabled", '<ToggleGroup disabled type="multiple">'],
      ["toggle-group-font-weight-selector", "$state<(typeof weights)[number]>", "onValueChange"],
      ["toggle-group-rtl", "$state<keyof typeof translations>", "dir={text().direction}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("tooltip docs match Fict sides, keyboard, disabled triggers, dismissal, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/tooltip")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(5)
    for (let index = 0; index < 4; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(4).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Registry preview surface")

    const tooltip = page.locator("#ui-tooltip")
    const demo = page.locator('[data-doc-preview-name="tooltip-demo"]')
    const hover = demo.getByRole("button", { name: "Hover" })
    await hover.hover()
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toHaveText("Add to library")
    await expect(tooltip).toHaveAttribute("data-side", "top")
    await expect(hover).toHaveAttribute("aria-describedby", "ui-tooltip")
    await page.keyboard.press("Escape")
    await expect(tooltip).toBeHidden()
    await expect(hover).not.toHaveAttribute("aria-describedby")

    const sides = page.locator('[data-doc-preview-name="tooltip-sides"]')
    await sides.scrollIntoViewIfNeeded()
    for (const side of ["left", "top", "bottom", "right"] as const) {
      const trigger = sides.getByRole("button", { name: side, exact: true })
      await trigger.hover()
      await expect(tooltip).toBeVisible()
      await expect(tooltip).toHaveAttribute("data-side", side)
      const positions = await Promise.all([trigger, tooltip].map((locator) => locator.boundingBox()))
      const [triggerBox, tooltipBox] = positions
      expect(triggerBox).not.toBeNull()
      expect(tooltipBox).not.toBeNull()
      if (side === "left") expect(tooltipBox!.x + tooltipBox!.width).toBeLessThan(triggerBox!.x)
      if (side === "right") expect(tooltipBox!.x).toBeGreaterThan(triggerBox!.x + triggerBox!.width)
      if (side === "top") expect(tooltipBox!.y + tooltipBox!.height).toBeLessThan(triggerBox!.y)
      if (side === "bottom") expect(tooltipBox!.y).toBeGreaterThan(triggerBox!.y + triggerBox!.height)
      await page.mouse.move(2, 2)
    }

    const keyboard = page.locator('[data-doc-preview-name="tooltip-keyboard"]')
    const save = keyboard.getByRole("button", { name: "Save changes" })
    await expectFocusRing(save)
    await expect(tooltip).toContainText("Save Changes")
    await expect(tooltip.locator("kbd.doc-kbd")).toHaveText("S")

    const disabled = page.locator('[data-doc-preview-name="tooltip-disabled"]')
    await disabled.scrollIntoViewIfNeeded()
    await disabled.locator(".doc-tooltip-disabled").hover()
    await expect(tooltip).toHaveText("This feature is currently unavailable")
    await expect(disabled.getByRole("button", { name: "Disabled" })).toBeDisabled()

    const rtl = page.locator('[data-doc-preview-name="tooltip-rtl"]')
    await rtl.scrollIntoViewIfNeeded()
    const rtlButtons = rtl.locator(".doc-tooltip-row .doc-tooltip-button")
    await expect(rtlButtons).toHaveText(["يسار", "أعلى", "أسفل", "يمين"])
    await rtl.getByRole("button", { name: "يسار" }).hover()
    await expect(tooltip).toHaveText("إضافة إلى المكتبة")
    await expect(tooltip).toHaveAttribute("data-side", "left")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlButtons).toHaveText(["שמאל", "למעלה", "למטה", "ימין"])
    await rtl.getByRole("button", { name: "שמאל" }).hover()
    await expect(tooltip).toHaveText("הוסף לספרייה")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-tooltip-row")).toHaveAttribute("dir", "ltr")
    await rtl.getByRole("button", { name: "Left" }).hover()
    await expect(tooltip).toHaveText("Add to library")
    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(tooltip).toHaveCSS("background-color", "oklch(0.922 0 0)")

    const expectedSources = [
      ["tooltip-demo", "<p>Add to library</p>"],
      ["tooltip-sides", "<TooltipContent side={side}>", "['left', 'top', 'bottom', 'right']"],
      ["tooltip-keyboard", "Save Changes <Kbd>S</Kbd>"],
      ["tooltip-disabled", "This feature is currently unavailable", "disabled>Disabled</Button>"],
      ["tooltip-rtl", "$state<keyof typeof translations>", "הוסף לספרייה"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("kbd docs match Fict keys, groups, buttons, tooltips, input group, and RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/docs/components/fict/kbd")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(6)
    for (let index = 0; index < 5; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS(
        "height",
        "288px",
      )
    }
    await expect(previews.nth(5).locator(".doc-component-preview-stage")).toHaveCSS(
      "height",
      "352px",
    )
    expect((await previews.allInnerTexts()).join(" ")).not.toContain("Purposeful type")

    const demo = page.locator('[data-doc-preview-name="kbd-demo"]')
    await expectIntrinsicWidth(demo.locator(".doc-kbd-stack"), 94.1719)
    await expect(demo.locator(".doc-kbd-stack")).toHaveCSS("height", "58.5px")
    await expect(demo.locator('[data-slot="kbd-group"]')).toHaveCount(2)
    const demoKeys = demo.locator('[data-slot="kbd"]')
    await expect(demoKeys).toHaveCount(6)
    await expect(demoKeys).toHaveText(["⌘", "⇧", "⌥", "⌃", "Ctrl", "B"])
    await expect(demoKeys.nth(0)).toHaveCSS("width", "20px")
    await expectIntrinsicWidth(demoKeys.nth(1), 22.1719)
    await expectIntrinsicWidth(demoKeys.nth(4), 29.2031)
    for (let index = 0; index < 6; index += 1) {
      await expect(demoKeys.nth(index)).toHaveCSS("height", "20px")
      await expect(demoKeys.nth(index)).toHaveCSS("font-size", "12px")
      await expect(demoKeys.nth(index)).toHaveCSS("line-height", "16px")
      await expect(demoKeys.nth(index)).toHaveCSS("border-radius", "6px")
    }

    const group = page.locator('[data-doc-preview-name="kbd-group"]')
    await expectIntrinsicWidth(group.locator(".doc-kbd-stack"), 323.406)
    await expect(group.locator(".doc-kbd-stack")).toHaveCSS("height", "21px")
    await expect(group.locator('[data-slot="kbd"]')).toHaveText(["Ctrl + B", "Ctrl + K"])
    await expect(group).toContainText("to open the command palette")

    const button = page.locator('[data-doc-preview-name="kbd-button"]')
    const accept = button.getByRole("button", { name: "Accept ⏎" })
    await expectIntrinsicWidth(accept, 93.7344)
    await expect(accept).toHaveCSS("height", "32px")
    await expectIntrinsicWidth(accept.locator('[data-slot="kbd"]'), 21.125)

    const tooltipPreview = page.locator('[data-doc-preview-name="kbd-tooltip"]')
    const tooltipButtons = tooltipPreview.locator(".doc-kbd-tooltip-buttons")
    await expectIntrinsicWidth(tooltipButtons, 106.688)
    const save = tooltipPreview.getByRole("button", { name: "Save" })
    await save.scrollIntoViewIfNeeded()
    await page.waitForTimeout(100)
    await save.hover()
    const tooltip = page.locator('.ui-tooltip[data-kbd-tooltip="true"]')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText("Save Changes")
    await expect(tooltip.locator('[data-slot="kbd"]')).toHaveText("S")
    await expect(tooltip.locator('[data-slot="kbd"]')).toHaveCSS("width", "20px")
    await expect(tooltip).toHaveCSS("height", "32px")
    await page.mouse.move(0, 0)
    await expect(tooltip).toBeHidden()

    const print = tooltipPreview.getByRole("button", { name: "Print" })
    await print.focus()
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText("Print Document")
    await expect(tooltip.locator('[data-slot="kbd"]')).toHaveText(["Ctrl", "P"])
    await page.keyboard.press("Escape")
    await expect(tooltip).toBeHidden()

    const inputPreview = page.locator('[data-doc-preview-name="kbd-input-group"]')
    const inputGroup = inputPreview.locator('[data-slot="input-group"]')
    await expect(inputGroup).toHaveCSS("width", "320px")
    await expect(inputGroup).toHaveCSS("height", "32px")
    await expect(inputPreview.locator('[data-slot="kbd"]')).toHaveText(["⌘", "K"])
    const search = inputPreview.getByPlaceholder("Search...")
    await search.focus()
    await expect(inputGroup).toHaveCSS("box-shadow", /3px/)

    const rtl = page.locator('[data-doc-preview-name="kbd-rtl"]')
    const rtlStack = rtl.locator(".doc-kbd-stack")
    await expectIntrinsicWidth(rtlStack, 94.1719)
    await expect(rtlStack).toHaveAttribute("dir", "rtl")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlStack).toHaveAttribute("dir", "rtl")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlStack).toHaveAttribute("dir", "ltr")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await save.scrollIntoViewIfNeeded()
    await save.focus()
    await expect(tooltip).toBeVisible()
    await expect(tooltip.locator('[data-slot="kbd"]')).not.toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    )

    const expectedSources = [
      ["kbd-demo", "<KbdGroup>", "<Kbd>Ctrl</Kbd>"],
      ["kbd-group", "to open the command palette"],
      ["kbd-button", "Accept <Kbd>⏎</Kbd>"],
      ["kbd-tooltip", "Save Changes", "Print Document"],
      ["kbd-input-group", 'placeholder="Search..."', "<Kbd>⌘</Kbd>"],
      ["kbd-rtl", "$state<'ar' | 'he' | 'en'>"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })


  test("collapsible docs match Fict geometry, state, keyboard, settings, file tabs, and RTL", async ({ page }) => {
    await page.goto("/docs/components/fict/collapsible")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    await expect(previews).toHaveCount(5)
    for (let index = 0; index < 3; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(3).locator(".doc-component-preview-stage")).toHaveCSS("height", "576px")
    await expect(previews.nth(4).locator(".doc-component-preview-stage")).toHaveCSS("height", "352px")

    const demo = page.locator('[data-doc-preview-name="collapsible-demo"]')
    const demoRoot = demo.locator("[data-doc-collapsible]")
    const demoTrigger = demo.locator("[data-doc-collapsible-trigger]")
    await expect(demoRoot).toHaveCSS("width", "350px")
    await expect(demoRoot).toHaveCSS("height", "78px")
    await expect(demoTrigger).toHaveAttribute("aria-expanded", "false")
    await demoTrigger.focus()
    await page.keyboard.press("Enter")
    await expect(demoTrigger).toHaveAttribute("aria-expanded", "true")
    await expect(demo.locator('[data-slot="collapsible-content"]')).toBeVisible()
    await expect(demoRoot).toHaveCSS("height", "210px")
    await page.keyboard.press("Space")
    await expect(demoTrigger).toHaveAttribute("aria-expanded", "false")

    const basicCard = page.locator('[data-doc-preview-name="collapsible-basic"] [data-slot="card"]')
    await expect(basicCard).toHaveCSS("width", "384px")
    await expect(basicCard).toHaveCSS("height", "32px")

    const settings = page.locator('[data-doc-preview-name="collapsible-settings"]')
    const settingsCard = settings.locator('[data-slot="card"]')
    const settingsTrigger = settings.locator("[data-doc-collapsible-trigger]")
    await expect(settingsCard).toHaveCSS("width", "320px")
    await expect(settings.getByRole("textbox")).toHaveCount(2)
    await settingsTrigger.click()
    await expect(settingsTrigger).toHaveAttribute("aria-expanded", "true")
    await expect(settings.getByRole("textbox")).toHaveCount(4)
    await expect(settingsTrigger).toHaveAttribute("aria-label", "Collapse radius controls")

    const tree = page.locator('[data-doc-preview-name="collapsible-file-tree"]')
    const treeCard = tree.locator('[data-slot="card"]')
    await expect(treeCard).toHaveCSS("width", "256px")
    await expect(treeCard).toHaveCSS("height", "308px")
    const tabs = tree.getByRole("tab")
    await expect(tabs).toHaveCount(2)
    await tabs.nth(0).focus()
    await page.keyboard.press("ArrowRight")
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true")
    await expect(tabs.nth(1)).toBeFocused()

    const rtl = page.locator('[data-doc-preview-name="collapsible-rtl"]')
    const rtlRoot = rtl.locator("[data-doc-collapsible]")
    await expect(rtlRoot).toHaveAttribute("dir", "rtl")
    await expect(rtlRoot).toContainText("الطلب #4189")
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtlRoot).toContainText("הזמנה #4189")
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtlRoot).toHaveAttribute("dir", "ltr")
    await expect(rtlRoot).toContainText("Order #4189")
    await rtl.locator("[data-doc-collapsible-trigger]").focus()
    await page.keyboard.press("Space")
    await expect(rtl.locator('[data-slot="collapsible-content"]')).toBeVisible()
    await expect(rtlRoot).toContainText("Shipping address")

    const expectedSources = [
      ["collapsible-demo", "let open = $state(false)", "Order #4189"],
      ["collapsible-basic", "Product details", "Learn More"],
      ["collapsible-settings", 'aria-label="Radius X expanded"'],
      ["collapsible-file-tree", "app.tsx", '<TabsTrigger value="outline">Outline</TabsTrigger>'],
      ["collapsible-rtl", "$state<keyof typeof translations>", "הזמנה #4189"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
  })

  test("checkbox docs match Fict states, groups, table selection, keyboard, and RTL", async ({ page }) => {
    await page.goto("/docs/components/fict/checkbox")
    await waitForClientReady(page)

    const previews = page.locator(".doc-component-card:not(.doc-component-card-source)")
    const checkboxes = page.getByRole("checkbox")
    await expect(previews).toHaveCount(8)
    await expect(checkboxes).toHaveCount(21)
    await expect(previews.nth(0).locator(".doc-component-preview-stage")).toHaveCSS("height", "320px")
    for (let index = 1; index <= 6; index += 1) {
      await expect(previews.nth(index).locator(".doc-component-preview-stage")).toHaveCSS("height", "288px")
    }
    await expect(previews.nth(7).locator(".doc-component-preview-stage")).toHaveCSS("height", "384px")
    for (const checkbox of await checkboxes.all()) {
      await expect(checkbox).toHaveCSS("width", "16px")
      await expect(checkbox).toHaveCSS("height", "16px")
    }

    const demo = page.locator('[data-doc-preview-name="checkbox-demo"]')
    const demoChecks = demo.getByRole("checkbox")
    await expect(demoChecks).toHaveCount(4)
    await expect(demoChecks.nth(0)).toHaveAttribute("aria-checked", "false")
    await demo.getByText("Accept terms and conditions", { exact: true }).first().click()
    await expect(demoChecks.nth(0)).toHaveAttribute("aria-checked", "true")
    await demoChecks.nth(0).focus()
    await page.keyboard.press("Space")
    await expect(demoChecks.nth(0)).toHaveAttribute("aria-checked", "false")
    await expect(demoChecks.nth(1)).toHaveAttribute("aria-checked", "true")
    await expect(demoChecks.nth(2)).toBeDisabled()

    const invalid = page.locator('[data-doc-preview-name="checkbox-invalid"]')
    await expect(invalid.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true")
    await expect(page.locator('[data-doc-preview-name="checkbox-description"] [role="checkbox"]')).toHaveAttribute("aria-checked", "true")
    await expect(page.locator('[data-doc-preview-name="checkbox-disabled"] [role="checkbox"]')).toBeDisabled()

    const group = page.locator('[data-doc-preview-name="checkbox-group"]')
    await expect(group.getByRole("checkbox")).toHaveCount(4)
    await expect(group.getByRole("checkbox").nth(0)).toHaveAttribute("aria-checked", "true")
    await expect(group.getByRole("checkbox").nth(2)).toHaveAttribute("aria-checked", "false")

    const table = page.locator("[data-doc-checkbox-table]")
    const selectAll = table.getByRole("checkbox", { name: "Select all rows" })
    await expect(table.getByRole("checkbox")).toHaveCount(5)
    await selectAll.click()
    for (const checkbox of await table.getByRole("checkbox").all()) {
      await expect(checkbox).toHaveAttribute("aria-checked", "true")
    }
    await table.getByRole("checkbox", { name: "Select Priya Patel" }).click()
    await expect(selectAll).toHaveAttribute("aria-checked", "false")
    await expect(table.locator("tbody tr").nth(2)).not.toHaveAttribute("data-state", "selected")

    const rtl = page.locator('[data-doc-preview-name="checkbox-rtl"]')
    await expect(rtl.getByText("قبول الشروط والأحكام", { exact: true }).first()).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("he")
    await expect(rtl.getByText("קבל תנאים והגבלות", { exact: true }).first()).toBeVisible()
    await rtl.getByLabel("Preview language").selectOption("en")
    await expect(rtl.locator(".doc-checkbox-fields")).toHaveAttribute("dir", "ltr")

    const expectedSources = [
      ["checkbox-demo", '<Checkbox id="terms" />', "You can enable or disable notifications at any time."],
      ["checkbox-basic", '<Checkbox id="terms-basic" />'],
      ["checkbox-description", "defaultChecked", "terms and conditions"],
      ["checkbox-disabled", "disabled"],
      ["checkbox-invalid", 'aria-invalid="true"'],
      ["checkbox-group", "['hard-disks', 'Hard disks', true]"],
      ["checkbox-table", "let selected = $state(new Set([0]))", "checked={() => selected.has(index)}"],
      ["checkbox-rtl", "$state<keyof typeof translations>('ar')", "dir={text().dir}"],
    ] as const
    for (const [previewName, ...markers] of expectedSources) {
      const preview = page.locator(`[data-doc-preview-name="${previewName}"]`)
      await preview.getByRole("button", { name: "View Code" }).click()
      const source = preview.locator("[data-doc-preview-full-code]")
      for (const marker of markers) await expect(source).toContainText(marker)
    }
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

  test("tasks example renders the Fict data table", async ({ page }) => {
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

  test("dashboard compact layout uses the Fict responsive controls", async ({ page }) => {
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

  test("dashboard table selection and pagination match the Fict example", async ({ page }) => {
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

  test("dashboard document, user, and row action menus match Fict", async ({ page }) => {
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

  test("dashboard reviewer cells expose the Fict select control", async ({ page }) => {
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

  test("tasks title and faceted filters match the Fict table", async ({ page }) => {
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

  test("tasks selection and pagination match the Fict table", async ({ page }) => {
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

  test("tasks user menu matches the Fict account controls", async ({ page }) => {
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

  test("tasks responsive controls match the Fict breakpoints", async ({ page }) => {
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

  test("playground example matches the Fict responsive layout", async ({ page }) => {
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

  test("playground save dialog matches the Fict preset form", async ({ page }) => {
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

  test("playground code dialog matches the Fict integration example", async ({ page }) => {
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

  test("playground share popover exposes and copies the Fict preset link", async ({ page }) => {
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

  test("theme copy controls open the Fict code dialog", async ({ page }) => {
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

  test("home hear options fully clip unchecked controls", async ({ page }) => {
    await page.goto("/")
    await waitForClientReady(page)

    const uncheckedOptions = page.locator('.root-hear-option[data-checked="false"]')
    await expect(uncheckedOptions).toHaveCount(3)

    const visibleWidths = await uncheckedOptions.evaluateAll((options) =>
      options.map((option) => {
        const check = option.querySelector<HTMLElement>(".root-hear-check")
        if (!check) {
          return Number.POSITIVE_INFINITY
        }

        const optionBox = option.getBoundingClientRect()
        const checkBox = check.getBoundingClientRect()
        return Math.max(
          0,
          Math.min(optionBox.right, checkBox.right) - Math.max(optionBox.left, checkBox.left),
        )
      }),
    )
    expect(visibleWidths.every((width) => width === 0)).toBe(true)
  })

  test("home price slider thumbs match Fict in light and dark themes", async ({ page }) => {
    await page.goto("/")
    await waitForClientReady(page)

    const thumbs = page.locator(".root-field-slider .ui-slider-thumb")
    await expect(thumbs).toHaveCount(2)

    for (let index = 0; index < 2; index += 1) {
      await expect(thumbs.nth(index)).toHaveCSS("width", "12px")
      await expect(thumbs.nth(index)).toHaveCSS("height", "12px")
      await expect(thumbs.nth(index)).toHaveCSS("background-color", "rgb(255, 255, 255)")
    }

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    for (let index = 0; index < 2; index += 1) {
      await expect(thumbs.nth(index)).toHaveCSS("width", "12px")
      await expect(thumbs.nth(index)).toHaveCSS("height", "12px")
      await expect(thumbs.nth(index)).toHaveCSS("background-color", "rgb(255, 255, 255)")
    }
  })

  test("home form controls use the Fict focus ring", async ({ page }) => {
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
    await expect(submenuTrigger).toBeFocused()
    await expect(submenu.getByRole("textbox", { name: "Find knowledge" })).not.toBeFocused()
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

  test("authentication submission mirrors the Fict loading state", async ({ page }) => {
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

  test("authentication example matches the Fict responsive layout", async ({ page }) => {
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

  test("rtl example matches the Fict component gallery breakpoints", async ({ page }) => {
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

  test("rtl buttons match the Fict primitive details", async ({ page }) => {
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

  test("rtl verified item matches the Fict presentation", async ({ page }) => {
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

  test("rtl payment form matches the localized Fict controls", async ({ page }) => {
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

  test("rtl empty states match the Fict component dimensions", async ({ page }) => {
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

  test("rtl price slider matches Fict geometry and direction", async ({ page }) => {
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

  test("rtl appearance settings match Fict controls", async ({ page }) => {
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

  test("rtl prompt matches the localized Fict controls", async ({ page }) => {
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

  test("rtl terms field matches the Fict checkbox", async ({ page }) => {
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

  test("rtl referral field matches the Fict checkbox cards", async ({ page }) => {
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

    await page.getByRole("button", { name: "Vite" }).click()
    await expect(page.locator(".create-command-code")).toContainText("--template vite")
    await expect(page.locator(".create-command-code")).toContainText("--base radix")
  })
})
